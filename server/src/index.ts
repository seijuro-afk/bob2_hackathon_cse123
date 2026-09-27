import express from 'express'
import cors from 'cors'
import { connectDb } from './db.ts'
import { api } from './routes.ts'

const PORT = Number(process.env.PORT) || 4000

await connectDb()

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())
app.use('/api', api)
app.listen(PORT, () => console.log(`[server] DevOnboard API listening on http://localhost:${PORT}`))
