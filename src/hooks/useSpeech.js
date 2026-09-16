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
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState([])

  const recognitionRef = useRef(null)
  const activeUtteranceRef = useRef(null)
  const resumeIntervalRef = useRef(null)

  const clearResumeInterval = () => {
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current)
      resumeIntervalRef.current = null
    }
  }
  useEffect(() => {
    if (!hasSynthesis) return

    const loadVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices()
        if (v && v.length > 0) {
          setVoices(v)
        }
      } catch (err) {
        console.warn('[useSpeech] Error fetching voices:', err)
      }
    }

    loadVoices()
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  useEffect(() => {
    if (!SpeechRecognition) return

    const rec = new SpeechRecognition()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'

    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(' ')
        .trim()
      if (transcript) onTranscript(transcript)
    }

    rec.onend = () => setIsListening(false)

    rec.onerror = (e) => {
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


  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return

    if (hasSynthesis) {
      clearResumeInterval()
      try {
        window.speechSynthesis.cancel()
      } catch { }
      activeUtteranceRef.current = null
    }
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

  }, [isListening])

  const speak = useCallback((text) => {
    if (!hasSynthesis || !text) return

    clearResumeInterval()


    try {
      window.speechSynthesis.cancel()
      window.speechSynthesis.resume()
    } catch (e) {
      console.warn('[useSpeech] speech cancel/resume error:', e)
    }

    const cleanText = text
      .replace(/[*#_`~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanText) return

    const utter = new SpeechSynthesisUtterance(cleanText)
    utter.lang = 'en-US'
    utter.rate = 0.95
    utter.pitch = 1.0


    activeUtteranceRef.current = utter


    const currentVoices = (voices && voices.length > 0) ? voices : window.speechSynthesis.getVoices()
    const preferred =
      currentVoices.find((v) => v.lang.startsWith('en') && /Google|Samantha|Alex|Daniel|Natural|Jenny|Guy|Microsoft/i.test(v.name)) ||
      currentVoices.find((v) => v.lang.startsWith('en') || v.lang === 'en-US') ||
      currentVoices[0]

    if (preferred) utter.voice = preferred

    utter.onstart = () => {
      setIsSpeaking(true)
      clearResumeInterval()
      resumeIntervalRef.current = setInterval(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause()
          window.speechSynthesis.resume()
        }
      }, 5000)
    }

    utter.onend = () => {
      clearResumeInterval()
      activeUtteranceRef.current = null
      setIsSpeaking(false)
    }

    utter.onerror = (err) => {
      console.warn('[useSpeech] Utterance error:', err)
      clearResumeInterval()
      activeUtteranceRef.current = null
      setIsSpeaking(false)
    }

    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utter)
        window.speechSynthesis.resume()
      } catch (err) {
        console.warn('[useSpeech] window.speechSynthesis.speak error:', err)
      }
    }, 50)
  }, [voices])

  const cancelSpeech = useCallback(() => {
    if (!hasSynthesis) return
    clearResumeInterval()
    try {
      window.speechSynthesis.cancel()
    } catch { }
    activeUtteranceRef.current = null
    setIsSpeaking(false)
  }, [])


  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      if (hasSynthesis) {
        clearResumeInterval()
        try {
          window.speechSynthesis.cancel()
        } catch { }
        activeUtteranceRef.current = null
      }
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
