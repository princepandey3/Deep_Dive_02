import { useState, useCallback, useRef, useEffect } from 'react'

export function useChat({ sessionId, openingQuestion }) {

  const [messages, setMessages] = useState(() => {
    if (!openingQuestion) return []
    return [
      {
        id: 'opening',
        role: 'assistant',
        content: openingQuestion,
        isLoading: false,
      },
    ]
  })

  const [inputText, setInputText]   = useState('')
  const [isSending, setIsSending]   = useState(false)
  const [error, setError]           = useState(null)


  const bottomRef = useRef(null)


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])


  const appendMessage = (msg) =>
    setMessages((prev) => [...prev, msg])

  const replaceLastMessage = (updater) =>
    setMessages((prev) => {
      const next = [...prev]
      next[next.length - 1] = updater(next[next.length - 1])
      return next
    })


  const sendMessage = useCallback(async () => {
    const text = inputText.trim()
    if (!text || isSending) return

    setError(null)
    setInputText('')


    const userMsg = {
      id:        `user-${Date.now()}`,
      role:      'user',
      content:   text,
      isLoading: false,
    }
    appendMessage(userMsg)


    const thinkingId = `ai-${Date.now()}`
    appendMessage({
      id:        thinkingId,
      role:      'assistant',
      content:   '',
      isLoading: true,
    })

    setIsSending(true)

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionId, message: text }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server error ${res.status}`)
      }


      replaceLastMessage(() => ({
        id:         thinkingId,
        role:       'assistant',
        content:    json.data.reply,
        isLoading:  false,
        ragSources: json.data.ragSources ?? [],
      }))
    } catch (err) {

      setMessages((prev) => prev.filter((m) => m.id !== thinkingId))
      setError(err.message)
    } finally {
      setIsSending(false)
    }
  }, [inputText, isSending, sessionId])


  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage]
  )

  return {
    messages,
    inputText,
    isSending,
    error,
    bottomRef,
    setInputText,
    sendMessage,
    onKeyDown,
  }
}
