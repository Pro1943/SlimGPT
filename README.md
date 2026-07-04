<div align="center">

# 🧠 SlimGPT

**A custom-built GPT-style language model with a glassmorphic chat interface**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://slimgpt.vercel.app)
[![API](https://img.shields.io/badge/API-HuggingFace%20Spaces-yellow?style=for-the-badge&logo=huggingface)](https://huggingface.co/spaces/Pro1943/SlimGPT-API)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

![SlimGPT Chat UI](https://img.shields.io/badge/Built%20with-HTML%20%7C%20CSS%20%7C%20Vanilla%20JS-orange?style=for-the-badge)

</div>

---

## ✨ What is SlimGPT?

SlimGPT is a **from-scratch GPT-style transformer** trained on custom data and deployed as a serverless API on Hugging Face Spaces. This repository contains the **premium glassmorphic chat frontend** that connects to the API and lets you interact with the model in real time.

> 🚀 No frameworks, no build step — just a single `index.html` that deploys instantly on Vercel.

---

## 📸 Features

- 🌑 **Stunning dark glassmorphic UI** with animated ambient background orbs
- 💬 **Chat bubble layout** — user messages on the right, SlimGPT replies on the left
- ⚙️ **Live parameter controls** — adjust Temperature, Top-P, Top-K, Max Tokens & Repetition Penalty via smooth sliders
- ⏳ **Loading indicator** — bouncing dots with a CPU inference disclaimer
- 📡 **Real-time API health polling** — detects when the HF Space is awake/sleeping/offline
- 📥 **Export chat history** as JSON
- 📱 **Fully mobile-responsive**
- 💡 **Preset suggestion cards** to get started instantly

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐       ┌──────────────────────────────────┐
│           Frontend (Vercel)         │       │   API Backend (HF Spaces Docker) │
│                                     │       │                                  │
│  index.html                         │──────▶│  Flask  /generate  POST          │
│  • Vanilla HTML / CSS / JS          │       │  gunicorn  •  CORS enabled       │
│  • Calls HF Space API               │◀──────│  MicroGPT transformer (CPU)      │
│  • Renders chat bubbles             │       │  microgpt_v2.pkl  (180 MB LFS)   │
└─────────────────────────────────────┘       └──────────────────────────────────┘
```

---

## 🔗 API Reference

The frontend calls the SlimGPT API hosted on Hugging Face Spaces:

**Endpoint:** `POST https://pro1943-slimgpt-api.hf.space/generate`

**Request body:**
```json
{
  "prompt": "Once upon a time",
  "max_new_tokens": 150,
  "temperature": 0.7,
  "top_k": 50,
  "top_p": 0.9,
  "repetition_penalty": 1.5
}
```

**Response:**
```json
{
  "response": "Once upon a time in a kingdom far away..."
}
```

**Health check:** `GET https://pro1943-slimgpt-api.hf.space/health`
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu"
}
```

> ⚠️ The API runs on **CPU only** (HF free tier). First response takes ~15–30 seconds. Cold start after sleep may take 1–2 minutes.

---

## 🚀 Deploy Your Own

### Frontend (Vercel) — 1 click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Pro1943/SlimGPT)

### Backend (Hugging Face Spaces)

The API lives in a separate repo — see [spaces/Pro1943/SlimGPT-API](https://huggingface.co/spaces/Pro1943/SlimGPT-API).

---

## 🛠️ Local Development

No build tools needed. Just open the file:

```bash
# Clone the repo
git clone https://github.com/Pro1943/SlimGPT.git
cd SlimGPT

# Open in browser
start index.html
```

To point at a local API (optional):
```js
// In index.html, change line:
const API_BASE = "http://localhost:7860";
```

---

## 🧬 Model Details

| Property | Value |
|---|---|
| Architecture | GPT-style Causal Transformer |
| Attention | Multi-head Causal Self-Attention (Flash Attention) |
| Weight sharing | Token embedding ↔ Output head (tied weights) |
| Inference device | CPU |
| Model file | `microgpt_v2.pkl` (~180 MB) |
| Sampling | Top-K + Top-P (Nucleus) + Repetition Penalty |
| Tokenizer | HuggingFace `tokenizers` BPE |

---

## 📁 Repository Structure

```
SlimGPT/
└── index.html      # Complete single-file chat application
```

---

## 📄 License

MIT License — feel free to fork and build on top of this!

---

<div align="center">

Made with ❤️ by **Pro1943**

[🌐 Live Demo](https://slimgpt.vercel.app) • [🤗 HF Space](https://huggingface.co/spaces/Pro1943/SlimGPT-API) • [⭐ Star this repo](https://github.com/Pro1943/SlimGPT)

</div>
