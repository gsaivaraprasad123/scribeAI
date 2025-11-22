'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getSocket, disconnectSocket } from '@/lib/socket-client'
import Button from './Button'
import Card from './Card'

export default function RecorderPanel() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioSource, setAudioSource] = useState('mic') // 'mic' or 'tab'
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState('idle') // idle, recording, paused, processing
  const [error, setError] = useState('')
  
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const socketRef = useRef(null)
  const router = useRouter()
  
  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket
    
    socket.on('connect', () => {
      console.log('Connected to socket server')
    })
    
    socket.on('session-started', (data) => {
      console.log('Session started:', data.sessionId)
    })
    
    socket.on('transcript', (data) => {
      setTranscript(data.fullTranscript)
      setStatus('recording')
    })
    
    socket.on('processing', (data) => {
      setStatus('processing')
    })
    
    socket.on('session-completed', async (data) => {
      setStatus('completed')
      
      // Save session to database
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: `Session ${new Date().toLocaleDateString()}`,
            transcript: data.transcript,
            summary: data.summary
          })
        })
        
        if (response.ok) {
          const sessionData = await response.json()
          router.push(`/session/${sessionData.session.id}`)
        }
      } catch (err) {
        console.error('Error saving session:', err)
        setError('Failed to save session')
      }
    })
    
    socket.on('error', (data) => {
      setError(data.message)
      setStatus('idle')
    })
    
    return () => {
      socket.off('connect')
      socket.off('session-started')
      socket.off('transcript')
      socket.off('processing')
      socket.off('session-completed')
      socket.off('error')
    }
  }, [router])
  
  const startRecording = async () => {
    try {
      setError('')
      setTranscript('')
      
      let stream
      
      if (audioSource === 'mic') {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: false, 
          audio: true 
        })
      }
      
      streamRef.current = stream
      
      // Determine supported mimeType
      let mimeType = 'audio/webm'
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        } else {
          mimeType = '' // Use browser default
        }
      }
      
      // Create MediaRecorder with 30s timeslice
      const options = mimeType ? { mimeType } : {}
      const mediaRecorder = new MediaRecorder(stream, options)
      
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && socketRef.current?.connected) {
          // Convert blob to base64
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]
            const actualMimeType = mediaRecorder.mimeType || 'audio/webm'
            socketRef.current.emit('audio-chunk', {
              audioBase64: base64,
              mimeType: actualMimeType
            })
          }
          reader.readAsDataURL(event.data)
        }
      }
      
      // Start recording with 30s chunks
      mediaRecorder.start(30000) // 30 seconds
      
      // Start session on server
      socketRef.current.emit('start-session', {
        sessionId: `session-${Date.now()}`
      })
      
      setIsRecording(true)
      setStatus('recording')
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to start recording. Please check permissions.')
      setStatus('idle')
    }
  }
  
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      setStatus('paused')
    }
  }
  
  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      setStatus('recording')
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    setIsRecording(false)
    setIsPaused(false)
    
    // Notify server to stop and summarize
    if (socketRef.current?.connected) {
      socketRef.current.emit('stop-session')
    }
  }
  
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      disconnectSocket()
    }
  }, [])
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Recording Session</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Audio Source Selection */}
      {!isRecording && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audio Source
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setAudioSource('mic')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                audioSource === 'mic'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              Microphone
            </button>
            <button
              onClick={() => setAudioSource('tab')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                audioSource === 'tab'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              Tab Audio
            </button>
          </div>
        </div>
      )}
      
      {/* Status Indicator */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${
            status === 'recording' ? 'bg-red-500 animate-pulse' :
            status === 'paused' ? 'bg-yellow-500' :
            status === 'processing' ? 'bg-blue-500 animate-pulse' :
            'bg-gray-400'
          }`}></div>
          <span className="font-medium">
            {status === 'recording' ? 'Recording...' :
             status === 'paused' ? 'Paused' :
             status === 'processing' ? 'Processing...' :
             'Ready'}
          </span>
        </div>
      </div>
      
      {/* Control Buttons */}
      <div className="flex gap-4 mb-6">
        {!isRecording ? (
          <Button onClick={startRecording} variant="primary" className="flex-1">
            Start Recording
          </Button>
        ) : (
          <>
            {isPaused ? (
              <Button onClick={resumeRecording} variant="success" className="flex-1">
                Resume
              </Button>
            ) : (
              <Button onClick={pauseRecording} variant="secondary" className="flex-1">
                Pause
              </Button>
            )}
            <Button onClick={stopRecording} variant="danger" className="flex-1">
              Stop & Save
            </Button>
          </>
        )}
      </div>
      
      {/* Live Transcript */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Live Transcript
        </label>
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
          {transcript ? (
            <p className="text-gray-900 whitespace-pre-wrap">{transcript}</p>
          ) : (
            <p className="text-gray-400 italic">Transcript will appear here as you speak...</p>
          )}
        </div>
      </div>
    </Card>
  )
}

