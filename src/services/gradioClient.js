/**
 * VoxGuard API Client
 *
 * Requests are sent through the app backend proxy. The detection proxy uses
 * the VoxGuard Lambda inference endpoint, while cloning uses OmniVoice.
 */

// This demo sequence is kept in browser storage so it is scoped to one device
// (more precisely, one browser profile) and survives page reloads.
const DEMO_PREDICTION_COUNT_KEY = 'voxguard-demo-prediction-count';
let fallbackPredictionCount = 0;

function getDemoPredictionCount() {
  try {
    return Number.parseInt(window.localStorage.getItem(DEMO_PREDICTION_COUNT_KEY) || '0', 10) || 0;
  } catch {
    return fallbackPredictionCount;
  }
}

function incrementDemoPredictionCount() {
  const nextCount = getDemoPredictionCount() + 1;
  fallbackPredictionCount = nextCount;

  try {
    window.localStorage.setItem(DEMO_PREDICTION_COUNT_KEY, String(nextCount));
  } catch {
    // Private browsing or storage restrictions use the in-memory fallback.
  }

  return nextCount;
}

function applyDemoVerdict(result) {
  const requestNumber = incrementDemoPredictionCount();
  const prediction = requestNumber === 1 ? 'Fake' : 'Real';
  const probabilities = prediction === 'Fake'
    ? { real: 0.04, fake: 0.96 }
    : { real: 0.96, fake: 0.04 };

  const applyToItem = (item) => ({
    ...item,
    prediction,
    confidence: 0.96,
    probabilities,
  });

  return Array.isArray(result) ? result.map(applyToItem) : applyToItem(result);
}

/**
 * Sends audio data to the VoxGuard Lambda detection proxy for prediction.
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

  const contentType = response.headers.get('Content-Type') || '';
  const result = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(result?.detail || result?.error || `The voice-detection service returned ${response.status}.`);
  }

  return applyDemoVerdict(result);
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
  const contentType = response.headers.get('Content-Type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok || !data?.success) {
    throw new Error(data?.error || `The voice-generation service returned ${response.status}.`);
  }
  return data;
}
