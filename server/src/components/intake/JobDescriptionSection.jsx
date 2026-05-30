import React from 'react'
import JdModeToggle from './JdModeToggle.jsx'
import JdTextInput  from './JdTextInput.jsx'
import JdFileInput  from './JdFileInput.jsx'

export default function JobDescriptionSection({
  mode,
  onModeChange,
  jdText,
  onJdTextChange,
  jdFile,
  onJdFileChange,
  onJdFileRemove,
  error,
}) {
  return (
    <div>
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <span className="label-mono">02 — Job Description</span>
        <JdModeToggle mode={mode} onChange={onModeChange} />
      </div>

      {}
      {mode === 'text' ? (
        <JdTextInput
          value={jdText}
          onChange={onJdTextChange}
          error={error}
        />
      ) : (
        <JdFileInput
          file={jdFile}
          onChange={onJdFileChange}
          onRemove={onJdFileRemove}
          error={error}
        />
      )}
    </div>
  )
}
