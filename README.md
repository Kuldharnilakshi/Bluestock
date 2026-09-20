# ❤️ HeartSync

### A Modern Full-Stack Dating & Connection Platform

HeartSync is a full-stack dating application designed to help users discover meaningful connections through profiles, interests, likes, matches, and real-time conversations.

The application combines a modern React interface with a Node.js/Express backend, PostgreSQL database, JWT authentication, and Socket.IO for real-time messaging.

---

## ✨ Features

### 🔐 Authentication

* User registration and login
* JWT-based authentication
* Password protection using bcrypt
* Protected API routes

### 👤 Profile Management

* View personal profile
* Edit profile information
* Age, gender, bio, city and interests
* Profile picture support

### 💫 Discover

* Browse available profiles
* View user information and interests
* Discover potential connections

### ❤️ Likes & Matches

* Like other users
* Match management
* PostgreSQL-based relationship storage

### 💬 Real-Time Messaging

* One-to-one conversations
* Real-time communication using Socket.IO
* Persistent messages stored in PostgreSQL
* Automatic room-based communication

### 🎨 Modern UI

* Responsive React interface
* Dark premium aesthetic
* Modern cards and navigation
* Mobile-friendly design

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* React Router
* CSS
* Socket.IO Client

### Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcrypt
* Socket.IO

### Database

* PostgreSQL

### Deployment

* Vercel — Frontend
* Render — Backend
* Render PostgreSQL — Database

---

## 🏗️ Project Structure

```text
HeartSync/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── heartsync-backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── PROJECT_DOCUMENTATION.md
├── .gitignore
└── README.md
```

---

## 🔄 Application Architecture

```text
                    ┌──────────────────────┐
                    │      React + Vite    │
                    │       Frontend       │
                    └──────────┬───────────┘
                               │
                    REST API + Socket.IO
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      PostgreSQL      │
                    │       Database       │
                    └──────────────────────┘
```

---

## 🔑 API Modules

The backend provides API routes for:

```text
/api/auth
/api/profile
/api/discover
/api/likes
/api/matches
/api/messages
```

Authentication-protected routes use JWT bearer tokens.

---

## 🗄️ Database

HeartSync uses PostgreSQL with the following primary tables:

### Users

Stores user account and profile information.

### Likes

Stores user-to-user likes.

### Matches

Stores mutual connections.

### Messages

Stores conversations between users.

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd HeartSync
```

---

### 2. Setup Backend

```bash
cd heartsync-backend
npm install
```

Create a `.env` file:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_NAME=heartsync

JWT_SECRET=YOUR_SECRET_KEY
```

Start the backend:

```bash
node server.js
```

The backend will run on:

```text
http://localhost:5000
```

---

### 3. Setup Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

---

## 🔗 Production Backend

The deployed HeartSync backend is hosted on Render.

```text
https://heartsync-api-9706.onrender.com
```

The frontend communicates with the backend through REST APIs and Socket.IO.

---

## 🔒 Environment Variables

Never commit your `.env` file to GitHub.

Example:

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
PORT=
```

Make sure `.gitignore` contains:

```gitignore
node_modules/
.env
dist/
build/
```

---

## 🚀 Deployment

### Frontend

The React/Vite frontend can be deployed using Vercel.

Recommended configuration:

```text
Root Directory: client
Build Command: npm run build
Output Directory: dist
```

### Backend

The Node.js/Express backend can be deployed using Render.

Recommended configuration:

```text
Root Directory: heartsync-backend
Build Command: npm install
Start Command: node server.js
```

PostgreSQL can be hosted using Render PostgreSQL or another PostgreSQL provider.

---

## 🧪 Build Verification

To create a production build of the frontend:

```bash
cd client
npm run build
```

Successful build output:

```text
✓ built successfully
```

---

## 🔮 Future Enhancements

Planned improvements include:

* 🤖 AI-based compatibility scoring
* 🧠 Interest and bio similarity analysis
* 🔎 Advanced profile filters
* 📸 Cloud-based profile image uploads
* 🚫 Block and report functionality
* ❌ Unmatch functionality
* 🔔 Real-time notifications
* ✉️ Improved messaging experience
* 📱 Further mobile UI optimization
* ⭐ Premium membership features

---

## 🎯 Project Goals

HeartSync was developed to demonstrate practical full-stack development concepts including:

* Frontend development with React
* REST API development
* Authentication and authorization
* Database design
* PostgreSQL integration
* Real-time communication
* Client-server architecture
* Production deployment
* Responsive UI development

---

## 👩‍💻 Developer

**Nilakshi Kuldhar**

B.Tech Information Technology
Honours in Cyber Security

### Areas of Interest

* Full-Stack Development
* Application Development
* Cybersecurity
* Artificial Intelligence
* Cloud Technologies

---

## 📄 License

This project is intended for educational and portfolio purposes.

---

### ❤️ HeartSync

**Discover. Connect. Match. Chat.**
