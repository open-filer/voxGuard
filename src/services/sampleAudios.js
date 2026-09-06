/**
 * Real Audio Samples fetched directly from public sources
 */

export const PRESET_SAMPLES = [
  {
    id: 'sample-gradio-wav',
    title: 'Gradio Test Audio Sample',
    subtitle: 'Standard 16kHz speech sample (audio_sample.wav)',
    url: 'https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/audio_sample.wav',
    filename: 'audio_sample.wav'
  },
  {
    id: 'sample-speech-2',
    title: 'Mozilla Common Voice Sample',
    subtitle: 'Real human speech recording (.wav)',
    url: 'https://actions.google.com/sounds/v1/speech/person_speaking.ogg',
    filename: 'person_speaking.ogg'
  }
];

export async function fetchSampleAudio(sample) {
  console.log(`[Audio Sample] Fetching real audio from: ${sample.url}`);
  const response = await fetch(sample.url);
  if (!response.ok) {
    throw new Error(`Failed to download sample audio from ${sample.url}`);
  }
  const blob = await response.blob();
  blob.name = sample.filename;
  return blob;
}
