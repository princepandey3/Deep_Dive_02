import express     from 'express'
import cors        from 'cors'
import uploadRoutes from './routes/upload.routes.js'
import chatRoutes   from './routes/chat.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175')
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

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api', uploadRoutes)
app.use('/api', chatRoutes)

app.use(errorHandler)

export default app
