import './globals.css'

export const metadata = {
  title: 'ScribeAI - AI-Powered Transcription',
  description: 'Real-time audio transcription powered by Gemini AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

