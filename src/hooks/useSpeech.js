/**
 * src/hooks/useSpeech.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Encapsulates all Web Speech API interactions:
 *   • SpeechRecognition  → Push-to-talk: transcribes candidate's spoken answer
 *   • SpeechSynthesis    → Auto-reads AI interviewer messages aloud
 *
 * Returns:
 *   isSupported      boolean  — false if the browser has no speech APIs at all
 *   isListening      boolean  — true while mic is actively capturing audio
 *   isSpeaking       boolean  — true while TTS is playing
 *   startListening   () => void
 *   stopListening    () => void
 *   speak            (text: string) => void
 *   cancelSpeech     () => void
 */

import { useState, useEffect, useRef, useCallback } from 'react'

// ── Browser capability detection ──────────────────────────────────────────────
const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

const hasSynthesis =
  typeof window !== 'undefined' && 'speechSynthesis' in window

export function useSpeech({ onTranscript }) {
  const isSupported = Boolean(SpeechRecognition && hasSynthesis)

  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking]   = useState(false)

  const recognitionRef = useRef(null)

  // ── Initialise SpeechRecognition once ────────────────────────────────────
  useEffect(() => {
    if (!SpeechRecognition) return

    const rec = new SpeechRecognition()
    rec.continuous          = false   // single utterance per press
    rec.interimResults      = false   // fire only when confident
    rec.lang                = 'en-US'

    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(' ')
        .trim()
      if (transcript) onTranscript(transcript)
    }

    rec.onend = () => setIsListening(false)

    rec.onerror = (e) => {
      // 'aborted' fires when we manually call stop() – not a real error
      if (e.error !== 'aborted') {
        console.warn('[useSpeech] SpeechRecognition error:', e.error)
      }
      setIsListening(false)
    }

    recognitionRef.current = rec

    return () => {
      rec.abort()
    }
  }, [onTranscript])

  // ── Push-to-talk controls ─────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return
    // Stop any ongoing TTS so the mic doesn't pick it up
    if (hasSynthesis) window.speechSynthesis.cancel()
    setIsSpeaking(false)
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch (err) {
      console.warn('[useSpeech] Could not start recognition:', err)
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return
    recognitionRef.current.stop()
    // onend will set isListening → false
  }, [isListening])

  // ── Text-to-speech ────────────────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (!hasSynthesis || !text) return

    // Cancel anything currently playing
    window.speechSynthesis.cancel()

    const utter        = new SpeechSynthesisUtterance(text)
    utter.lang         = 'en-US'
    utter.rate         = 0.95
    utter.pitch        = 1.0

    // Pick a natural-sounding voice when available
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.lang === 'en-US' && /Google|Samantha|Alex|Daniel/i.test(v.name)
    )
    if (preferred) utter.voice = preferred

    utter.onstart = () => setIsSpeaking(true)
    utter.onend   = () => setIsSpeaking(false)
    utter.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utter)
  }, [])

  const cancelSpeech = useCallback(() => {
    if (!hasSynthesis) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      if (hasSynthesis) window.speechSynthesis.cancel()
    }
  }, [])

  return {
    isSupported,
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
  }
}
