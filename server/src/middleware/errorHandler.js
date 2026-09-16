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
    console.error('[DeepDive] Server error:', err)
  }

  let errorMessage = err.message || 'Internal server error'
  if (errorMessage.includes('ENOTFOUND') && errorMessage.includes('supabase.co')) {
    errorMessage = 'Failed to connect to Supabase: domain not found. If your Supabase project was paused due to inactivity, please unpause it in your Supabase dashboard.'
  } else if (errorMessage.includes('fetch failed')) {
    errorMessage = `Network request failed: ${errorMessage}. Please check your database / API connectivity.`
  }

  res.status(status).json({
    success: false,
    error: errorMessage,
  })
}
