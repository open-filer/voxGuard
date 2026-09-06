/**
 * Sends the original audio bytes to the server-side Hugging Face proxy.
 * Keeping the Hugging Face credential on the server prevents a browser token
 * from leaking and ensures every browser uses the same inference path.
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
