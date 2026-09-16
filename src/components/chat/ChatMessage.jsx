import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, User, Bot, Volume2 } from "lucide-react";

function SkeletonLoader() {
  return (
    <div className="space-y-2 py-0.5 w-48" aria-label="AI is thinking">
      <div className="skeleton h-3 w-3/4" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  );
}

function RagSources({ sources }) {
  const [open, setOpen] = useState(false);
  if (!sources?.length) return null;

  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[10px] font-mono text-slate/40
          hover:text-slate/70 transition-colors duration-200"
      >
        <BookOpen size={10} />
        {sources.length} source{sources.length !== 1 ? "s" : ""}
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {open && (
        <ul className="mt-2 space-y-1.5 border-l-2 border-white/[0.08] pl-3">
          {sources.map((s, i) => (
            <li key={i} className="text-[10px] text-slate/50 leading-relaxed">
              <span
                className={`font-semibold mr-1 ${
                  s.source === "resume"
                    ? "text-accent/60"
                    : "text-violet-400/60"
                }`}
              >
                [{s.source === "resume" ? "Résumé" : "JD"}]
              </span>
              {s.excerpt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ChatMessage({
  role,
  content,
  isLoading,
  ragSources,
  onSpeak,
}) {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-3 w-full animate-fade-up ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
          isUser
            ? "bg-accent/15 border border-accent/25"
            : "bg-slate-800/80 border border-white/[0.08]"
        }`}
        aria-hidden="true"
      >
        {isUser ? (
          <User size={12} className="text-accent" />
        ) : (
          <Bot size={12} className="text-slate/70" />
        )}
      </div>
      <div
        className={`relative group max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-accent/10 border border-accent/20 text-fog rounded-tr-sm"
            : "bg-slate-900/60 border border-white/[0.07] text-fog/90 rounded-tl-sm backdrop-blur-sm"
        }`}
      >
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <>
            <p className="whitespace-pre-wrap">{content}</p>
            {!isUser && (
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.04]">
                <RagSources sources={ragSources} />
                {onSpeak && content && (
                  <button
                    type="button"
                    onClick={() => onSpeak(content)}
                    title="Read message aloud"
                    className="flex items-center gap-1 text-[11px] text-slate/40 hover:text-accent transition-colors ml-auto pt-1"
                  >
                    <Volume2 size={12} />
                    <span className="text-[10px] font-mono">Listen</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
