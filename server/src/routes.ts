import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import { exec } from 'child_process'
import { Task, User, type TaskDoc } from './db.ts'
import { signToken, requireAuth, requireManager } from './auth.ts'

export const api = Router()

// ── Auth ──────────────────────────────────────────────────────────────────────

api.post('/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {}
  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'username and password are required' })
    return
  }
  const user = await User.findOne({ username: username.toLowerCase().trim() })
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }
  res.json({ token: signToken(user), role: user.role, username: user.username })
})

// ── Tasks (engineer-visible checklist / manager-configurable workflow) ────────

function toClient(doc: TaskDoc) {
  const { _id, order, title, description, automatedCheck, estimatedTime, required, tags } = doc
  return { id: String(_id), order, title, description, automatedCheck, estimatedTime, required, tags }
}

api.get('/tasks', requireAuth, async (_req, res) => {
  const tasks = await Task.find().sort('order')
  res.json(tasks.map(toClient))
})

api.post('/tasks', requireAuth, requireManager, async (req: Request, res: Response) => {
  const { title } = req.body ?? {}
  if (typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ error: 'title is required' })
    return
  }
  const last = await Task.findOne().sort('-order')
  const task = await Task.create({
    title: title.trim(),
    order: (last?.order ?? 0) + 1,
    description: str(req.body.description),
    automatedCheck: str(req.body.automatedCheck),
    estimatedTime: str(req.body.estimatedTime),
    required: req.body.required !== false,
    tags: strArray(req.body.tags),
  })
  res.status(201).json(toClient(task))
})

api.patch('/tasks/:id', requireAuth, requireManager, async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id)
  if (!task) {
    res.status(404).json({ error: 'Task not found' })
    return
  }
  const b = req.body ?? {}
  if (b.title !== undefined) task.title = str(b.title) || task.title
  if (b.description !== undefined) task.description = str(b.description)
  if (b.automatedCheck !== undefined) task.automatedCheck = str(b.automatedCheck)
  if (b.estimatedTime !== undefined) task.estimatedTime = str(b.estimatedTime)
  if (b.required !== undefined) task.required = Boolean(b.required)
  if (b.tags !== undefined) task.tags = strArray(b.tags)
  await task.save()
  res.json(toClient(task))
})

api.post('/tasks/:id/run', requireAuth, async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id)
  if (!task) {
    res.status(404).json({ error: 'Task not found' })
    return
  }

  const command = task.automatedCheck?.trim()
  if (!command) {
    res.json({ passed: true, output: '(no check configured)', durationMs: 0 })
    return
  }

  const start = Date.now()
  const result = await new Promise<{ passed: boolean; output: string }>((resolve) => {
    const child = exec(command, { timeout: 30_000 }, (error, stdout, stderr) => {
      const output = [stdout, stderr].filter(Boolean).join('\n').trim()
      resolve({ passed: !error, output: output || '(no output)' })
    })
    // Ensure the process is killed on timeout
    child.on('error', () => {})
  })

  res.json({ passed: result.passed, output: result.output, durationMs: Date.now() - start })
})

api.delete('/tasks/:id', requireAuth, requireManager, async (req: Request, res: Response) => {
  const deleted = await Task.findByIdAndDelete(req.params.id)
  if (!deleted) {
    res.status(404).json({ error: 'Task not found' })
    return
  }
  res.status(204).end()
})

api.post('/tasks/reorder', requireAuth, requireManager, async (req: Request, res: Response) => {
  const ids = req.body?.ids
  if (!Array.isArray(ids) || !ids.every(id => typeof id === 'string')) {
    res.status(400).json({ error: 'ids must be an array of task ids' })
    return
  }
  await Promise.all(ids.map((id, i) => Task.findByIdAndUpdate(id, { order: i + 1 })))
  const tasks = await Task.find().sort('order')
  res.json(tasks.map(toClient))
})

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}
