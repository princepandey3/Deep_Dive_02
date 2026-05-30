import React from 'react'
import { SendHorizonal, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

export default function ChatInput({
  value,
  onChange,
  onKeyDown,
  onSend,
  disabled,
  isListening      = false,
  isSpeaking       = false,
  isSpeechSupported = false,
  onMicStart,
  onMicStop,
  onCancelSpeech,
}) {
  const handleMicClick = () => {
    if (isListening) {
      onMicStop?.()
    } else {
      onMicStart?.()
    }
  }

  return (
    <div className="flex items-end gap-2 p-4 border-t border-white/[0.08] bg-ink/80 backdrop-blur-sm">

      {}
      {isSpeechSupported && (isListening || isSpeaking) && (
        <div
          aria-live="polite"
          className="absolute bottom-[88px] left-1/2 -translate-x-1/2
            flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium
            border backdrop-blur-md shadow-lg z-10
            animate-fade-up
            transition-all duration-300
            select-none pointer-events-none"
          style={{
            background: isListening
              ? 'rgba(224, 92, 58, 0.15)'
              : 'rgba(79, 110, 247, 0.15)',
            borderColor: isListening
              ? 'rgba(224, 92, 58, 0.35)'
              : 'rgba(79, 110, 247, 0.35)',
            color: isListening ? '#E05C3A' : '#4F6EF7',
          }}
        >
          {}
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: isListening ? '#E05C3A' : '#4F6EF7' }}
          />
          {isListening ? 'Listening…' : 'AI speaking…'}
        </div>
      )}

      {}
      {isSpeechSupported && isSpeaking && (
        <button
          type="button"
          onClick={onCancelSpeech}
          aria-label="Stop AI speech"
          title="Stop AI speech"
          className="
            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
            bg-accent/10 border border-accent/30 text-accent
            hover:bg-accent/20 active:scale-95
            transition-all duration-200
          "
        >
          <VolumeX size={15} />
        </button>
      )}

      {}
      <textarea
        className={`
          flex-1 resize-none rounded-xl px-4 py-3 text-sm
          bg-white/[0.05] border
          text-fog placeholder-slate/40
          focus:outline-none focus:bg-white/[0.07]
          transition-all duration-200
          min-h-[44px] max-h-[140px]
          leading-relaxed
          disabled:opacity-40
          ${isListening
            ? 'border-pulse/50 focus:border-pulse/70 bg-pulse/5'
            : 'border-white/[0.09] focus:border-accent/50'
          }
        `}
        rows={1}
        placeholder={
          isListening
            ? 'Listening… speak your answer'
            : 'Type your answer… (Enter to send, Shift+Enter for new line)'
        }
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled || isListening}
        aria-label="Chat input"
        onInput={(e) => {
          e.target.style.height = 'auto'
          e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`
        }}
      />

      {}
      {isSpeechSupported && (
        <button
          type="button"
          onPointerDown={handleMicClick}
          disabled={disabled || isSpeaking}
          aria-label={isListening ? 'Stop recording' : 'Push to talk'}
          aria-pressed={isListening}
          title={isListening ? 'Release to stop' : 'Push to talk'}
          className={`
            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
            border transition-all duration-200
            ${isListening
              ? 'bg-pulse/20 border-pulse/50 text-pulse scale-105 shadow-lg shadow-pulse/20'
              : disabled || isSpeaking
                ? 'bg-white/[0.04] border-white/[0.06] text-slate/30 cursor-not-allowed'
                : 'bg-white/[0.05] border-white/[0.09] text-slate hover:bg-white/[0.1] hover:text-fog hover:border-white/20 active:scale-95'
            }
          `}
        >
          {isListening ? (
            <MicOff size={15} />
          ) : (
            <Mic size={15} />
          )}
        </button>
      )}

      {}
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim() || isListening}
        aria-label="Send message"
        className={`
          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
          transition-all duration-200
          ${
            disabled || !value.trim() || isListening
              ? 'bg-white/[0.04] border border-white/[0.06] text-slate/30 cursor-not-allowed'
              : 'bg-accent text-white border border-accent hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25 active:scale-95'
          }
        `}
      >
        <SendHorizonal size={15} />
      </button>
    </div>
  )
}
