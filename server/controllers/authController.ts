import type { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getSupabase(): SupabaseClient {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase environment variables are missing')
  return createClient(url, key, { auth: { persistSession: false } })
}

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function signJwt(payload: { sub: string; iat?: number; exp?: number }): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 60 * 60 * 12
  const body = { ...payload, iat: payload.iat ?? now, exp: payload.exp ?? exp }
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not configured')
  const p1 = b64url(JSON.stringify(header))
  const p2 = b64url(JSON.stringify(body))
  const data = `${p1}.${p2}`
  const sig = crypto.createHmac('sha256', secret).update(data).digest()
  const p3 = b64url(sig)
  return `${data}.${p3}`
}

export async function signin(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) return res.status(400).json({ ok: false, error: 'Missing email or password' })
  try {
    const sb = getSupabase()
    const { data, error } = await sb.rpc('check_login', { p_email: email, p_password: password })
    if (error) throw error
    const ok = Array.isArray(data) ? Boolean(data[0]) : Boolean(data)
    if (ok) {
      const token = signJwt({ sub: email })
      return res.json({ ok: true, token, user: { email } })
    }
    return res.status(401).json({ ok: false, error: 'Invalid credentials' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, error: 'Supabase client not initialized' })
  }
}
