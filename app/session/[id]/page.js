'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Card from '@/components/Card'
import Button from '@/components/Button'

export default function SessionPage() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token) {
      router.push('/login')
      return
    }
    
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    fetchSession()
  }, [params.id, router])
  
  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching session:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }
  
  const downloadTranscript = () => {
    if (!session?.transcript) return
    
    const blob = new Blob([session.transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${session.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  const downloadSummary = () => {
    if (!session?.summary) return
    
    const blob = new Blob([session.summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `summary-${session.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }
  
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <p className="text-center text-gray-600">Session not found</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    )
  }
  
  const date = new Date(session.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button onClick={() => router.push('/dashboard')} variant="secondary">
            ← Back to Dashboard
          </Button>
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {session.title || 'Untitled Session'}
          </h1>
          <p className="text-gray-600">{date}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Summary Card */}
          {session.summary && (
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">AI Summary</h2>
                <Button onClick={downloadSummary} variant="secondary" className="text-sm">
                  Download
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                <p className="text-gray-900 whitespace-pre-wrap">{session.summary}</p>
              </div>
            </Card>
          )}
          
          {/* Transcript Card */}
          {session.transcript && (
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Full Transcript</h2>
                <Button onClick={downloadTranscript} variant="secondary" className="text-sm">
                  Download
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] max-h-[600px] overflow-y-auto">
                <p className="text-gray-900 whitespace-pre-wrap">{session.transcript}</p>
              </div>
            </Card>
          )}
        </div>
        
        {!session.transcript && !session.summary && (
          <Card>
            <p className="text-center text-gray-600">No transcript or summary available for this session.</p>
          </Card>
        )}
      </div>
    </div>
  )
}

