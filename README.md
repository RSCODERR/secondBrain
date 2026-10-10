<div align="center">

# 🧠 Second Brain

### An AI-Augmented Personal Knowledge Hub & Digital Memory Assistant

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)

<br />

**Capture links, tweets, YouTube videos, and rich markdown notes in one unified space — then query, summarize, and semantically search your memories using multi-model AI.**

[Explore Live Demo](https://second-brain-eight-delta.vercel.app) • [Report Bug](https://github.com/RSCODERR/secondBrain/issues) • [Request Feature](https://github.com/RSCODERR/secondBrain/issues)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🤖 AI Architecture & Capabilities](#-ai-architecture--capabilities)
- [🏗 System Architecture](#-system-architecture)
- [🛠 Tech Stack](#-tech-stack)
- [🚀 Quick Start (Local Development)](#-quick-start-local-development)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [🔐 Environment Variables](#-environment-variables)
- [📡 API Reference](#-api-reference)
- [🛡 API Rate Limiting (Redis)](#-api-rate-limiting-redis)
- [🌐 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Overview

Modern knowledge workers encounter hundreds of articles, video tutorials, tweets, and ideas every day. Traditional bookmarking tools turn into digital graveyards where information is saved and forgotten.

**Second Brain** bridges that gap. It gives you a fast, responsive card-based dashboard to save content across formats, coupled with **an AI agent that has full context over your personal knowledge base**. You can search by conceptual meaning, auto-generate tags, summarize long articles/videos, and chat directly with your second brain.

---

## ✨ Key Features

### 🗂 Multi-Format Memory Cards
- **YouTube Embeds:** Plays YouTube videos directly inside cards with responsive responsive iframes.
- **Twitter / X Widgets:** Embeds native tweets dynamically with light/dark theme adaptation.
- **Rich Markdown Notes:** Full GFM support, live checkbox task lists (`- [x] Done`), code syntax highlighting, and LaTeX math formulas (`KaTeX`).
- **Web Bookmarks:** Clean preview cards with hostname parsing and quick-open actions.

### 🔍 Dual-Mode Search & Command Palette
- **Instant Keyword Search:** Real-time client-side search across titles, notes, and `#tags`.
- **✨ AI Semantic Search:** Searches memories conceptually (e.g. searching *"clean architecture"* surfaces cards discussing *"SOLID principles"* or *"domain-driven design"*), complete with relevance scoring and conceptual match explanations.
- **Command Palette (`Ctrl + K` / `Cmd + K`):** Global spotlight search to switch views, trigger AI searches, or toggle filters from anywhere.

### 🏷 Intelligent Tag Management & Garbage Collection
- Multi-tag selection and filtering with live usage counts in the sidebar.
- **Auto-Cleanup / Garbage Collection:** When cards are deleted or modified, tags that reach 0 references are automatically purged from the MongoDB database, keeping storage lean while safely preserving multi-use tags.

### 📌 Organization & Sharing
- **Favorites / Pinning:** Pin essential notes to the top of your dashboard.
- **Shareable Brain Links:** Generate secure read-only public links to share curated collections of your notes with others.
- **Dark / Light Mode:** Built-in theme switcher with high-contrast glassmorphic emerald aesthetics.

---

## 🤖 AI Architecture & Capabilities

Second Brain implements a **4-tier zero-downtime AI cascade** using `openai` SDK compatible endpoints. If any provider hits a rate limit or exhausts quota, requests transparently roll over to the next provider:

```
                  ┌─────────────────────────────────┐
                  │        Incoming AI Task         │
                  │ (Chat, Summarize, Tags, Search) │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                   [ 1. Groq - Qwen 2.5 32B ]
                     ⚡ Ultra-fast (~300ms)
                                   │ (Fallback on error)
                                   ▼
                 [ 2. Google Gemini 2.5 Flash ]
                     🎯 High-precision backup
                                   │ (Fallback on error)
                                   ▼
                    [ 3. DeepSeek Chat V3 ]
                     🧠 Deep contextual reasoning
                                   │ (Fallback on error)
                                   ▼
                  [ 4. Groq - Llama 3.3 70B ]
                     🛡️ High-capacity safety net
```

### 1. 💬 AI Chat Drawer (`Ask Brain`)
- Slide-over floating chat drawer with quick-starter suggestions.
- Answers user queries by grounding responses in the user's saved memories.
- Displays clickable citation pills (`[Item 1: Clean Architecture]`) that highlight matching cards.

### 2. ✨ Card Summarizer
- Dedicated **"Summarize"** button in each card toolbar.
- Expands an inline AI drawer summarizing long videos, tweet threads, or markdown notes into high-signal takeaways with one-click copy.

### 3. 🏷 AI Smart Auto-Tagging
- Inside Create and Edit modals, click **"✨ Auto-suggest tags"**.
- Inspects content context and suggests relevant tags while staying aligned with your existing taxonomy.

### 4. 🧠 Semantic Conceptual Search
- Moves beyond rigid string matching. Evaluates thematic intent and orders results by relevance score (0.5 – 1.0) with an explanation badge on each card.

---

## 🏗 System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (React 19)                  │
│       Vite • Tailwind CSS v4 • React Router v7         │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST + Cookies
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Backend (Express 5)                   │
│          TypeScript • JWT Auth • Zod Validation        │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│     MongoDB Database      │ │   Multi-Provider AI      │
│  - Users (bcrypt hashed)  │ │  - Groq (Qwen / Llama)   │
│  - Contents (indexed)     │ │  - Google Gemini         │
│  - Tags (auto-cleaned)    │ │  - DeepSeek Chat         │
│  - Links (shareable)      │ └──────────────────────────┘
└───────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Description |
| :--- | :--- |
| **React 19** | Modern component architecture & hooks |
| **TypeScript** | Type-safe state and API interfaces |
| **Vite 7** | Fast build tooling and HMR |
| **Tailwind CSS v4** | Next-gen CSS framework with OKLCH emerald themes |
| **React Markdown + GFM** | GitHub-flavored markdown with task lists |
| **KaTeX** | Fast math typesetting in notes |
| **Axios** | HTTP client with credential support |

### Backend
| Technology | Description |
| :--- | :--- |
| **Node.js & Express 5** | RESTful API server |
| **MongoDB & Mongoose 9** | NoSQL document database with schemas |
| **JSON Web Tokens (JWT)** | Secure authentication via `httpOnly` cookies |
| **Bcrypt** | Password hashing with salt rounds |
| **Zod** | Runtime request body schema validation |
| **Brevo API (Mailer)** | Transactional emails for OTP verification & password reset |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** $\ge$ 18.x
- **npm** $\ge$ 9.x
- **MongoDB** instance (Local or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

### 1. Clone Repository

```bash
git clone https://github.com/RSCODERR/secondBrain.git
cd secondBrain
```

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env   # Or create .env manually
```

Populate `backend/.env` with your credentials:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_here

# Email (Brevo HTTP API for OTP verification and password reset)
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM_NAME="Second Brain"
EMAIL_FROM_ADDRESS="your-verified-email@example.com"

# AI Multi-Provider API Keys
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Build and run the backend:

```bash
# Development mode with hot-reload
npm run dev

# Or build and run production bundle
npm run build
npm start
```

Backend will start on `http://localhost:3000`.

---

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Frontend will be accessible at `http://localhost:5173` (or `http://localhost:5174`).

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| :--- | :---: | :--- |
| `PORT` | Optional | Server port (defaults to `3000`) |
| `MONGODB_URI` | **Yes** | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | **Yes** | Secret string for signing authentication tokens |
| `GROQ_API_KEY` | Recommended | Groq Cloud API key (Qwen 2.5 32B & Llama 3.3 70B) |
| `GEMINI_API_KEY`| Recommended | Google AI Studio Gemini API key |
| `DEEPSEEK_API_KEY`| Optional | DeepSeek API key for 3rd-tier failover |
| `BREVO_API_KEY` | Optional | Brevo API key for sending verification/reset emails |
| `EMAIL_FROM_ADDRESS` | Optional | Sender email address registered on Brevo |
| `REDIS_URL` | **Yes** | Redis connection URI (supports standard Redis, Upstash, or Redis Cloud) |
| `TRUST_PROXY` | Optional | Reverse proxy hop count (defaults to `1` in production for Render/Vercel) |
| `RATE_LIMIT_LOGIN_MAX` | Optional | Max requests for `/signin` per window (defaults to `10`) |
| `RATE_LIMIT_SIGNUP_MAX` | Optional | Max requests for `/signup` per window (defaults to `5`) |
| `RATE_LIMIT_AI_MAX` | Optional | Max requests for AI operations per window (defaults to `30`) |
| `RATE_LIMIT_GENERAL_MAX` | Optional | Max requests for general API per window (defaults to `100`) |

---

## 📡 API Reference

### Authentication
- `POST /api/v1/signup` — Register a new account (initiates OTP verification).
- `POST /api/v1/signin` — Login and receive secure `httpOnly` cookie.
- `POST /api/v1/logout` — Clear session cookies.
- `GET /api/v1/me` — Retrieve current authenticated user profile.
- `POST /api/v1/forgot-password` — Request password reset email.
- `POST /api/v1/reset-password` — Complete password reset with token.
- `DELETE /api/v1/user` — Delete user account and cascade delete all contents.

### Content & Tags
- `POST /api/v1/content` — Create a new memory card with auto-resolved tags.
- `GET /api/v1/content` — Fetch user's cards (supports type, pin, and tag filters).
- `PUT /api/v1/content/:id` — Update card content, title, tags, or note.
- `DELETE /api/v1/content/:id` — Delete a card (triggers automatic 0-usage tag cleanup).
- `PATCH /api/v1/content/:id/pin` — Toggle card pinned status.
- `GET /api/v1/tags` — Get all tags with real-time usage counts.

### AI Endpoints
- `POST /api/v1/ai/chat` — Conversational assistant with second brain context.
- `POST /api/v1/ai/summarize` — Generates bullet summaries of card content.
- `POST /api/v1/ai/suggest-tags` — Suggests relevant tags based on note/link.
- `POST /api/v1/ai/semantic-search` — Conceptually ranks cards by relevance score.

### Sharing
- `POST /api/v1/brain/share` — Enable public share link for your brain.
- `GET /api/v1/brain/:shareLink` — Access public read-only brain view.

---

## 🛡 API Rate Limiting (Redis)

Second Brain utilizes an enterprise-grade, distributed rate limiting system built on top of **Redis** using an **atomic sliding-window log algorithm**.

### 💡 Why Redis Instead of In-Memory Counters?
In-memory rate limiters (such as JavaScript `Map` objects or node-cache) have major production shortcomings:
- **Distributed Instances & Autoscaling:** When the backend scales horizontally across multiple servers or serverless containers, an in-memory counter is isolated to each node. An attacker could bypass limits by distributing requests across nodes. Redis provides a **single source of truth** shared across all instances.
- **Server Restarts & Deploys:** In-memory counters reset upon server restart or code redeployment, granting attackers fresh request quotas. Redis counters persist across deployments.
- **Zero Memory Leaks:** Redis sliding window keys use precise millisecond TTLs (`PEXPIRE`), guaranteeing automatic self-destruct once clients become inactive.

### ⚙️ How the Sliding Window Algorithm Works
1. Requests are tracked inside a Redis **Sorted Set (`ZSET`)** per client IP and route group (`rl:<route>:<ip>`).
2. Each request adds an entry with the current timestamp as its score.
3. An atomic Lua script cleans up records older than `(now - windowMs)` using `ZREMRANGEBYSCORE`.
4. It counts requests in the window (`ZCARD`). If under the limit, the request is recorded and processed.
5. If the limit is exceeded, it retrieves the oldest timestamp in the sliding window to compute the exact `Retry-After` seconds until the earliest request expires.
6. Because the check-and-increment executes inside an atomic Redis Lua script, it is **100% race-condition free** even under heavy concurrent loads.

### 📊 Route Group Limits & Default Configurations

| Route Group | Endpoints | Default Limit | Window | Outage Strategy |
| :--- | :--- | :---: | :---: | :---: |
| **Login** | `POST /api/v1/signin` | `10 req` | 1 minute | **Fail-Closed** (503) |
| **Signup** | `POST /api/v1/signup` | `5 req` | 10 minutes | **Fail-Closed** (503) |
| **Forgot Password** | `POST /api/v1/forgot-password` | `5 req` | 10 minutes | **Fail-Closed** (503) |
| **Reset Password** | `POST /api/v1/reset-password` | `5 req` | 10 minutes | **Fail-Closed** (503) |
| **AI Endpoints** | `POST /api/v1/ai/*` | `30 req` | 1 minute | **Fail-Open** (200) |
| **General API** | `/me`, `/content`, `/tags`, `/brain/share`, etc. | `100 req` | 1 minute | **Fail-Open** (200) |
| **Unrestricted** | `GET /api/v1/health`, public share viewers | Unlimited | — | No Rate Limiting |

*All thresholds and window durations are fully customizable via environment variables in `backend/.env`.*

### 🛑 Example `429 Too Many Requests` Response

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json; charset=utf-8
Retry-After: 48
RateLimit-Limit: 10
RateLimit-Remaining: 0
RateLimit-Reset: 48
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1770643920
```

```json
{
  "success": false,
  "message": "Too many sign-in attempts. Please wait a minute and try again."
}
```

### ⚡ Redis Failure Behavior (Fail-Open vs Fail-Closed)
If Redis becomes temporarily unreachable or suffers network degradation:
- **Normal API & AI Endpoints:** **Fail-Open** — Requests proceed normally so that an outage in Redis does not bring down the entire application for legitimate users.
- **Sensitive Auth Endpoints:** **Fail-Closed** — Requests to login, signup, and password reset endpoints return HTTP 503 (`Authentication service is temporarily unavailable. Please try again shortly.`). This guarantees that credential stuffing, brute-force attacks, and password-reset spam cannot exploit Redis downtime.

---

## 🌐 Deployment

### Frontend (Vercel)
1. Import repository into [Vercel](https://vercel.com).
2. Set root directory to `frontend`.
3. Set build command: `npm run build` and output directory: `dist`.
4. Add environment variables if pointing to a custom backend URL.

### Backend (Render)
1. Create a **Web Service** on [Render](https://render.com).
2. Set root directory to `backend`.
3. Build command: `npm install && npm run build`.
4. Start command: `npm start`.
5. Add all environment variables from `backend/.env`.
6. *(Built-in)*: A 14-minute self-ping keep-alive worker is active to prevent cold-starts on free-tier hosting.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'feat: add amazing feature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/RSCODERR">RSCODERR</a></sub>
</div>
