import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { MongoMemoryServer } from 'mongodb-memory-server'

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI
  if (uri) {
    await mongoose.connect(uri)
    await seedIfEmpty()
    return
  }

  // No URI configured: fall back to an in-memory database seeded with demo data.
  const mem = await MongoMemoryServer.create()
  await mongoose.connect(mem.getUri('devonboard'))
  console.log('[db] MONGODB_URI not set — using in-memory database (data is lost on restart)')
  await seedIfEmpty()
}

const taskSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    automatedCheck: { type: String, default: '' },
    estimatedTime: { type: String, default: '' },
    required: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
)

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['manager', 'engineer'], required: true },
  },
  { timestamps: true },
)

export interface TaskDoc extends mongoose.Document {
  order: number
  title: string
  description: string
  automatedCheck: string
  estimatedTime: string
  required: boolean
  tags: string[]
}

export interface UserDoc extends mongoose.Document {
  username: string
  passwordHash: string
  role: 'manager' | 'engineer'
}

export const Task = mongoose.model<TaskDoc>('Task', taskSchema)
export const User = mongoose.model<UserDoc>('User', userSchema)

const DEMO_TASKS = [
  { order: 1, title: 'Clone Repository & SSH Keys', description: 'Clone the service repo and verify ed25519 SSH key is present and registered on GitHub.', automatedCheck: 'git ls-remote', estimatedTime: '5 min', required: true, tags: ['git', 'security'] },
  { order: 2, title: 'Install Node Dependencies', description: 'Run pnpm install from the repository root. Lockfile must be committed.', automatedCheck: 'pnpm install --frozen-lockfile', estimatedTime: '3 min', required: true, tags: ['node', 'pnpm'] },
  { order: 3, title: 'Configure Environment Variables', description: 'Copy .env.example to .env.local and fill in required values.', automatedCheck: 'test -f .env.local', estimatedTime: '5 min', required: true, tags: ['config'] },
  { order: 4, title: 'Start Docker Containers', description: 'Launch Postgres, Redis, and MinIO using docker compose up -d.', automatedCheck: 'docker compose ps --status running', estimatedTime: '2 min', required: true, tags: ['docker', 'infra'] },
  { order: 5, title: 'Run Database Migrations', description: 'Apply all pending Drizzle migrations to the local Postgres instance.', automatedCheck: 'pnpm db:migrate', estimatedTime: '1 min', required: true, tags: ['database'] },
  { order: 6, title: 'Run Test Suite', description: 'Execute the full Vitest suite to verify setup integrity.', automatedCheck: 'pnpm test', estimatedTime: '3 min', required: false, tags: ['testing'] },
]

async function seedIfEmpty(): Promise<void> {
  if ((await Task.countDocuments()) === 0) await Task.insertMany(DEMO_TASKS)
  if ((await User.countDocuments()) > 0) return

  const hash = (p: string) => bcrypt.hashSync(p, 10)
  await User.insertMany([
    { username: 'manager', passwordHash: hash(process.env.DEMO_MANAGER_PASSWORD || 'password123'), role: 'manager' },
    { username: 'engineer', passwordHash: hash(process.env.DEMO_ENGINEER_PASSWORD || 'password123'), role: 'engineer' },
  ])
}
