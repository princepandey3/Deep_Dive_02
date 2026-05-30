export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500


  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
    })
  }


  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ success: false, error: err.message })
  }


  if (status >= 500) {
    console.error('[DeepDive] Unhandled error:', err)
  }

  res.status(status).json({
    success: false,
    error: status < 500 ? err.message : 'Internal server error',
  })
}
