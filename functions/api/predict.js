const DETECTION_API_URL = "https://bv5ukkwe6acklxj476jhor5nty0ugxzz.lambda-url.ap-south-1.on.aws/predict";

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

export async function onRequestPost({ request }) {
  const audio = await request.arrayBuffer();
  if (!audio.byteLength) {
    return json({ success: false, error: "No audio data received" }, 400);
  }

  const filename = getSafeFilename(request.headers.get("X-Audio-Filename"));
  const contentType = request.headers.get("Content-Type") || "audio/wav";

  try {
    const audioFile = new File([audio], filename, { type: contentType });
    const form = new FormData();
    form.append("file", audioFile, filename);
    const response = await fetch(DETECTION_API_URL, {
      method: "POST",
      body: form,
    });
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Lambda inference failed", error);
    return json(
      { error: error instanceof Error ? error.message : "Model prediction failed" },
      502,
    );
  }
}
