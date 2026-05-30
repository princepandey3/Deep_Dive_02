import React, { useCallback, useEffect } from 'react'
import { AlertCircle, LogOut, Mic2, MicOff, Volume2 } from 'lucide-react'
import { useChat }   from '@/hooks/useChat.js'
import { useSpeech } from '@/hooks/useSpeech.js'
import ChatMessage   from './ChatMessage.jsx'
import ChatInput     from './ChatInput.jsx'
import StatusBadge   from '@/components/ui/StatusBadge.jsx'

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8 py-16">
      <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
        <Mic2 size={22} className="text-accent/70" />
      </div>
      <p className="text-slate text-sm max-w-xs leading-relaxed">
        Your interviewer is ready. Type your first message — or use the mic to speak.
      </p>
    </div>
  )
}

function NoSpeechBanner() {
  return (
    <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl
      bg-white/[0.04] border border-white/[0.07] text-slate/50 text-xs">
      <MicOff size={12} className="flex-shrink-0" />
      Voice controls are not supported in this browser. Use the text input below.
    </div>
  )
}

export default function ChatInterface({ sessionId, openingQuestion, onEndInterview }) {
  const {
    messages,
    inputText,
    isSending,
    error,
    bottomRef,
    setInputText,
    sendMessage,
    onKeyDown,
  } = useChat({ sessionId, openingQuestion })


  const handleTranscript = useCallback((transcript) => {
    setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript))
  }, [setInputText])

  const {
    isSupported: isSpeechSupported,
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
  } = useSpeech({ onTranscript: handleTranscript })


  useEffect(() => {
    if (!isSpeechSupported) return
    if (messages.length === 0) return

    const last = messages[messages.length - 1]

    if (last.role === 'assistant' && !last.isLoading && last.content) {
      speak(last.content)
    }
  }, [messages, speak, isSpeechSupported])


  const headerStatus = isListening
    ? { label: 'Listening…',   color: 'text-pulse',  dot: 'bg-pulse'  }
    : isSpeaking
    ? { label: 'AI Speaking',  color: 'text-accent', dot: 'bg-accent' }
    : { label: 'Live Interview', color: 'text-accent', dot: 'bg-accent' }

  return (
    <div className="flex flex-col h-full min-h-0">

      {}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] flex-shrink-0">
        <div className="flex items-center gap-3">
          <StatusBadge variant="accent">
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse ${headerStatus.dot}`}
            />
            <span className={`transition-colors duration-300 ${headerStatus.color}`}>
              {headerStatus.label}
            </span>
          </StatusBadge>
          <span className="font-mono text-[10px] text-slate/40 hidden sm:block">
            session: {sessionId?.slice(0, 8)}…
          </span>
        </div>

        {}
        <div className="flex items-center gap-2">
          {isSpeechSupported && isSpeaking && (
            <span
              className="hidden sm:flex items-center gap-1.5
                text-xs text-accent/70 font-medium"
              aria-live="polite"
            >
              <Volume2 size={12} className="animate-pulse" />
              Speaking
            </span>
          )}

          {onEndInterview && (
            <button
              type="button"
              onClick={() => { cancelSpeech(); onEndInterview(); }}
              className="btn-ghost text-xs py-1.5 px-3 text-slate/60 hover:text-pulse hover:border-pulse/30"
            >
              <LogOut size={12} />
              End interview
            </button>
          )}
        </div>
      </div>

      {}
      {!isSpeechSupported && messages.length === 0 && <NoSpeechBanner />}

      {}
      <div
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 min-h-0"
        role="log"
        aria-label="Interview conversation"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isLoading={msg.isLoading}
              ragSources={msg.ragSources}
            />
          ))
        )}

        {}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-fade-up">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {}
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
        />
      </div>
    </div>
  )
}
