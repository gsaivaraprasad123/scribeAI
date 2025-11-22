# ScribeAI - AI-Powered Transcription App

A real-time audio transcription application powered by Google Gemini AI, built with Next.js 16, Socket.io, and Neon Postgres.

## Features

- 🎤 **Real-time Audio Transcription** - Record from microphone or browser tab audio
- ⚡ **30-second Chunking** - Efficient audio processing with automatic chunking
- 🤖 **AI-Powered Summarization** - Automatic meeting summaries using Gemini AI
- 🔐 **JWT Authentication** - Secure user authentication with bcrypt password hashing
- 💾 **Session Management** - Save and manage all your transcription sessions
- 📱 **Modern UI** - Clean, responsive interface built with TailwindCSS

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TailwindCSS v4
- **Backend**: Next.js API Routes, Express, Socket.io
- **Database**: Neon Postgres with Prisma ORM
- **Authentication**: JWT + bcrypt
- **AI**: Google Gemini API for transcription and summarization
- **Real-time**: Socket.io for live audio streaming

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Neon Postgres database (or any Postgres database)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

The `.env` file is already configured with your credentials. If you need to update it:

```env
DATABASE_URL="your-neon-postgres-url"
JWT_SECRET="your-jwt-secret"
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"
GEMINI_KEY="your-gemini-api-key"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Run the Application

You need to run two servers:

**Terminal 1 - Next.js App:**
```bash
npm run dev
```

**Terminal 2 - Socket.io Server:**
```bash
npm run server
```

The app will be available at:
- Frontend: http://localhost:3000
- Socket.io Server: http://localhost:4000

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Start Recording**: Click "Start New Session" on the dashboard
3. **Choose Audio Source**: Select microphone or tab audio
4. **Record**: Click "Start Recording" and speak or play audio
5. **View Transcript**: See live transcription as you record
6. **Stop & Save**: Click "Stop & Save" to generate summary and save session
7. **View Sessions**: Access all your saved sessions from the dashboard

## Project Structure

```
/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (auth, sessions)
│   ├── dashboard/         # Dashboard and recording pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── session/[id]/      # Session detail page
├── components/            # React components
│   ├── Button.js
│   ├── Card.js
│   ├── Input.js
│   ├── Navbar.js
│   ├── RecorderPanel.js
│   └── SessionCard.js
├── lib/                   # Utility libraries
│   ├── prisma.js
│   ├── jwt.js
│   ├── bcrypt.js
│   ├── gemini.js
│   └── socket-client.js
├── server/                # Socket.io server
│   ├── server.js
│   └── gemini-handler.js
└── prisma/                # Database schema
    └── schema.prisma
```

## Key Features Explained

### Real-time Audio Chunking
- Audio is recorded in 30-second chunks using MediaRecorder API
- Each chunk is sent to the server via Socket.io
- Server processes chunks with Gemini API in real-time
- Transcripts are streamed back to the client live

### Authentication Flow
- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens are stored in httpOnly cookies
- Middleware protects dashboard and session routes
- Token validation on API routes

### Database Schema
- **User**: Stores user credentials
- **Session**: Stores transcription sessions with transcripts and summaries

## Troubleshooting

### Audio Not Recording
- Check browser permissions for microphone/tab audio
- Ensure HTTPS in production (required for getUserMedia)
- Check browser console for errors

### Socket Connection Issues
- Verify Socket.io server is running on port 4000
- Check NEXT_PUBLIC_SOCKET_URL in environment variables
- Check firewall settings

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure database is accessible
- Run `npm run db:push` to sync schema

## Production Deployment

1. Update environment variables for production
2. Set secure cookie flags in auth routes
3. Use HTTPS (required for audio APIs)
4. Configure CORS properly for Socket.io
5. Set up proper error logging and monitoring

## License

MIT

