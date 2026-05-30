import React from 'react'
import { AlertCircle } from 'lucide-react'

export default function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p
      id={id}
      role="alert"
      className="flex items-center gap-1.5 mt-2 text-pulse text-xs font-mono"
    >
      <AlertCircle size={12} className="flex-shrink-0" />
      {message}
    </p>
  )
}
