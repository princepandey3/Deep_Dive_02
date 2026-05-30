import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ChatInterface from '@/components/chat/ChatInterface.jsx'

export default function ChatPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const sessionId       = params.get('sessionId')

  const openingQuestion = params.get('question')

  if (!sessionId || !openingQuestion) {
    navigate('/dashboard', { replace: true })
    return null
  }

  return (
    <div
      className="flex flex-col mx-auto w-full max-w-3xl px-0 sm:px-4"
      style={{ height: 'calc(100dvh - 64px)' }}
    >
      <div className="glass-card flex flex-col flex-1 overflow-hidden my-4 sm:my-6">
        <ChatInterface
          sessionId={sessionId}
          openingQuestion={openingQuestion}
          onEndInterview={() => navigate('/dashboard')}
        />
      </div>
    </div>
  )
}
