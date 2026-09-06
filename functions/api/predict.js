import { Client, handle_file } from "@gradio/client";

const SPACE_ID = "mistralFace/voxGaurd";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function getSafeFilename(value) {
  try {
    const decoded = decodeURIComponent(value || "recording.wav");
    const filename = decoded.split(/[\\/]/).pop().replace(/[^a-zA-Z0-9._() -]/g, "_");
    return filename || "recording.wav";
  } catch {
    return "recording.wav";
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Audio-Filename",
    },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.HF_TOKEN) {
    return json({ success: false, error: "Inference service is not configured" }, 503);
  }

  const audio = await request.arrayBuffer();
  if (!audio.byteLength) {
    return json({ success: false, error: "No audio data received" }, 400);
  }

  const filename = getSafeFilename(request.headers.get("X-Audio-Filename"));
  const contentType = request.headers.get("Content-Type") || "audio/wav";

  try {
    const audioFile = new File([audio], filename, { type: contentType });
    const client = await Client.connect(SPACE_ID, { hf_token: env.HF_TOKEN });
    const result = await client.predict("/predict", {
      audio_path: handle_file(audioFile),
    });

    return json({ success: true, data: result.data });
  } catch (error) {
    console.error("Hugging Face inference failed", error);
    return json(
      { success: false, error: error instanceof Error ? error.message : "Model prediction failed" },
      502,
    );
  }
}
