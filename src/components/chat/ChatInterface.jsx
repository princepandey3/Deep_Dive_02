/**
 * src/components/chat/ChatInterface.jsx
 * Premium chat UI with voice + dynamic status cycling.
 */
import React, { useCallback, useEffect, useState } from 'react'
import { AlertCircle, LogOut, Mic2, MicOff, Volume2 } from 'lucide-react'
import { useChat }   from '@/hooks/useChat.js'
import { useSpeech } from '@/hooks/useSpeech.js'
import ChatMessage   from './ChatMessage.jsx'
import ChatInput     from './ChatInput.jsx'
import StatusBadge   from '@/components/ui/StatusBadge.jsx'

// Status cycle: transcribing → analyzing → generating
function useAiStatus(isSending) {
  const [aiStatus, setAiStatus] = useState(null)
  useEffect(() => {
    if (!isSending) { setAiStatus(null); return }
    const steps = ['transcribing', 'analyzing', 'generating']
    let i = 0
    setAiStatus(steps[0])
    const id = setInterval(() => {
      i = Math.min(i + 1, steps.length - 1)
      setAiStatus(steps[i])
    }, 1100)
    return () => clearInterval(id)
  }, [isSending])
  return aiStatus
}

function EmptyState({ isSpeechSupported }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8 py-16">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/15 flex items-center justify-center shadow-lg shadow-accent/10">
        <Mic2 size={24} className="text-accent/70" />
      </div>
      <div>
        <p className="text-fog/80 text-sm font-medium mb-1">Your interviewer is ready</p>
        <p className="text-slate/50 text-xs max-w-xs leading-relaxed">
          {isSpeechSupported
            ? 'Type your answer or press the mic button to speak.'
            : 'Type your first message to begin the interview.'}
        </p>
      </div>
    </div>
  )
}

function NoSpeechBanner() {
  return (
    <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl
      bg-white/[0.03] border border-white/[0.05] text-slate/40 text-xs">
      <MicOff size={11} className="flex-shrink-0" />
      Voice controls unavailable in this browser. Text input is fully supported.
    </div>
  )
}

export default function ChatInterface({ sessionId, openingQuestion, onEndInterview }) {
  const {
    messages, inputText, isSending, error,
    bottomRef, setInputText, sendMessage, onKeyDown,
  } = useChat({ sessionId, openingQuestion })

  const aiStatus = useAiStatus(isSending)

  const handleTranscript = useCallback((transcript) => {
    setInputText((prev) => prev ? `${prev} ${transcript}` : transcript)
  }, [setInputText])

  const {
    isSupported: isSpeechSupported,
    isListening, isSpeaking,
    startListening, stopListening,
    speak, cancelSpeech,
  } = useSpeech({ onTranscript: handleTranscript })

  // Auto-read new AI messages
  useEffect(() => {
    if (!isSpeechSupported || messages.length === 0) return
    const last = messages[messages.length - 1]
    if (last.role === 'assistant' && !last.isLoading && last.content) {
      speak(last.content)
    }
  }, [messages, speak, isSpeechSupported])

  const headerLabel = isListening
    ? 'Listening…'
    : isSpeaking
    ? 'AI Speaking'
    : isSending
    ? (aiStatus === 'transcribing' ? 'Transcribing…'
       : aiStatus === 'analyzing'  ? 'Analyzing…'
       : 'Generating…')
    : 'Live Interview'

  const headerVariant = isListening ? 'pulse' : 'accent'

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] flex-shrink-0 bg-zinc-950/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <StatusBadge variant={headerVariant}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse ${
              isListening ? 'bg-pulse' : 'bg-accent'
            }`} />
            <span className="transition-all duration-300">{headerLabel}</span>
          </StatusBadge>
          <span className="font-mono text-[10px] text-slate/30 hidden sm:block">
            session: {sessionId?.slice(0, 8)}…
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isSpeechSupported && isSpeaking && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-accent/60 font-mono">
              <Volume2 size={11} className="animate-pulse" />
              Speaking
            </span>
          )}
          {onEndInterview && (
            <button
              type="button"
              onClick={() => { cancelSpeech(); onEndInterview() }}
              className="btn-ghost text-xs py-1.5 px-3 text-slate/50 hover:text-pulse hover:border-pulse/25"
            >
              <LogOut size={12} />
              End interview
            </button>
          )}
        </div>
      </div>

      {!isSpeechSupported && messages.length === 0 && <NoSpeechBanner />}

      {/* ── Messages ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 min-h-0"
        role="log"
        aria-label="Interview conversation"
        aria-live="polite"
      >
        {messages.length === 0
          ? <EmptyState isSpeechSupported={isSpeechSupported} />
          : messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                isLoading={msg.isLoading}
                ragSources={msg.ragSources}
              />
            ))
        }

        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/15 text-sm text-red-400/90 animate-fade-up">
            <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 relative">
        <ChatInput
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={onKeyDown}
          onSend={sendMessage}
          disabled={isSending}
          isListening={isListening}
          isSpeaking={isSpeaking}
          isSpeechSupported={isSpeechSupported}
          onMicStart={startListening}
          onMicStop={stopListening}
          onCancelSpeech={cancelSpeech}
          aiStatus={aiStatus}
        />
      </div>
    </div>
  )
}
