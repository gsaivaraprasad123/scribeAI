# Quick Start Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Setup Database
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

## Step 3: Start the Application

Open **two terminal windows**:

### Terminal 1 - Next.js Frontend
```bash
npm run dev
```
This starts the Next.js app on http://localhost:3000

### Terminal 2 - Socket.io Server
```bash
npm run server
```
This starts the Socket.io server on http://localhost:4000

## Step 4: Use the App

1. Open http://localhost:3000 in your browser
2. Register a new account or login
3. Click "Start New Session"
4. Choose audio source (Microphone or Tab Audio)
5. Click "Start Recording"
6. Speak or play audio
7. Watch the live transcript appear
8. Click "Stop & Save" when done
9. View your saved sessions on the dashboard

## Troubleshooting

### Port Already in Use
If port 3000 or 4000 is already in use:
- Kill the process using that port
- Or update the ports in `.env` and `server/server.js`

### Database Connection Error
- Verify your `DATABASE_URL` in `.env` is correct
- Ensure your Neon database is accessible
- Run `npm run db:push` again

### Audio Not Recording
- Check browser permissions (allow microphone/tab audio)
- Use Chrome or Edge for best compatibility
- Ensure you're on HTTPS in production (required for getUserMedia)

### Socket Connection Failed
- Ensure the Socket.io server is running (Terminal 2)
- Check `NEXT_PUBLIC_SOCKET_URL` in `.env`
- Check browser console for connection errors

## Notes

- The app uses 30-second audio chunks for efficient processing
- Transcripts are saved automatically when you stop recording
- AI summaries are generated after stopping the recording
- All sessions are saved to your Neon Postgres database

