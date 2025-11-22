require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const { transcribeAudioChunk, summarizeTranscript } = require('./gemini-handler')

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// Store active sessions
const activeSessions = new Map()

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  let sessionTranscript = []
  let sessionId = null
  
  socket.on('start-session', async (data) => {
    sessionId = data.sessionId || `session-${Date.now()}`
    sessionTranscript = []
    activeSessions.set(socket.id, {
      sessionId,
      transcript: sessionTranscript,
      startTime: Date.now()
    })
    console.log('Session started:', sessionId)
    socket.emit('session-started', { sessionId })
  })
  
  socket.on('audio-chunk', async (data) => {
    try {
      const { audioBase64, mimeType } = data
      
      if (!audioBase64) {
        console.error('No audio data received')
        return
      }
      
      // Transcribe chunk
      socket.emit('processing', { status: 'transcribing' })
      
      const transcript = await transcribeAudioChunk(audioBase64, mimeType || 'audio/webm')
      
      if (transcript && transcript.trim()) {
        sessionTranscript.push(transcript)
        
        const session = activeSessions.get(socket.id)
        if (session) {
          session.transcript = sessionTranscript
        }
        
        // Send live transcript update
        socket.emit('transcript', {
          chunk: transcript,
          fullTranscript: sessionTranscript.join(' ')
        })
      }
    } catch (error) {
      console.error('Error processing audio chunk:', error)
      socket.emit('error', { message: 'Failed to transcribe audio chunk' })
    }
  })
  
  socket.on('stop-session', async () => {
    try {
      const session = activeSessions.get(socket.id)
      
      if (!session || sessionTranscript.length === 0) {
        socket.emit('session-completed', {
          transcript: '',
          summary: 'No transcript available'
        })
        return
      }
      
      const fullTranscript = sessionTranscript.join(' ')
      
      socket.emit('processing', { status: 'summarizing' })
      
      // Generate summary
      let summary = ''
      try {
        summary = await summarizeTranscript(fullTranscript)
      } catch (error) {
        console.error('Summary generation error:', error)
        summary = 'Summary generation failed'
      }
      
      socket.emit('session-completed', {
        transcript: fullTranscript,
        summary,
        sessionId: session.sessionId
      })
      
      // Clean up
      activeSessions.delete(socket.id)
      sessionTranscript = []
    } catch (error) {
      console.error('Error stopping session:', error)
      socket.emit('error', { message: 'Failed to complete session' })
    }
  })
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
    activeSessions.delete(socket.id)
  })
})

const PORT = process.env.SOCKET_PORT || 4000
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})

