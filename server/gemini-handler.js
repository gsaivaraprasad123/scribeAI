const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY)

async function transcribeAudioChunk(audioBase64, mimeType = 'audio/webm') {
  try {
    // IMPORTANT: Gemini API does not support direct audio transcription
    // For production audio transcription, use Google Cloud Speech-to-Text API
    // This is a placeholder implementation for testing purposes
    
    // Try different model names that might work
    const modelNames = ['gemini-pro', 'gemini-1.5-flash', 'models/gemini-pro']
    let model = null
    let lastError = null
    
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0,
          }
        })
        // Test if model works with a simple text request first
        await model.generateContent('test')
        break
      } catch (e) {
        lastError = e
        continue
      }
    }
    
    if (!model) {
      throw new Error(`No working Gemini model found. Last error: ${lastError?.message}`)
    }
    
    // Attempt audio transcription (this will likely fail, but we try)
    const result = await model.generateContent([
      {
        inlineData: {
          data: audioBase64,
          mimeType: mimeType
        }
      },
      {
        text: "Transcribe this audio chunk accurately. Include speaker diarization if multiple speakers are detected. Return only the transcribed text, no additional commentary or formatting."
      }
    ])
    
    const response = await result.response
    const text = response.text().trim()
    
    if (!text || text.length < 2) {
      return ''
    }
    
    return text
  } catch (error) {
    console.error('Gemini transcription error:', error.message)
    
    // Return a mock transcription for testing purposes
    // In production, replace this with Google Cloud Speech-to-Text API
    const timestamp = new Date().toLocaleTimeString()
    return `[Mock transcription at ${timestamp}] Audio chunk received. For real transcription, please integrate Google Cloud Speech-to-Text API. This is a placeholder to allow testing of other features.`
  }
}

async function summarizeTranscript(transcript) {
  try {
    // Try different model names
    const modelNames = ['gemini-pro', 'gemini-1.5-flash', 'models/gemini-pro']
    let model = null
    let lastError = null
    
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.3,
          }
        })
        // Test if model works
        await model.generateContent('test')
        break
      } catch (e) {
        lastError = e
        continue
      }
    }
    
    if (!model) {
      throw new Error(`No working Gemini model found. Last error: ${lastError?.message}`)
    }
    
    const prompt = `Summarize the following meeting transcript. Provide a concise summary with:
- Key points discussed
- Action items (if any)
- Important decisions made
- Main topics covered

Keep the summary under 300 words and well-structured.

Transcript:
${transcript}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error('Gemini summarization error:', error.message)
    // Return a fallback summary if API fails
    return `Summary generation failed. Full transcript available above. Error: ${error.message}`
  }
}

module.exports = {
  transcribeAudioChunk,
  summarizeTranscript
}

