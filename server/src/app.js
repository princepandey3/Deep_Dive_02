import express     from 'express'
import cors        from 'cors'
import uploadRoutes from './routes/upload.routes.js'
import chatRoutes   from './routes/chat.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error(`CORS: origin '${origin}' not allowed`))
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api', uploadRoutes)
app.use('/api', chatRoutes)

app.use(errorHandler)

export default app
