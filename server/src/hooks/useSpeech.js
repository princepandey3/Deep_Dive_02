import { useState, useEffect, useRef, useCallback } from 'react'

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


  useEffect(() => {
    if (!SpeechRecognition) return

    const rec = new SpeechRecognition()
    rec.continuous          = false
    rec.interimResults      = false
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

  }, [isListening])


  const speak = useCallback((text) => {
    if (!hasSynthesis || !text) return


    window.speechSynthesis.cancel()

    const utter        = new SpeechSynthesisUtterance(text)
    utter.lang         = 'en-US'
    utter.rate         = 0.95
    utter.pitch        = 1.0


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
