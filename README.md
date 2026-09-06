# VoxGuard

> A sleek voice-authenticity checker that helps identify whether an audio recording is human or AI-generated.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Hugging%20Face](https://img.shields.io/badge/Hugging%20Face-Inference-FFD21E?logo=huggingface&logoColor=black)

## What it does

Upload a voice recording or capture one with your microphone. VoxGuard securely sends the original audio to a Cloudflare Pages Function, which requests a prediction from the Hugging Face voice-detection model. The interface displays the model's live verdict, confidence, probabilities, and processing details.

## Live app

Use VoxGuard at **[voxguard.pages.dev](https://voxguard.pages.dev/)**.

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
Cloudflare Pages Function (/api/predict)
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
| Serverless backend | Cloudflare Pages Functions |
| Inference client | `@gradio/client` |
| Model service | Hugging Face Space / Gradio API |
| Audio ML research | Python, PyTorch, TorchAudio, Wav2Vec2, AASIST, LFCC |
| Evaluation | Scikit-learn, SciPy, NumPy, Pandas, Matplotlib, Seaborn |

## Deploying the inference function

The frontend and `/api/predict` function deploy automatically to Cloudflare Pages from the `main` branch. In the Cloudflare Pages project, add an encrypted production secret named `HF_TOKEN` containing a Hugging Face access token that can call `mistralFace/voxGaurd`.

Without that secret, the function deliberately returns a configuration error instead of exposing a credential to visitors.

## API

### `POST /api/predict`

The deployed endpoint is [https://voxguard.pages.dev/api/predict](https://voxguard.pages.dev/api/predict). Send raw audio bytes with the `Content-Type` of the audio file and an `X-Audio-Filename` header. The endpoint returns the live Hugging Face model response.

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
