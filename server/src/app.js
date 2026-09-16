import express     from 'express'
import cors        from 'cors'
import uploadRoutes from './routes/upload.routes.js'
import chatRoutes   from './routes/chat.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (such as mobile apps, curl, server-side calls)
      if (!origin) return cb(null, true)

      // Allow wildcard *
      if (allowedOrigins.includes('*')) return cb(null, true)

      // Exact match or wildcard pattern match (e.g. *.vercel.app)
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === origin) return true
        if (allowed.startsWith('*.')) {
          const domain = allowed.slice(2)
          return origin.endsWith(`.${domain}`) || origin === `https://${domain}` || origin === `http://${domain}`
        }
        return false
      })

      if (isAllowed) return cb(null, true)

      console.warn(`[cors] Rejected origin: ${origin}`)
      cb(new Error(`CORS: origin '${origin}' not allowed`))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)
app.options('*', cors())

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api', uploadRoutes)
app.use('/api', chatRoutes)

app.use(errorHandler)

export default app
