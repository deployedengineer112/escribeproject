import 'dotenv/config'
import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

import { listProviders, listStatuses } from '../controllers/metaController'
import { signin } from '../controllers/authController'
import { getTranscript } from '../controllers/transcriptController'
import crypto from 'crypto'

export const api = Router()

function getSupabase(): SupabaseClient {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase environment variables are missing')
  return createClient(url, key, { auth: { persistSession: false } })
}

type WithTime = { appointment_time?: string | null; time?: unknown }
function addTimeField<T extends WithTime>(row: T): T & { time: unknown } {
  const time = row.appointment_time ?? row.time ?? null
  return { ...(row as T), time }
}

function toIsoDate(mmddyyyy: string): string | null {
  const parts = mmddyyyy.split('/')
  if (parts.length !== 3) return null
  const [mm, dd, yyyy] = parts
  if (!mm || !dd || !yyyy) return null
  const m = mm.padStart(2, '0')
  const d = dd.padStart(2, '0')
  return `${yyyy}-${m}-${d}`
}

function toMmDdYyyy(iso: string | null | undefined): string {
  if (!iso) return ''
  const [yyyy, mm, dd] = String(iso).split('-')
  if (!yyyy || !mm || !dd) return ''
  return `${mm}/${dd}/${yyyy}`
}

function calcAge(iso: string | null | undefined): number {
  if (!iso) return 0
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 0
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return Math.max(0, age)
}

api.get('/hello', (_req, res) => {
  res.send('hello world')
})

api.get('/patients', async (req, res) => {
  try {
    const sb = getSupabase()
    const { data, error } = await sb.rpc('list_patients')
    if (error) console.error(error)
    if (!error && Array.isArray(data)) return res.json(data.map(addTimeField))
  } catch (err) {
    console.error(err)
  }
  res.status(502).json({ error: 'Unable to fetch patients' })
})

api.get('/patient/:id', async (req, res) => {
  try {
    const sb = getSupabase()
    const { data, error } = await sb.rpc('get_patient', { p_id: req.params.id })
    if (error) console.error(error)
    if (!error && data) {
      const row: WithTime = Array.isArray(data) ? (data[0] as WithTime) : (data as WithTime)
      return res.json(addTimeField(row))
    }
  } catch (err) {
    console.error(err)
  }
  return res.status(404).json({ error: 'Not Found' })
})

api.post('/patient', async (req, res) => {
  const { firstName, lastName, dob, provider } = req.body as { firstName?: string; lastName?: string; dob?: string; provider?: string }
  if (!firstName || !lastName || !dob || !provider) return res.status(400).json({ error: 'Missing fields' })
  try {
    const sb = getSupabase()
    const iso = toIsoDate(dob)
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      dob: iso,
      provider,
      appointment_time: `${hh}:${mm}`,
      recording: 'none',
      transfer: 'pending',
      finalized: false,
    }
    const { data, error } = await sb.from('patients').insert([payload]).select()
    if (error) {
      console.error(error)
      return res.status(502).json({ error: error.message || 'Insert error' })
    }
    if (Array.isArray(data) && data[0]) {
      const row = data[0] as { id: string | number; first_name?: string; last_name?: string; dob?: string | null; provider?: string; appointment_time?: string | null; recording?: string; transfer?: string; finalized?: boolean }
      const name = `${row.first_name ?? ''}${row.last_name ? ` ${row.last_name}` : ''}`.trim()
      const time = row.appointment_time ?? null
      const dobStr = toMmDdYyyy(row.dob)
      const age = calcAge(row.dob)
      const resp = {
        id: String(row.id),
        name,
        time,
        dob: dobStr,
        age,
        provider: row.provider ?? '',
        recording: (row.recording ?? 'none') as string,
        transfer: (row.transfer ?? 'pending') as string,
        showTick: false,
        finalized: Boolean(row.finalized),
      }
      return res.json(resp)
    }
  } catch (err) {
    console.error(err)
    return res.status(502).json({ error: 'Unable to create patient' })
  }
  res.status(502).json({ error: 'Unable to create patient' })
})

api.post('/patient/:id/recording', async (req, res) => {
  const id = req.params.id
  const { dataUrl } = req.body as { dataUrl?: string }
  if (!id || !dataUrl || typeof dataUrl !== 'string') return res.status(400).json({ error: 'Missing id or dataUrl' })
  try {
    const header = dataUrl.split(',')[0] || ''
    const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : ''
    const mime = header.startsWith('data:') ? header.slice(5).split(';')[0] : 'audio/webm'
    const buf = Buffer.from(base64, 'base64')
    const pgbytea = `\\x${buf.toString('hex')}`
    const sb = getSupabase()
    const { data, error } = await sb
      .from('patients')
      .update({ recording_blob: pgbytea, recording_mime: mime, recording: 'complete' })
      .eq('id', id)
      .select('id')
    if (error) {
      console.error(error)
      return res.status(502).json({ error: error.message || 'Update error' })
    }
    const row: { id?: string | number } | undefined = Array.isArray(data) ? data[0] : (data || undefined)
    return res.json({ id: String((row && row.id) ?? id), size: buf.length })
  } catch (err) {
    console.error(err)
    return res.status(502).json({ error: 'Unable to save recording' })
  }
})

api.get('/patient/:id/recording', async (req, res) => {
  const id = req.params.id
  if (!id) return res.status(400).json({ error: 'Missing id' })
  try {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('patients')
      .select('recording_blob, recording_mime')
      .eq('id', id)
      .limit(1)
    if (error) {
      console.error(error)
      return res.status(502).json({ error: error.message || 'Fetch error' })
    }
    const row: { recording_blob?: string | null; recording_mime?: string | null } | undefined = Array.isArray(data) ? data[0] : (data || undefined)
    const hex = (row && row.recording_blob) ? String(row.recording_blob).replace(/^\\x/, '') : ''
    if (!hex) return res.status(404).json({ error: 'No recording' })
    const buf = Buffer.from(hex, 'hex')
    res.set('Content-Type', (row && row.recording_mime) || 'audio/webm')
    return res.send(buf)
  } catch (err) {
    console.error(err)
    return res.status(502).json({ error: 'Unable to fetch recording' })
  }
})

api.get('/providers', listProviders)
api.get('/statuses', listStatuses)
api.post('/signin', signin)
api.get('/transcript', getTranscript)
function b64urlToString(str: string): string {
  const s = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = s.length % 4 === 2 ? '==' : s.length % 4 === 3 ? '=' : ''
  return Buffer.from(s + pad, 'base64').toString('utf8')
}

function verifyJwt(token: string): { sub: string; iat: number; exp: number } | null {
  const secret = process.env.JWT_SECRET
  if (!secret) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [h, p, sig] = parts
  const data = `${h}.${p}`
  const actual = crypto.createHmac('sha256', secret).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  if (actual !== sig) return null
  try {
    const payload = JSON.parse(b64urlToString(p)) as { sub: string; iat: number; exp: number }
    if (!payload || typeof payload.sub !== 'string') return null
    const now = Math.floor(Date.now() / 1000)
    if (typeof payload.exp === 'number' && payload.exp < now) return null
    return payload
  } catch {
    return null
  }
}

api.use((req, res, next) => {
  if (req.path === '/signin' || req.path === '/hello') return next()
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const payload = token ? verifyJwt(token) : null
  if (!payload) return res.status(401).json({ error: 'Unauthorized' })
  ;(req as unknown as { user: { sub: string; iat: number; exp: number } }).user = payload
  next()
})
