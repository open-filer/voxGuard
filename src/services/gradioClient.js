/**
 * VoxGuard API Client
 *
 * This service communicates with the secure backend proxy. Credentials are held
 * only in the backend environment and are never sent to the browser.
 */

/**
 * Sends audio data to the backend proxy for prediction.
 * @param {Blob|File} audioBlobOrFile - The audio data to analyze.
 * @returns {Promise<Object>} The prediction result from the model.
 */
export async function predictAudio(audioBlobOrFile) {
  const filename = audioBlobOrFile.name || "recording.wav";

  const response = await fetch("/api/predict", {
    method: "POST",
    body: audioBlobOrFile,
    headers: {
      "Content-Type": audioBlobOrFile.type || "audio/wav",
      "X-Audio-Filename": encodeURIComponent(filename),
    },
  });

  const bridgeData = await response.json();

  if (!response.ok || !bridgeData.success) {
    throw new Error(bridgeData.error || "Failed to query the voice-detection service");
  }

  return bridgeData.data;
}

export async function cloneOwnVoice(referenceAudio, text, referenceText = '') {
  const response = await fetch('/api/clone', {
    method: 'POST',
    body: referenceAudio,
    headers: {
      'Content-Type': referenceAudio.type || 'audio/wav',
      'X-Audio-Filename': encodeURIComponent(referenceAudio.name || 'my-voice.wav'),
      'X-Clone-Text': encodeURIComponent(text),
      'X-Reference-Text': encodeURIComponent(referenceText),
      'X-Clone-Consent': 'true',
    },
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Voice generation failed');
  }
  return data;
}
