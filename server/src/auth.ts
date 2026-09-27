import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'
import { User, type UserDoc } from './db.ts'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export function signToken(user: UserDoc): string {
  return jwt.sign({ sub: String(user._id), role: user.role }, JWT_SECRET, { expiresIn: '7d' })
}

export interface AuthedRequest extends Request {
  user?: UserDoc
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined
  if (!token) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string }
    const user = await User.findById(payload.sub)
    if (!user) {
      res.status(401).json({ error: 'User no longer exists' })
      return
    }
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireManager(req: AuthedRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'manager') {
    res.status(403).json({ error: 'Manager access required' })
    return
  }
  next()
}
