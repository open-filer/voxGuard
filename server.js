import http from 'http';
import fs from 'fs';
import { Client, handle_file } from '@gradio/client';

// Extract token from .env
let token = process.env.HF_TOKEN || '';
if (!token && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  const match = envContent.match(/HF_TOKEN=(hf_\w+)/);
  if (match) token = match[1];
}

const SPACE_ID = 'mistralFace/voxGaurd';
let hfClient = null;

function getSafeAudioFilename(headerValue) {
  try {
    const decoded = decodeURIComponent(String(headerValue || 'recording.wav'));
    const filename = decoded.split(/[\\/]/).pop().replace(/[^a-zA-Z0-9._() -]/g, '_');
    return filename || 'recording.wav';
  } catch {
    return 'recording.wav';
  }
}

async function getClient() {
  if (!hfClient) {
    console.log(`[Backend] Connecting to Hugging Face Space: ${SPACE_ID}...`);
    hfClient = await Client.connect(SPACE_ID, { hf_token: token });
    console.log(`[Backend] Connected to ${SPACE_ID} successfully!`);
  }
  return hfClient;
}

// Pre-warm connection
getClient().catch((err) => {
  console.warn('[Backend] Initial HF connection notice:', err.message);
});

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Audio-Filename');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.url === '/api/health') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ status: 'ok', space: SPACE_ID, hasToken: !!token }));
  }

  if (req.url === '/api/predict' && req.method === 'POST') {
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      if (!buffer || buffer.length === 0) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, error: 'No audio data received' }));
      }

      console.log(`[Backend] Processing ${buffer.length} bytes of audio with Hugging Face model...`);
      const contentType = req.headers['content-type'] || 'audio/wav';
      const filename = getSafeAudioFilename(req.headers['x-audio-filename']);
      const audioFile = new File([buffer], filename, { type: contentType });

      const client = await getClient();
      const result = await client.predict('/predict', {
        audio_path: handle_file(audioFile),
      });

      console.log('[Backend] Real Hugging Face result received:', JSON.stringify(result.data));

      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, data: result.data }));
    } catch (err) {
      console.error('[Backend] Prediction error from Hugging Face Space:', err);
      hfClient = null; // reset cache on error
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: err.message || 'Model prediction failed' }));
    }
  }

  res.statusCode = 404;
  res.end('Not Found');
});

const PORT = Number(process.env.PORT || 3001);
server.listen(PORT, () => {
  console.log(`[Backend] HF Proxy Server running at http://localhost:${PORT}`);
});
