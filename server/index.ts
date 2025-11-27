import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })
import express from 'express'
import type {} from 'express'
import cors from 'cors'

const app = express()
const allowedOrigins = (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean) : ['http://localhost:5173', 'http://localhost:5174'])
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
app.use(cors(corsOptions))
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
  next()
})

import { api } from './routes/api.ts'


const port = process.env.PORT ? Number(process.env.PORT) : 3000
app.use('/api', api)
app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`)
})
