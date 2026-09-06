# VoxGuard

> A sleek voice-authenticity checker that helps identify whether an audio recording is human or AI-generated.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Hugging%20Face](https://img.shields.io/badge/Hugging%20Face-Inference-FFD21E?logo=huggingface&logoColor=black)

## What it does

Upload a voice recording or capture one with your microphone. VoxGuard securely sends the original audio to a server-side proxy, which requests a prediction from the Hugging Face voice-detection model. The interface displays the model's live verdict, confidence, probabilities, and processing details.

> Results are model predictions, not guarantees. Always use human review for high-stakes decisions.

## Highlights

- Upload WAV, MP3, M4A, OGG, and other browser-supported audio formats
- Record directly from the browser
- Live Hugging Face inference — no hardcoded verdicts
- Server-side token handling; the Hugging Face credential never reaches the browser
- Displays real/fake probabilities, confidence, clip duration, inference windows, and latency
- Responsive React interface with a clean, accessible visual design

## Architecture

```text
Browser (React + Vite)
        │ original audio bytes + MIME type + filename
        ▼
Node.js API proxy (/api/predict)
        │ authenticated inference request
        ▼
Hugging Face Space (mistralFace/voxGaurd)
        │ prediction JSON
        ▼
VoxGuard result screen
```

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, Vite 6, custom CSS |
| UI details | Lucide React, Canvas Confetti |
| Backend | Node.js native HTTP server |
| Inference client | `@gradio/client` |
| Model service | Hugging Face Space / Gradio API |
| Audio ML research | Python, PyTorch, TorchAudio, Wav2Vec2, AASIST, LFCC |
| Evaluation | Scikit-learn, SciPy, NumPy, Pandas, Matplotlib, Seaborn |

## Run locally

### Prerequisites

- Node.js 20 or later
- A Hugging Face access token that can use the configured Space

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your token

Create a `.env` file in the project root:

```env
HF_TOKEN=your_hugging_face_token
```

Never commit this file or share your token.

### 3. Start VoxGuard

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The frontend runs on port `5173`; its local API proxy forwards inference calls to the Node server on port `3001`.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the backend proxy and Vite frontend together |
| `npm run server` | Start only the Node.js API proxy |
| `npm run client` | Start only the Vite frontend |
| `npm run build` | Create a production frontend build |
| `npm run preview` | Preview the production frontend build |

## API

### `POST /api/predict`

Send raw audio bytes with the `Content-Type` of the audio file and an `X-Audio-Filename` header. The endpoint returns the live Hugging Face model response.

```json
{
  "success": true,
  "data": [
    {
      "prediction": "Real",
      "confidence": 0.96,
      "probabilities": { "real": 0.96, "fake": 0.04 },
      "metrics": {
        "duration_seconds": 6.8,
        "windows_analyzed": 2,
        "latency_ms": 540
      }
    }
  ]
}
```

## Responsible use

Voice-authenticity detection models can make mistakes, especially across languages, recording conditions, codecs, and unseen voice-generation systems. Treat every output as a decision-support signal, not proof.

## License

Add a license before distributing or reusing this project publicly.
