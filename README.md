<div align="center">

<img src="https://img.shields.io/badge/TechHub-E--Learning%20Platform-1D3461?style=for-the-badge&logo=bookstack&logoColor=white" alt="TechHub"/>

# TechHub — E-Learning Platform

**A full-stack, AI-powered e-learning platform built for Computer Science education.**  
Learn, practice, get certified, and collaborate — all in one place.

🌐 **Live Platform → [https://techhub-learn.com](https://techhub-learn.com)**

[![Live](https://img.shields.io/badge/Status-Live-2A9D8F?style=flat-square)](https://techhub-learn.com)
[![Docker](https://img.shields.io/badge/Docker-Containerised-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)

---

</div>

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Repository Structure](#-repository-structure)
- [Prerequisites & Dependencies](#-prerequisites--dependencies)
- [Installation & Setup](#-installation--setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Database Setup](#3-database-setup)
  - [4. Run with Docker (Recommended)](#4-run-with-docker-recommended)
  - [5. Run Services Manually (Development)](#5-run-services-manually-development)
- [Environment Variables Reference](#-environment-variables-reference)
- [Deployment](#-deployment)
- [Team](#-team)

---

## 📖 About the Project

TechHub is a comprehensive e-learning platform designed specifically for Computer Science students and instructors. It solves the fragmented online learning experience by combining video courses, interactive assignments, a built-in code compiler, AI-powered assistance, community forums, structured roadmaps, and automatic certificates — all under one roof.

**Three user roles:**
- **Student** — Enroll, learn, practice, compile code, earn certificates
- **Instructor** — Create and manage courses, assignments, and communities
- **Admin** — Full platform oversight, moderation, and analytics

---

## 🌐 Live Demo

The platform is fully deployed and accessible:

| Link | Description |
|------|-------------|
| 🌍 [https://techhub-learn.com](https://techhub-learn.com) | Production platform |

You can register a free account as a **Student** or **Instructor** directly on the platform — no setup required.

---

## ✨ Features

### Semester 1 (Foundation)
| Feature | Description |
|---------|-------------|
| 🔐 Authentication | Email/password + Google Sign-In, JWT sessions, email verification, password reset |
| 📚 Course Management | Instructors create, edit, publish courses with video management and MCQ questions |
| 🎓 Student Learning | Enroll, watch videos, track progress, take in-video quizzes, write notes |
| 🤖 AI Chatbot v1 | FAISS semantic search + cross-encoder re-ranking for CS Q&A |

### Semester 2 (Full Platform)
| Feature | Description |
|---------|-------------|
| 📝 Assignments | MCQ assignments with deadlines, attempt limits, auto-grading, and feedback |
| 🏆 Certificates | Auto-generated PDF certificates with unique verification codes |
| 💬 Community | Course-scoped forums with posts, replies, likes, and admin moderation |
| 💻 Code Compiler | Full interactive terminal — Monaco Editor + Xterm.js + WebSocket + isolated container |
| 🗺️ Roadmaps | Structured learning paths with locked/unlocked steps and objectives |
| 🔔 Notifications | Real-time alerts for all roles and events |
| 🛡️ Admin Dashboard | User management, course oversight, reports, and analytics |
| 🤖 AI Chatbot v2 | Upgraded to RAG + LLM with 3-turn conversation memory |

---

## 🏗 System Architecture

```
Browser (React SPA)
        │  HTTP :80
        ▼
┌─────────────────────────────────────────┐
│         Nginx Reverse Proxy             │
│  /         → Frontend  (:80)           │
│  /api/     → Backend   (:5000)         │
│  /chatbot/ → AI Service (:5001)        │
└────────┬──────────────┬────────────────┘
         │              │              (Docker Network)
┌────────▼──┐  ┌────────▼──┐  ┌──────────────┐
│  Frontend │  │  Backend  │  │   Chatbot    │
│  React    │  │ Node.js + │  │  Python +    │
│  + Vite   │  │  Express  │  │   Flask      │
└───────────┘  └─────┬─────┘  └──────┬───────┘
                      │              │
               ┌──────▼──────────────▼──────┐
               │      Neon PostgreSQL        │
               │      (28 tables)            │
               └────────────────────────────┘

External Services:
  Cloudinary · Gmail SMTP · Google OAuth · AWS EC2 · GitHub Actions CI/CD
```

**Compiler Architecture (isolated for security):**
```
Browser (Monaco Editor + Xterm.js)
        │  WebSocket
        ▼
  Backend (WebSocket server)
        │  Spawn process
        ▼
  Isolated Docker Container  ← sandboxed, no network, limited resources
  (Python / Node.js runtime)
        │  stdout / stderr stream
        ▼
  Back to browser in real-time
```

---

## 📁 Repository Structure

```
/
├── src/
│   ├── frontend/               # React + TypeScript SPA
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── auth/       # Login, Signup, Verification, Reset
│   │   │   │   ├── student/    # Dashboard, Courses, Compiler, Roadmaps …
│   │   │   │   ├── instructor/ # Dashboard, Courses, Assignments …
│   │   │   │   ├── admin/      # Users, Courses, Reports, Communities …
│   │   │   │   └── shared/     # Home, AllCourses, Community, About …
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── api.ts          # Axios instance + interceptors
│   │   │   └── App.tsx         # Root router
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── backend/                # Node.js + Express REST API
│   │   ├── src/
│   │   │   ├── routes/         # auth, courses, videos, assignments …
│   │   │   ├── middleware/     # auth.js (JWT + role guard)
│   │   │   ├── services/       # mail.js, notification.service.js
│   │   │   ├── utils/          # cleanup.js, helpers
│   │   │   └── app.js          # Express entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── chatbot/                # Python + Flask AI microservice
│       ├── chatbot_api.py      # Flask routes (/chat, /reset, /health)
│       ├── chatbot_core.py     # RAG pipeline + LLM + FAISS retrieval
│       ├── Dockerfile
│       └── requirements.txt
│
├── exe/
│   └── docker-compose.yml      # Single command to run entire platform
│
├── nginx/
│   └── nginx.conf              # Reverse proxy configuration
│
├── db/
│   └── techhub_db_init.sql     # Full database schema (28 tables)
│
└── README.md
```

---

## 🛠 Prerequisites & Dependencies

### System Requirements
| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| RAM | 4 GB | 8 GB |
| Disk | 5 GB free | 10 GB free |
| OS | Linux / macOS / Windows 10+ | Ubuntu 22.04 / macOS 14 |
| CPU | 2 cores | 4 cores |

### Required Software
| Tool | Version | Purpose |
|------|---------|---------|
| [Docker](https://www.docker.com/get-started) | 24.0+ | Container runtime |
| [Docker Compose](https://docs.docker.com/compose/) | 2.20+ | Multi-container orchestration |
| [Git](https://git-scm.com/) | 2.x | Clone the repository |
| [Node.js](https://nodejs.org/) | 18.x | Backend + Frontend (manual dev only) |
| [Python](https://www.python.org/) | 3.11+ | Chatbot service (manual dev only) |

> **Note:** If running via Docker (recommended), only Docker, Docker Compose, and Git are required. Node.js and Python are only needed for manual/development runs.

### External Services Required
| Service | Purpose | Free Tier |
|---------|---------|-----------|
| [Neon](https://neon.tech) | PostgreSQL cloud database | ✅ Yes |
| [Cloudinary](https://cloudinary.com) | Media storage (images, thumbnails) | ✅ Yes |
| [Google Cloud Console](https://console.cloud.google.com) | OAuth 2.0 Client ID | ✅ Yes |
| Gmail Account | SMTP email delivery (app password) | ✅ Yes |
| LLM API Provider | AI chatbot generation | Varies |

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Ma7mod-Raslan/TechHub.git
cd techhub
```

---

### 2. Environment Configuration

The project requires three `.env` files — one per service.

#### `src/backend/.env`
```env
# Database
DATABASE_URL=postgresql://user:password@host/techhub?sslmode=require

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Email (Gmail SMTP)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password        # Not your Gmail password — use App Password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key

# Verification code TTL (minutes)
VERIFICATION_CODE_TTL_MIN=30
```

#### `src/chatbot/.env`
```env
# LLM provider API key
LLM_API_KEY=your_llm_api_key
LLM_MODEL=your_model_name

# Optional: FAISS index path
FAISS_INDEX_PATH=./data/index.faiss
```

#### `src/frontend/.env`
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost/api
VITE_CHATBOT_URL=http://localhost/chatbot
```

> ⚠️ **Never commit `.env` files to version control.** They are listed in `.gitignore` by default.

---

### 3. Database Setup

#### Option A — Neon (Cloud, Recommended)
1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project → copy the **connection string**
3. Paste it as `DATABASE_URL` in `src/backend/.env`
4. Run the schema:

```bash
psql "$DATABASE_URL" -f db/techhub_db_init.sql
```

#### Option B — Local PostgreSQL
```bash
# Create database
psql -U postgres -c "CREATE DATABASE techhub;"

# Apply schema
psql -U postgres -d techhub -f db/techhub_db_init.sql

# Set in .env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/techhub
```

---

### 4. Run with Docker (Recommended)

This single command builds and starts all four services (Frontend, Backend, Chatbot, Nginx):

```bash
# From the repo root
docker compose -f exe/docker-compose.yml up --build
```

Wait for all services to report healthy, then open:

```
http://localhost
```

**To stop:**
```bash
docker compose -f exe/docker-compose.yml down
```

**To stop and remove all data volumes:**
```bash
docker compose -f exe/docker-compose.yml down -v
```

#### Service URLs (while running locally)
| Service | URL |
|---------|-----|
| Platform (via Nginx) | http://localhost |
| Backend API | http://localhost/api |
| AI Chatbot | http://localhost/chatbot |
| Backend direct | http://localhost:5000 |
| Chatbot direct | http://localhost:5001 |

---

### 5. Run Services Manually (Development)

If you prefer to run each service individually without Docker:

#### Backend
```bash
cd src/backend
npm install
node src/app.js
# Runs on http://localhost:5000
```

#### Frontend
```bash
npm install
npm run dev
# Runs on http://localhost:5173
```

#### Chatbot
```bash
cd src/chatbot
pip install -r requirements.txt
python chatbot_api.py
# Runs on http://localhost:5001
```

> In development mode, update `VITE_API_BASE_URL=http://localhost:5000/api` in the frontend `.env` to point directly to the backend.

---

## 🔑 Environment Variables Reference

### Backend — Full Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens (min 32 chars) |
| `EMAIL_USER` | ✅ | Gmail address used for sending emails |
| `EMAIL_PASS` | ✅ | Gmail App Password (not your login password) |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth 2.0 client ID |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `YOUTUBE_API_KEY` | ✅ | YouTube Data API v3 key |
| `VERIFICATION_CODE_TTL_MIN` | ❌ | Email code expiry in minutes (default: 30) |

### How to get each credential

<details>
<summary><strong>Gmail App Password</strong></summary>

1. Go to your Google Account → Security
2. Enable **2-Step Verification**
3. Go to **App Passwords** → select "Mail" → "Other"
4. Copy the generated 16-character password → use as `EMAIL_PASS`

</details>

<details>
<summary><strong>Google OAuth Client ID</strong></summary>

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create **OAuth 2.0 Client ID** → Web Application
4. Add `http://localhost` and your production domain to **Authorized JavaScript Origins**
5. Copy the **Client ID**

</details>

<details>
<summary><strong>Cloudinary</strong></summary>

1. Register at [cloudinary.com](https://cloudinary.com)
2. Dashboard → copy **Cloud Name**, **API Key**, **API Secret**

</details>

<details>
<summary><strong>YouTube Data API v3</strong></summary>

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **YouTube Data API v3**
3. Create an **API Key** under Credentials

</details>

---

## 🚢 Deployment

TechHub is deployed on **AWS EC2** with **GitHub Actions CI/CD**.

### Production Stack
| Component | Technology |
|-----------|-----------|
| Cloud Provider | AWS EC2 (Ubuntu 22.04) |
| Web Server / Proxy | Nginx (Docker container) |
| Containerisation | Docker + Docker Compose |
| CI/CD Pipeline | GitHub Actions |
| Database | Neon PostgreSQL (cloud) |
| Media CDN | Cloudinary |

### CI/CD Pipeline (GitHub Actions)

On every push to the `main` branch, the pipeline automatically:

1. **Runs tests** — linting and build checks
2. **Builds Docker images** — for all three services
3. **SSH into EC2** — connects to the production server
4. **Pulls latest code** — `git pull origin main`
5. **Rebuilds containers** — `docker compose up --build -d`
6. **Health check** — verifies all services are responding

```yaml
# .github/workflows/deploy.yml (overview)
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: SSH & Deploy to EC2
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/techhub
            git pull origin main
            docker compose -f exe/docker-compose.yml up --build -d
```

### Deploy to Your Own EC2

```bash
# 1. Launch Ubuntu 22.04 EC2 instance (t2.medium or larger)
# 2. SSH into it
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu

# 4. Clone the repo
git clone https://github.com/your-org/techhub.git
cd techhub

# 5. Add your .env files
nano src/backend/.env
nano src/chatbot/.env
nano src/frontend/.env

# 6. Start the platform
docker compose -f exe/docker-compose.yml up --build -d

# 7. (Optional) Point your domain → EC2 public IP via DNS A record
```

---

## 👥 Team

| Name | Role |
|------|------|
| **Mahmoud Raslan** | Backend Engineer · Database Engineer · DevOps |
| **Basmala** | Frontend Engineer |
| **Toqa Hussein** | AI Engineer |

**Supervised by:** Dr. Azza · Dr. Alaa

---

<div align="center">

**🌐 [Visit TechHub → techhub-learn.com](https://techhub-learn.com)**

Made with ❤️ — TechHub Team · 2026

</div>