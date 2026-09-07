import { Client, handle_file } from "@gradio/client";

const SPACE_ID = "k2-fsa/OmniVoice";

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
    const decoded = decodeURIComponent(value || "my-voice.wav");
    const filename = decoded.split(/[\\/]/).pop().replace(/[^a-zA-Z0-9._() -]/g, "_");
    return filename || "my-voice.wav";
  } catch {
    return "my-voice.wav";
  }
}

function decodeHeader(value) {
  try {
    return decodeURIComponent(value || "").trim();
  } catch {
    return "";
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Audio-Filename, X-Clone-Text, X-Reference-Text, X-Clone-Consent",
    },
  });
}

export async function onRequestPost({ request, env }) {
  const consent = request.headers.get("X-Clone-Consent") === "true";
  const text = decodeHeader(request.headers.get("X-Clone-Text"));
  const referenceText = decodeHeader(request.headers.get("X-Reference-Text"));
  const audio = await request.arrayBuffer();

  if (!consent) return json({ success: false, error: "Confirm that you own this voice or have permission to use it." }, 400);
  if (!audio.byteLength || !text) return json({ success: false, error: "A reference recording and text to synthesize are required." }, 400);
  if (text.length > 500) return json({ success: false, error: "Please keep the generated text under 500 characters." }, 400);

  try {
    const filename = getSafeFilename(request.headers.get("X-Audio-Filename"));
    const contentType = request.headers.get("Content-Type") || "audio/wav";
    const referenceAudio = new File([audio], filename, { type: contentType });
    const client = await Client.connect(SPACE_ID, { hf_token: env.HF_TOKEN || undefined });
    const result = await client.predict("/_clone_fn", {
      text,
      lang: "Auto",
      ref_aud: handle_file(referenceAudio),
      ref_text: referenceText,
      instruct: "",
      ns: 32,
      gs: 2.0,
      dn: true,
      sp: 1.0,
      du: 8,
      pp: true,
      po: true,
    });

    const [audioOutput, status] = result.data;
    return json({ success: true, audio: audioOutput, status: status || "Voice generated." });
  } catch (error) {
    console.error("OmniVoice generation failed", error);
    return json(
      { success: false, error: error instanceof Error ? error.message : "Voice generation failed" },
      502,
    );
  }
}
