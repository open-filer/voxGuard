import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Mic, Square, Play, Pause, AlertTriangle, 
  CheckCircle2, RefreshCw, Sparkles, Volume2, 
  FileAudio, Shield, Lock, Activity, ArrowRight, Zap, Code
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { predictAudio } from '../services/gradioClient';
import { PRESET_SAMPLES, fetchSampleAudio } from '../services/sampleAudios';

function audioBufferToWav(audioBuffer) {
  const channelCount = 1;
  const samples = audioBuffer.getChannelData(0);
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeText = (offset, value) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeText(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, audioBuffer.sampleRate, true);
  view.setUint32(28, audioBuffer.sampleRate * channelCount * bytesPerSample, true);
  view.setUint16(32, channelCount * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeText(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += bytesPerSample;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export default function AudioDetector() {
  const [activeTab, setActiveTab] = useState('upload');
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingSample, setLoadingSample] = useState(false);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [apiResult, setApiResult] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const audioPlayerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [audioUrl]);

  // Handle Drag & Drop / File Input
  const handleFileChange = (file) => {
    if (!file) return;
    setErrorMsg(null);
    setApiResult(null);
    if (file.size === 0) {
      setErrorMsg('This audio file is empty. Please choose a recording with sound.');
      return;
    }
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Load Real Sample Audio
  const handleSelectSample = async (sample) => {
    setErrorMsg(null);
    setApiResult(null);
    setLoadingSample(true);
    try {
      const blob = await fetchSampleAudio(sample);
      setAudioFile(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      console.error("Error loading sample audio:", err);
      setErrorMsg(`Failed to load ${sample.title}: ${err.message}`);
    } finally {
      setLoadingSample(false);
    }
  };

  // Start Microphone Recording
  const startRecording = async () => {
    setErrorMsg(null);
    setApiResult(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      visualizeMicrophone(analyser);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const recordedBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType || 'audio/webm',
          });

          if (recordedBlob.size === 0) {
            throw new Error('No audio was captured.');
          }

          // MediaRecorder commonly returns WebM/Opus on mobile. Decode it in the
          // browser and create a real WAV file before sending it to soundfile.
          const decodedAudio = await audioCtx.decodeAudioData(await recordedBlob.arrayBuffer());
          const audioBlob = audioBufferToWav(decodedAudio);
          audioBlob.name = `microphone_recording_${Date.now()}.wav`;
          setAudioFile(audioBlob);
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
        } catch (err) {
          console.error('Microphone recording conversion error:', err);
          setErrorMsg('The recording could not be converted to WAV. Please record again or upload a WAV/MP3 file.');
        } finally {
          stream.getTracks().forEach((track) => track.stop());
          if (audioCtx.state !== 'closed') audioCtx.close();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setErrorMsg("Microphone permission was denied or not supported on this browser.");
    }
  };

  // Stop Microphone Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Visualizer loop for canvas
  const visualizeMicrophone = (analyser) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.2;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

        const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#7c6daa');
        gradient.addColorStop(1, '#9b8ec4');

        canvasCtx.fillStyle = gradient;
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, 3);
        canvasCtx.fill();

        x += barWidth + 1;
      }
    };

    draw();
  };

  // Run Real Hugging Face API Prediction
  const handleAnalyze = async () => {
    if (!audioFile) {
      setErrorMsg("Please upload an audio file or record speech first.");
      return;
    }

    setAnalyzing(true);
    setProgressStatus("Connecting to mistralFace/voxGaurd API...");
    setErrorMsg(null);

    try {
      const rawData = await predictAudio(audioFile);
      const item = Array.isArray(rawData) ? rawData[0] : rawData;
      if (item?.error) {
        throw new Error(item.error);
      }
      if (!item?.prediction || !item?.probabilities) {
        throw new Error('The voice-detection service returned an invalid response.');
      }

      setApiResult(rawData);

      if (item && item.prediction && item.prediction.toLowerCase() === 'real') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10B981', '#9b8ec4', '#7c6daa']
        });
      }
    } catch (err) {
      console.error("API call failure:", err);
      setErrorMsg(`API Error from mistralFace/voxGaurd: ${err.message || String(err)}`);
    } finally {
      setAnalyzing(false);
      setProgressStatus('');
    }
  };

  // Reset all
  const handleReset = () => {
    setAudioFile(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setApiResult(null);
    setErrorMsg(null);
    setIsRecording(false);
    setRecordSeconds(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  // Parse item strictly from API response
  const resultItem = apiResult ? (Array.isArray(apiResult) ? apiResult[0] : apiResult) : null;
  const isFake = resultItem?.prediction?.toLowerCase() === 'fake';
  const confidencePercent = resultItem?.confidence ? +(resultItem.confidence <= 1 ? resultItem.confidence * 100 : resultItem.confidence).toFixed(1) : null;
  const realProb = resultItem?.probabilities?.real !== undefined ? +(resultItem.probabilities.real <= 1 ? resultItem.probabilities.real * 100 : resultItem.probabilities.real).toFixed(1) : null;
  const fakeProb = resultItem?.probabilities?.fake !== undefined ? +(resultItem.probabilities.fake <= 1 ? resultItem.probabilities.fake * 100 : resultItem.probabilities.fake).toFixed(1) : null;

  return (
    <section
      id="detector"
      style={{
        position: 'relative',
        padding: '50px 0 80px',
        scrollMarginTop: '60px',
      }}
    >
      <div className="container">
        {/* Minimal Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 28px' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)', marginBottom: '8px' }}>
            Check If Voice Is <span className="gradient-text">Real or AI</span>
          </h2>
          <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)' }}>
            Direct inference via Hugging Face Space <code>mistralFace/voxGaurd</code>.
          </p>
        </div>

        {/* Main Detector Card */}
        <div
          className="glass-card"
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            padding: '32px',
            borderRadius: 'var(--radius-xl)',
            position: 'relative',
            border: '1.5px solid var(--border-subtle)',
          }}
        >
          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              background: 'rgba(236, 232, 249, 0.6)',
              padding: '5px',
              borderRadius: 'var(--radius-full)',
              maxWidth: '340px',
              margin: '0 auto 28px',
            }}
          >
            <button
              onClick={() => {
                setActiveTab('upload');
                if (isRecording) stopRecording();
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: activeTab === 'upload' ? '#FFFFFF' : 'var(--text-secondary)',
                background: activeTab === 'upload' ? 'linear-gradient(135deg, var(--primary-soft-purple) 0%, var(--primary-lavender) 100%)' : 'transparent',
                boxShadow: activeTab === 'upload' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition-fast)',
              }}
            >
              <Upload size={15} />
              <span>Upload Audio</span>
            </button>

            <button
              onClick={() => setActiveTab('mic')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: activeTab === 'mic' ? '#FFFFFF' : 'var(--text-secondary)',
                background: activeTab === 'mic' ? 'linear-gradient(135deg, var(--primary-soft-purple) 0%, var(--primary-lavender) 100%)' : 'transparent',
                boxShadow: activeTab === 'mic' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition-fast)',
              }}
            >
              <Mic size={15} />
              <span>Record Live</span>
            </button>
          </div>

          {/* TAB 1: FILE UPLOAD ZONE */}
          {activeTab === 'upload' && !audioFile && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('audio-upload-input').click()}
              style={{
                border: '2px dashed var(--primary-lavender)',
                borderRadius: 'var(--radius-lg)',
                padding: '42px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.65)',
                transition: 'var(--transition-smooth)',
              }}
            >
              <input
                id="audio-upload-input"
                type="file"
                accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e.target.files[0])}
              />

              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--primary-lavender-ultra-light)',
                  color: 'var(--primary-soft-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                }}
              >
                <Upload size={24} />
              </div>

              <h4 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>
                Drop audio recording here
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                WAV, MP3, M4A, OGG
              </p>
              <span className="btn-secondary" style={{ padding: '7px 18px', fontSize: '0.82rem' }}>
                Browse Files
              </span>
            </div>
          )}

          {/* TAB 2: LIVE MICROPHONE RECORDER */}
          {activeTab === 'mic' && !audioFile && (
            <div
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 24px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.75)',
              }}
            >
              {!isRecording ? (
                <div>
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary-soft-purple) 0%, var(--primary-lavender) 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      cursor: 'pointer',
                      boxShadow: '0 8px 20px rgba(124, 109, 170, 0.35)',
                    }}
                    onClick={startRecording}
                  >
                    <Mic size={28} />
                  </div>

                  <h4 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>
                    Record Speech / Speaker Call
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 18px' }}>
                    Speak into your microphone or play incoming audio.
                  </p>
                  <button
                    onClick={startRecording}
                    className="btn-primary"
                    style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                  >
                    <Mic size={16} />
                    <span>Start Recording</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--status-fake)',
                      fontWeight: 700,
                      marginBottom: '14px',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--status-fake)',
                        animation: 'ambientGlow 1s infinite alternate',
                      }}
                    />
                    <span>RECORDING LIVE ({recordSeconds}s)</span>
                  </div>

                  <div style={{ margin: '10px 0 18px' }}>
                    <canvas
                      ref={canvasRef}
                      width={440}
                      height={80}
                      style={{
                        width: '100%',
                        maxWidth: '440px',
                        height: '80px',
                        background: 'rgba(245, 243, 255, 0.9)',
                        borderRadius: '10px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    />
                  </div>

                  <button
                    onClick={stopRecording}
                    className="btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)',
                      boxShadow: '0 8px 18px -4px rgba(244, 63, 94, 0.4)',
                    }}
                  >
                    <Square size={16} />
                    <span>Stop Recording</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AUDIO LOADED & SUBMIT */}
          {audioFile && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: 'var(--primary-lavender-ultra-light)',
                      color: 'var(--primary-soft-purple)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileAudio size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {audioFile.name || 'Microphone_Captured_Audio.wav'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {audioFile.size ? `${(audioFile.size / 1024).toFixed(1)} KB` : 'Recorded stream'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Clear</span>
                </button>
              </div>

              {audioUrl && (
                <div style={{ marginBottom: '18px' }}>
                  <audio
                    ref={audioPlayerRef}
                    src={audioUrl}
                    controls
                    style={{ width: '100%', height: '36px', borderRadius: '6px' }}
                  />
                </div>
              )}

              {!apiResult && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '0.98rem',
                    opacity: analyzing ? 0.75 : 1,
                  }}
                >
                  {analyzing ? (
                    <>
                      <RefreshCw size={18} style={{ animation: 'spinSlow 2s linear infinite' }} />
                      <span>{progressStatus || 'Querying mistralFace/voxGaurd...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Evaluate with mistralFace/voxGaurd API</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* REAL AUDIO SAMPLES (NO SYNTHETIC WAVES) */}
          <div
            style={{
              marginTop: '22px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              <Zap size={14} color="var(--primary-soft-purple)" />
              <span>Test with real sample audio files:</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '10px',
              }}
            >
              {PRESET_SAMPLES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => !loadingSample && handleSelectSample(sample)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.75)',
                    border: '1px solid var(--border-subtle)',
                    cursor: loadingSample ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-soft-purple)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>
                      {sample.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {sample.subtitle}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(155, 142, 196, 0.15)',
                      color: 'var(--primary-soft-purple-dark)',
                    }}
                  >
                    {loadingSample ? 'Loading...' : 'Load'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* REAL HUGGING FACE VERDICT CARD (EXACT API VALUES ONLY) */}
          {resultItem && (
            <div
              style={{
                marginTop: '28px',
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                background: isFake ? 'var(--status-fake-bg)' : 'var(--status-real-bg)',
                border: `2px solid ${isFake ? 'rgba(244, 63, 94, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                animation: 'fadeIn 0.3s ease-out',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: isFake ? 'var(--status-fake)' : 'var(--status-real)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 6px 16px ${isFake ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                    }}
                  >
                    {isFake ? <AlertTriangle size={28} /> : <CheckCircle2 size={28} />}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: isFake ? 'var(--status-fake)' : 'var(--status-real)',
                      }}
                    >
                      API PREDICTION RESULT
                    </div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {resultItem.prediction}
                    </h3>
                  </div>
                </div>

                {/* Direct Confidence from API */}
                <div
                  style={{
                    background: '#FFFFFF',
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    API CONFIDENCE
                  </div>
                  <div
                    style={{
                      fontSize: '1.65rem',
                      fontWeight: 800,
                      color: isFake ? 'var(--status-fake)' : 'var(--status-real)',
                    }}
                  >
                    {confidencePercent !== null ? `${confidencePercent}%` : `${resultItem.confidence}`}
                  </div>
                </div>
              </div>

              {/* Exact Probabilities and Audio Details from API */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>API Probability: Real</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: 'var(--status-real)' }}>
                    {realProb !== null ? `${realProb}%` : String(resultItem.probabilities?.real)}
                  </div>
                  {realProb !== null && (
                    <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${realProb}%`, height: '100%', background: 'var(--status-real)' }} />
                    </div>
                  )}
                </div>

                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>API Probability: Fake</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: 'var(--status-fake)' }}>
                    {fakeProb !== null ? `${fakeProb}%` : String(resultItem.probabilities?.fake)}
                  </div>
                  {fakeProb !== null && (
                    <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${fakeProb}%`, height: '100%', background: 'var(--status-fake)' }} />
                    </div>
                  )}
                </div>

                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>API Audio Metrics</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: '6px', color: 'var(--text-main)' }}>
                    {resultItem.metrics?.duration_seconds ? `${resultItem.metrics.duration_seconds}s duration` : (resultItem.audio_details?.duration_seconds ? `${resultItem.audio_details.duration_seconds}s duration` : 'Full File')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {resultItem.metrics?.windows_analyzed || resultItem.audio_details?.windows_analyzed || 1} window(s)
                    {resultItem.metrics?.latency_ms ? ` • ${resultItem.metrics.latency_ms}ms latency` : ''}
                  </div>
                </div>
              </div>

              {/* Toggle to view raw Gradio JSON */}
              <div style={{ marginBottom: '14px' }}>
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--primary-soft-purple-dark)',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <Code size={14} />
                  <span>{showRawJson ? 'Hide Raw API JSON' : 'View Raw API Response (JSON)'}</span>
                </button>

                {showRawJson && (
                  <pre
                    style={{
                      marginTop: '8px',
                      padding: '12px',
                      borderRadius: '8px',
                      background: '#1C1628',
                      color: '#A7F3D0',
                      fontSize: '0.76rem',
                      overflowX: 'auto',
                      fontFamily: 'monospace',
                    }}
                  >
                    {JSON.stringify(apiResult, null, 2)}
                  </pre>
                )}
              </div>

              {/* Action */}
              <button
                onClick={handleReset}
                className="btn-secondary"
                style={{ width: '100%', padding: '10px 18px', fontSize: '0.88rem' }}
              >
                <RefreshCw size={14} />
                <span>Test Another Audio</span>
              </button>
            </div>
          )}

          {/* Error Notice */}
          {errorMsg && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'var(--status-fake-bg)',
                color: 'var(--status-fake)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.86rem',
                border: '1px solid rgba(244, 63, 94, 0.2)',
              }}
            >
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Direct API Info Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '20px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <Lock size={12} />
            <span>Endpoint: <code>mistralFace/voxGaurd/predict</code></span>
          </div>
        </div>
      </div>
    </section>
  );
}
