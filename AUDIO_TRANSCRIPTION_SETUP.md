# Audio Transcription Setup Guide

## Current Status

The Gemini API does **not support direct audio transcription**. The current implementation uses a placeholder that allows you to test other features of the app.

## Solution: Use Google Cloud Speech-to-Text API

For production audio transcription, you need to integrate Google Cloud Speech-to-Text API.

### Step 1: Install Google Cloud Speech-to-Text

```bash
npm install @google-cloud/speech
```

### Step 2: Set Up Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Speech-to-Text API
4. Create a service account and download the JSON key
5. Set the environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/key.json"
   ```

### Step 3: Update `server/gemini-handler.js`

Replace the `transcribeAudioChunk` function with:

```javascript
const speech = require('@google-cloud/speech').v1
const client = new speech.SpeechClient()

async function transcribeAudioChunk(audioBase64, mimeType = 'audio/webm') {
  try {
    // Convert base64 to buffer
    const audioBytes = Buffer.from(audioBase64, 'base64')
    
    // Configure recognition
    const config = {
      encoding: 'WEBM_OPUS', // or 'LINEAR16', 'FLAC', etc. based on your audio
      sampleRateHertz: 48000, // Adjust based on your audio
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
      enableSpeakerDiarization: true,
      diarizationSpeakerCount: 2, // Adjust based on expected speakers
    }
    
    const request = {
      audio: {
        content: audioBytes.toString('base64'),
      },
      config: config,
    }
    
    // Detect speech
    const [response] = await client.recognize(request)
    
    if (!response.results || response.results.length === 0) {
      return ''
    }
    
    // Combine all transcripts
    const transcript = response.results
      .map(result => result.alternatives[0].transcript)
      .join(' ')
    
    return transcript
  } catch (error) {
    console.error('Speech-to-Text error:', error)
    throw error
  }
}
```

### Step 4: Update `.env`

Add your Google Cloud credentials path:
```
GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

## Alternative: Use Web Speech API (Browser-based)

For a simpler solution that works entirely in the browser:

1. Use the browser's built-in `SpeechRecognition` API
2. Send transcribed text directly to the server
3. No server-side audio processing needed

This is simpler but less accurate and requires browser support.

## Current Workaround

The current implementation returns a mock transcription message, allowing you to:
- ✅ Test session management
- ✅ Test authentication
- ✅ Test database operations
- ✅ Test UI and user flows
- ⚠️ Audio transcription needs proper API integration

## Testing

To test which Gemini models work for summarization:

```bash
node server/test-gemini-models.js
```

This will help identify which model names work with your API key.

