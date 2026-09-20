# 💖 HeartSync — Fullstack Dating & Connection Platform
> Complete Project Architecture, UI/UX Design System, Database Engine & Deployment Manual

### 🌐 Live Deployed Application URL:
👉 **[https://bush-ontario-obtaining-expiration.trycloudflare.com](https://bush-ontario-obtaining-expiration.trycloudflare.com)**
*(Global Cloudflare Edge Tunnel · No Password / No IP Prompt · Instant Load)*

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Fullstack Architecture & Data Flow](#2-fullstack-architecture--data-flow)
3. [Frontend Stack & Cute Aesthetic UI](#3-frontend-stack--cute-aesthetic-ui)
4. [Backend Stack & REST APIs](#4-backend-stack--rest-apis)
5. [Database Architecture & Persistence](#5-database-architecture--persistence)
6. [Core Features & Logic Implementation](#6-core-features--logic-implementation)
   - [Instant Match & Auto-Chat on Love Button](#instant-match--auto-chat-on-love-button)
   - [Real-Time Discover Visibility for New Users](#real-time-discover-visibility-for-new-users)
   - [Clean Aesthetic Showcase (Dead Buttons Removed)](#clean-aesthetic-showcase-dead-buttons-removed)
7. [Comprehensive Deployment Guide](#7-comprehensive-deployment-guide)
   - [Option A: Cloudflare Tunnel (Official Live URL, 0 Config, No Password)](#option-a-cloudflare-tunnel-instant-public-https-zero-config)
   - [Option B: Render.com (Cloud Fullstack Hosting)](#option-b-rendercom-cloud-fullstack-hosting)
   - [Option C: Railway / Fly.io / DigitalOcean](#option-c-railway--flyio--digitalocean)
   - [Option D: Split Deploy (Vercel Frontend + Render Backend)](#option-d-split-deploy-vercel-frontend--render-backend)
8. [Environment Variables & Configuration](#8-environment-variables--configuration)
9. [Development & Production Scripts](#9-development--production-scripts)

---

## 1. Project Overview
**HeartSync** is a modern, aesthetic dating web application built to connect genuine people through shared interests, compatibility, and real-time conversations. The application is designed to be **100% self-contained**, meaning it runs out-of-the-box without requiring external PostgreSQL database servers or complex cloud setups.

---

## 2. Fullstack Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                              │
│  React 18 + Vite · Google Fonts (Outfit & Plus Jakarta Sans)           │
│  Pages: / · /discover · /matches · /messages · /profile · /login        │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                   HTTP REST APIs │ WebSocket (Socket.IO)
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    HEARTSYNC BACKEND (Node.js & Express)                │
│  Port: 5000 (Default)                                                   │
│  - Express REST APIs (/api/auth, /api/discover, /api/likes, etc.)       │
│  - Socket.IO Real-Time Server (user rooms, live chat)                  │
│  - Static Asset Server (Serves compiled React client/dist SPA)          │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 EMBEDDED DATABASE ENGINE (pg-mem)                       │
│  - In-Memory PostgreSQL Engine with full SQL & relational schema        │
│  - Tables: users, likes, matches, messages                              │
│  - Auto-persists snapshots to: heartsync-backend/data/heartsync_store   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Stack & Cute Aesthetic UI
- **Framework**: React 18 with Vite build tool.
- **Routing**: `react-router-dom` v6 with client-side SPA fallback.
- **State & Auth**: `AuthContext` managing tokens, logged-in profile, and automatic room connection.
- **Design Language**:
  - **Palette**: Soft rose quartz (`#ff6090`), pastel lavender (`#8b5cf6`), warm peach, and deep midnight navy (`#0a0c16`).
  - **Glassmorphism**: Translucent frosted panels with `backdrop-filter: blur(20px)` and subtle border highlights.
  - **Cute Micro-Interactions**:
    - Pulsing HeartSync brand logo.
    - Super-Sparkle button (`★`) on Discover with golden glow.
    - Quick-Tap Emoji Bar (`💖`, `✨`, `😍`, `🥺`, `🌸`, `☕`, `🎉`) in chat.
    - Smooth keyboard shortcuts: `←` to pass, `→` to like.
    - Floating badges: `💖 98% Compatibility`, `🟢 Online Now`, `✨ Verified`.

---

## 4. Backend Stack & REST APIs
- **Runtime**: Node.js v18+ / v22.
- **Web Framework**: Express.js with JSON body parsing & CORS.
- **Real-Time Communication**: `socket.io` handling event broadcasts (`send_message`, `receive_message`, `message_sent`).
- **Security**: `bcrypt` password hashing (10 rounds), `jsonwebtoken` (JWT) with 7-day expiration.
- **Key API Endpoints**:
  | Method | Endpoint | Description |
  | :--- | :--- | :--- |
  | `POST` | `/api/auth/register` | Register new user with default aesthetic profile |
  | `POST` | `/api/auth/login` | Authenticate user & return JWT token |
  | `GET` | `/api/discover` | Get profiles ordered by newest first |
  | `POST` | `/api/likes` | Like profile & immediately create match & conversation |
  | `GET` | `/api/matches` | Get all matched users for current user |
  | `GET` | `/api/messages/:id` | Fetch full message history with matched user |
  | `POST` | `/api/messages` | Send message (REST fallback for WebSockets) |
  | `GET` | `/api/profile` | Get current user's profile details |
  | `PUT` | `/api/profile` | Update profile fields (name, age, city, bio, interests) |
  | `GET` | `/api/health` | Health check endpoint |

---

## 5. Database Architecture & Persistence
- **Engine**: `pg-mem` (Embedded PostgreSQL engine).
- **Zero-Setup Database**: No external PostgreSQL installation required!
- **Data Persistence**: Changes to `users`, `likes`, `matches`, or `messages` automatically trigger a disk snapshot debounced to `heartsync-backend/data/heartsync_store.json`. When the server restarts, all users, matches, and chats are instantly restored!
- **Migrating to Production PostgreSQL**:
  To switch to a cloud PostgreSQL database (such as Supabase, Neon, or AWS RDS):
  1. In `heartsync-backend/.env`, set:
     ```env
     DATABASE_URL=postgres://user:password@host:5432/heartsync
     ```
  2. Change `heartsync-backend/config/db.js` to initialize `new pg.Pool({ connectionString: process.env.DATABASE_URL })`.

---

## 6. Core Features & Logic Implementation

### Instant Match & Auto-Chat on Love Button
- When a user clicks the **Love Button (`♥`)** or **Super Sparkle (`★`)** on Discover:
  1. Backend adds the like to `likes` table.
  2. Backend immediately registers the match in `matches` table.
  3. Backend inserts an initial icebreaker message into `messages` table from the matched person.
  4. The matched profile is immediately added to the user's **Matches** tab and **Messages** tab ready to chat!

### Real-Time Discover Visibility for New Users
- When a new user registers:
  1. They are assigned cute default attributes (avatar, age 24, location, cute bio & tags).
  2. `/api/discover` queries users sorted by `ORDER BY id DESC` (or `created_at DESC`), so newly registered users appear **immediately at the top of the Discover list** for all existing users!

### Clean Aesthetic Showcase (Dead Buttons Removed)
- The Landing Page hero visual mock card was cleaned by removing the dead buttons (`×`, `♥`, `★`), turning it into a gorgeous, high-end picture card with glowing tags.
- The Auth page was cleaned by replacing the clunky demo buttons with a discreet **Quick Demo** auto-fill pill.

---

## 7. Comprehensive Deployment Guide

### Option A: Cloudflare Tunnel (Instant Public HTTPS, Zero-Config)
1. Launch the server:
   ```bash
   node heartsync-backend/server.js
   ```
2. In a second terminal, launch Cloudflare tunnel:
   ```bash
   ./cloudflared.exe tunnel --url http://localhost:5000
   ```
3. Cloudflare gives a free, high-speed public URL: `https://<name>.trycloudflare.com` with no password or configuration needed!

### Option B: Render.com (Cloud Fullstack Hosting)
1. Push project to a GitHub repository.
2. Go to [Render.com](https://render.com) -> New Web Service.
3. Settings:
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `node heartsync-backend/server.js`
4. Add Environment Variable:
   - `JWT_SECRET` = `HeartSyncSecret@2026`
5. Render automatically compiles the React client and serves it through Express!

### Option C: Split Deploy (Vercel + Render/Railway)
- **Frontend on Vercel**:
  - Root directory: `client`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
- **Backend on Render/Railway**:
  - Root directory: `.`
  - Start command: `node heartsync-backend/server.js`

---

## 8. Development & Production Scripts
| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `node start.js` | Launches both Backend (5000) and Frontend (5173) concurrently |
| `npm run build` | `npm run build --prefix client` | Compiles production-ready React client to `client/dist` |
| `npm run prod` | `npm run build && node heartsync-backend/server.js` | Builds client & runs standalone production server |
| `npm run server` | `node heartsync-backend/server.js` | Runs standalone backend & serves built client |
