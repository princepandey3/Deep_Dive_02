import { useState, useCallback, useRef } from 'react'

export function useIntakeForm() {
  const [resumeFile, setResumeFile]   = useState(null)
  const [jdText, setJdText]           = useState('')
  const [jdFile, setJdFile]           = useState(null)
  const [jdMode, setJdMode]           = useState('text')
  const [dragState, setDragState]     = useState('idle')
  const [errors, setErrors]           = useState({})
  const [submitted, setSubmitted]     = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiResult, setApiResult]     = useState(null)
  const dragCounter                   = useRef(0)


  const isPDF = (file) => file?.type === 'application/pdf'

  const clearError = (key) =>
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next })


  const acceptResumeFile = useCallback((file) => {
    if (!isPDF(file)) {
      setDragState('reject')
      setErrors((e) => ({ ...e, resume: 'Only PDF files are accepted.' }))
      setTimeout(() => setDragState('idle'), 1200)
      return
    }
    setResumeFile(file)
    setDragState('idle')
    clearError('resume')
  }, [])

  const onDragEnter = useCallback((e) => {
    e.preventDefault()
    dragCounter.current += 1
    if (dragCounter.current === 1) setDragState('over')
  }, [])

  const onDragLeave = useCallback((e) => {
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current === 0) setDragState('idle')
  }, [])

  const onDragOver = useCallback((e) => { e.preventDefault() }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    dragCounter.current = 0
    const file = e.dataTransfer.files?.[0]
    if (file) acceptResumeFile(file)
  }, [acceptResumeFile])

  const onResumeInputChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) acceptResumeFile(file)
  }, [acceptResumeFile])

  const removeResume = useCallback(() => setResumeFile(null), [])


  const onJdTextChange = useCallback((e) => {
    setJdText(e.target.value)
    if (e.target.value.trim()) clearError('jd')
  }, [])

  const onJdFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) { setJdFile(file); clearError('jd') }
  }, [])

  const removeJdFile = useCallback(() => setJdFile(null), [])

  const switchJdMode = useCallback((mode) => {
    setJdMode(mode)
    setJdText('')
    setJdFile(null)
    clearError('jd')
  }, [])


  const validate = () => {
    const next = {}
    if (!resumeFile)                              next.resume = 'Please upload your résumé PDF.'
    if (jdMode === 'text' && !jdText.trim())      next.jd     = 'Please enter a job description.'
    if (jdMode === 'file' && !jdFile)             next.jd     = 'Please upload a job description file.'
    setErrors(next)
    return Object.keys(next).length === 0
  }


  const onSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!validate()) return


    const formData = new FormData()
    formData.append('resume', resumeFile)


    let jdContent = jdText.trim()
    if (jdMode === 'file' && jdFile) {
      jdContent = await jdFile.text()
    }
    formData.append('jobDescription', jdContent)

    setIsSubmitting(true)
    clearError('api')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,


      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server error ${res.status}`)
      }

      setApiResult(json.data)
      setSubmitted(true)
    } catch (err) {
      setErrors((prev) => ({ ...prev, api: err.message }))
    } finally {
      setIsSubmitting(false)
    }

  }, [resumeFile, jdText, jdFile, jdMode])

  const resetForm = useCallback(() => {
    setResumeFile(null)
    setJdText('')
    setJdFile(null)
    setJdMode('text')
    setErrors({})
    setSubmitted(false)
    setIsSubmitting(false)
    setApiResult(null)
  }, [])


  const isReady =
    !!resumeFile &&
    (jdMode === 'text' ? jdText.trim().length > 0 : !!jdFile)

  return {
    resumeFile, jdText, jdFile, jdMode,
    dragState, errors, isReady, submitted,
    isSubmitting, apiResult,
    handlers: {
      onDragEnter, onDragLeave, onDragOver, onDrop,
      onResumeInputChange, removeResume,
      onJdTextChange, onJdFileChange, removeJdFile,
      switchJdMode, onSubmit, resetForm,
    },
  }
}
