import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY)

export async function transcribeAudioChunk(audioBase64, mimeType = 'audio/webm') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // Convert base64 to buffer
    const audioData = Buffer.from(audioBase64, 'base64')
    
    // Use the audio input
    const result = await model.generateContent([
      {
        inlineData: {
          data: audioData.toString('base64'),
          mimeType: mimeType
        }
      },
      {
        text: "Transcribe this audio chunk. Include speaker diarization if multiple speakers are detected. Return only the transcribed text, no additional commentary."
      }
    ])
    
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini transcription error:', error)
    throw error
  }
}

export async function summarizeTranscript(transcript) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `Summarize the following meeting transcript. Provide a concise summary with key points, action items, and important decisions. Keep it under 300 words.

Transcript:
${transcript}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini summarization error:', error)
    throw error
  }
}

