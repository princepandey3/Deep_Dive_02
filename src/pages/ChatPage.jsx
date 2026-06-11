import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ChatInterface from "@/components/chat/ChatInterface.jsx";

export default function ChatPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = params.get("sessionId");

  const [openingQuestion, setOpeningQuestion] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      navigate("/dashboard", { replace: true });
      return;
    }

    fetch(`/api/chat/session/${sessionId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setOpeningQuestion(json.data.question);
        } else {
          setError(json.error || "Session not found");
        }
      })
      .catch(() => setError("Could not load interview session"));
  }, [sessionId]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (!openingQuestion) {
    return (
      <div className="flex items-center justify-center h-full text-slate/50 text-sm font-mono">
        Loading interview…
      </div>
    );
  }

  return (
    <div
      className="flex flex-col mx-auto w-full max-w-3xl px-0 sm:px-4"
      style={{ height: "calc(100dvh - 64px)" }}
    >
      <div className="glass-card flex flex-col flex-1 overflow-hidden my-4 sm:my-6">
        <ChatInterface
          sessionId={sessionId}
          openingQuestion={openingQuestion}
          onEndInterview={() => navigate("/dashboard")}
        />
      </div>
    </div>
  );
}
