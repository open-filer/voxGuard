import React, { useEffect, useState } from 'react';
import { AudioLines, CheckCircle2, Download, LoaderCircle, ShieldCheck, Upload } from 'lucide-react';
import { cloneOwnVoice } from '../services/gradioClient';

export default function VoiceClone() {
  const [referenceAudio, setReferenceAudio] = useState(null);
  const [text, setText] = useState('This is a private voice-cloning test generated from my own recording.');
  const [hasReferenceText, setHasReferenceText] = useState(false);
  const [referenceText, setReferenceText] = useState('');
  const [consent, setConsent] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState(null);

  useEffect(() => () => {
    if (output?.url?.startsWith('blob:')) URL.revokeObjectURL(output.url);
  }, [output]);

  const handleFile = (file) => {
    setError('');
    setOutput(null);
    if (!file || file.size === 0) {
      setError('Choose a non-empty WAV, MP3, M4A, OGG, or FLAC recording.');
      return;
    }
    setReferenceAudio(file);
  };

  const generate = async () => {
    if (!referenceAudio || !text.trim() || !consent) return;
    setGenerating(true);
    setError('');
    setOutput(null);
    try {
      const result = await cloneOwnVoice(referenceAudio, text.trim(), hasReferenceText ? referenceText.trim() : '');
      const returnedAudio = result.audio?.url || result.audio;
      if (!returnedAudio || typeof returnedAudio !== 'string') throw new Error('The generation service did not return playable audio.');
      setOutput({ url: returnedAudio, status: result.status || 'Voice generated.' });
    } catch (err) {
      setError(err.message || 'Voice generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section id="voice-clone" className="voice-clone-section">
      <div className="container">
        <div className="clone-shell">
          <div className="clone-intro">
            <span className="eyebrow"><AudioLines size={14} /> LOCAL TEST LAB</span>
            <h2>Clone <span className="gradient-text">your own voice</span></h2>
            <p>Use a clear sample of your voice to generate a short test phrase. This tool is limited to voices you own or are authorised to use.</p>
            <div className="clone-rule"><ShieldCheck size={18} /><span>Reference audio is sent only to the generation service for this request.</span></div>
          </div>

          <div className="clone-form">
            <label className="clone-upload">
              <input type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac" onChange={(event) => handleFile(event.target.files?.[0])} />
              <Upload size={20} />
              <span>{referenceAudio ? referenceAudio.name : 'Choose your voice recording'}</span>
              {referenceAudio && <small>{(referenceAudio.size / 1024).toFixed(1)} KB</small>}
            </label>

            <label className="clone-text-label" htmlFor="clone-text">Text to generate</label>
            <textarea id="clone-text" value={text} maxLength={500} onChange={(event) => setText(event.target.value)} placeholder="Write something for your voice to say." />
            <div className="clone-count">{text.length}/500</div>

            <label className="clone-reference-toggle">
              <input type="checkbox" checked={hasReferenceText} onChange={(event) => setHasReferenceText(event.target.checked)} />
              <span>Have reference text?</span>
            </label>
            {hasReferenceText && (
              <div className="clone-reference-text">
                <label className="clone-text-label" htmlFor="reference-text">Words spoken in your reference audio</label>
                <textarea id="reference-text" value={referenceText} maxLength={1000} onChange={(event) => setReferenceText(event.target.value)} placeholder="Paste or type what you said in the uploaded recording." />
                <div className="clone-count">{referenceText.length}/1000</div>
              </div>
            )}

            <label className="clone-consent">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>I confirm this is my voice or I have the speaker’s explicit permission to clone it.</span>
            </label>

            <button className="btn-primary clone-generate" disabled={!referenceAudio || !text.trim() || !consent || generating} onClick={generate}>
              {generating ? <LoaderCircle size={18} className="spin-icon" /> : <AudioLines size={18} />}
              <span>{generating ? 'Generating voice…' : 'Generate my voice'}</span>
            </button>

            {error && <div className="clone-error">{error}</div>}
            {output && (
              <div className="clone-output">
                <div><CheckCircle2 size={18} /><span>{output.status}</span></div>
                <audio controls src={output.url} />
                <a className="btn-secondary clone-download" href={output.url} download="my-voice-clone.wav"><Download size={16} /> Download audio</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
