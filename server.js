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

const DETECTION_API_URL = 'https://bv5ukkwe6acklxj476jhor5nty0ugxzz.lambda-url.ap-south-1.on.aws/predict';
const OMNIVOICE_SPACE_ID = 'k2-fsa/OmniVoice';
let omniVoiceClient = null;

function getSafeAudioFilename(headerValue) {
  try {
    const decoded = decodeURIComponent(String(headerValue || 'recording.wav'));
    const filename = decoded.split(/[\\/]/).pop().replace(/[^a-zA-Z0-9._() -]/g, '_');
    return filename || 'recording.wav';
  } catch {
    return 'recording.wav';
  }
}

async function getOmniVoiceClient() {
  if (!omniVoiceClient) {
    console.log(`[Backend] Connecting to Hugging Face Space: ${OMNIVOICE_SPACE_ID}...`);
    omniVoiceClient = await Client.connect(OMNIVOICE_SPACE_ID, { hf_token: token || undefined });
    console.log(`[Backend] Connected to ${OMNIVOICE_SPACE_ID} successfully!`);
  }
  return omniVoiceClient;
}

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Audio-Filename, X-Clone-Text, X-Reference-Text, X-Clone-Consent');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.url === '/api/health') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ status: 'ok', detectionBackend: DETECTION_API_URL, hasToken: !!token }));
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

      console.log(`[Backend] Processing ${buffer.length} bytes of audio with VoxGuard Lambda...`);
      const contentType = req.headers['content-type'] || 'audio/wav';
      const filename = getSafeAudioFilename(req.headers['x-audio-filename']);
      const audioFile = new File([buffer], filename, { type: contentType });
      const form = new FormData();
      form.append('file', audioFile, filename);
      const response = await fetch(DETECTION_API_URL, {
        method: 'POST',
        body: form,
      });
      const body = await response.arrayBuffer();
      res.statusCode = response.status;
      res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json; charset=utf-8');
      return res.end(Buffer.from(body));
    } catch (err) {
      console.error('[Backend] Prediction error from VoxGuard Lambda:', err);
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: err.message || 'Model prediction failed' }));
    }
  }

  if (req.url === '/api/clone' && req.method === 'POST') {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      const text = decodeURIComponent(String(req.headers['x-clone-text'] || '')).trim();
      const referenceText = decodeURIComponent(String(req.headers['x-reference-text'] || '')).trim();
      const consent = req.headers['x-clone-consent'] === 'true';

      if (!consent) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, error: 'Confirm that you own this voice or have permission to use it.' }));
      }
      if (!buffer.length || !text) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, error: 'A reference recording and text to synthesize are required.' }));
      }
      if (text.length > 500) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, error: 'Please keep the generated text under 500 characters.' }));
      }

      const contentType = req.headers['content-type'] || 'audio/wav';
      const filename = getSafeAudioFilename(req.headers['x-audio-filename']);
      const referenceAudio = new File([buffer], filename, { type: contentType });
      const client = await getOmniVoiceClient();
      const result = await client.predict('/_clone_fn', {
        text,
        lang: 'Auto',
        ref_aud: handle_file(referenceAudio),
        ref_text: referenceText,
        instruct: '',
        ns: 32,
        gs: 2.0,
        dn: true,
        sp: 1.0,
        du: 8,
        pp: true,
        po: true,
      });

      const [audio, status] = result.data;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, audio, status }));
    } catch (err) {
      console.error('[Backend] OmniVoice clone error:', err);
      omniVoiceClient = null;
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: err.message || 'Voice generation failed' }));
    }
  }

  res.statusCode = 404;
  res.end('Not Found');
});

const PORT = Number(process.env.PORT || 3001);
server.listen(PORT, () => {
  console.log(`[Backend] VoxGuard proxy server running at http://localhost:${PORT}`);
});
