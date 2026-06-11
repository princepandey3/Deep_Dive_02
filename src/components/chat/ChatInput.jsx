/**
 * src/components/chat/ChatInput.jsx
 * Premium input bar with voice controls, glowing focus, and status pill.
 */
import React from "react";
import { SendHorizonal, Mic, MicOff, VolumeX } from "lucide-react";

export default function ChatInput({
  value,
  onChange,
  onKeyDown,
  onSend,
  disabled,
  isListening = false,
  isSpeaking = false,
  isSpeechSupported = false,
  onMicStart,
  onMicStop,
  onCancelSpeech,
  aiStatus, // 'transcribing' | 'analyzing' | 'generating' | null
}) {
  const handleMicClick = () => (isListening ? onMicStop?.() : onMicStart?.());

  // Dynamic status label cycling
  const statusLabel =
    {
      transcribing: "Transcribing audio…",
      analyzing: "Analyzing context…",
      generating: "Generating response…",
    }[aiStatus] ||
    (isListening ? "Listening…" : isSpeaking ? "AI speaking…" : null);

  const showPill = statusLabel !== null;

  return (
    <div className="flex items-end gap-2 p-4 border-t border-white/[0.06] bg-zinc-950/90 backdrop-blur-xl">
      {/* ── Floating status pill ── */}
      {showPill && (
        <div
          aria-live="polite"
          className="absolute bottom-[84px] left-1/2 -translate-x-1/2 z-10
            flex items-center gap-2 px-3.5 py-1.5
            rounded-full text-xs font-mono font-medium
            border backdrop-blur-lg shadow-xl
            animate-fade-up pointer-events-none select-none
            transition-all duration-300"
          style={{
            background: isListening
              ? "rgba(224,92,58,0.12)"
              : "rgba(79,110,247,0.12)",
            borderColor: isListening
              ? "rgba(224,92,58,0.3)"
              : "rgba(79,110,247,0.3)",
            color: isListening ? "#E05C3A" : "#4F6EF7",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
            style={{ background: isListening ? "#E05C3A" : "#4F6EF7" }}
          />
          {statusLabel}
        </div>
      )}

      {/* ── TTS cancel ── */}
      {isSpeechSupported && isSpeaking && (
        <button
          type="button"
          onClick={onCancelSpeech}
          aria-label="Stop AI speech"
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
            bg-accent/10 border border-accent/25 text-accent/80
            hover:bg-accent/20 hover:text-accent hover:-translate-y-0.5
            transition-all duration-200 ease-in-out active:scale-95"
        >
          <VolumeX size={14} />
        </button>
      )}

      {/* ── Textarea ── */}
      <textarea
        className={`
          flex-1 resize-none rounded-xl px-4 py-3 text-sm
          bg-gray-200 border
          text-black placeholder-slate/35
          transition-all duration-200 ease-in-out
          min-h-[44px] max-h-[140px] leading-relaxed
          disabled:opacity-40
          focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60
          ${
            isListening
              ? "border-pulse/40 bg-pulse/5 focus:ring-pulse/40 focus:border-pulse/50"
              : "border-white/[0.08]"
          }
        `}
        rows={1}
        placeholder={
          isListening
            ? "Listening… speak your answer"
            : "Type your answer… (Enter to send, Shift+Enter for new line)"
        }
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled || isListening}
        aria-label="Chat input"
        onInput={(e) => {
          e.target.style.height = "auto";
          e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
        }}
      />

      {isSpeechSupported && (
        <button
          type="button"
          onClick={handleMicClick}
          disabled={disabled || isSpeaking}
          aria-label={isListening ? "Stop recording" : "Push to talk"}
          aria-pressed={isListening}
          className={`
            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
            border transition-all duration-200 ease-in-out
            ${
              isListening
                ? "bg-pulse/20 border-pulse/45 text-pulse scale-105 shadow-lg shadow-pulse/20"
                : disabled || isSpeaking
                  ? "bg-white/[0.03] border-white/[0.05] text-slate/25 cursor-not-allowed"
                  : "bg-slate-800/60 border-white/[0.08] text-slate/60 hover:bg-slate-700/60 hover:text-fog hover:border-white/15 hover:-translate-y-0.5 active:scale-95"
            }
          `}
        >
          {isListening ? <MicOff size={14} /> : <Mic size={14} />}
        </button>
      )}

      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim() || isListening}
        aria-label="Send message"
        className={`
          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
          border transition-all duration-200 ease-in-out
          ${
            disabled || !value.trim() || isListening
              ? "bg-white/[0.03] border-white/[0.05] text-slate/25 cursor-not-allowed"
              : "bg-accent border-accent/60 text-white hover:bg-blue-400 hover:border-blue-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/25 active:scale-95"
          }
        `}
      >
        <SendHorizonal size={14} />
      </button>
    </div>
  );
}
