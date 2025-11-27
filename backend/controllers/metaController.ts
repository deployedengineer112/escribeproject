import type { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

function getSupabase(): SupabaseClient {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase environment variables are missing')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function listProviders(_req: Request, res: Response) {
  try {
    const sb = getSupabase()
    const { data, error } = await sb.rpc('list_providers')
    if (error) throw error
    return res.json(Array.isArray(data) ? data : [])
  } catch {
    return res.json([])
  }
}

export async function listStatuses(_req: Request, res: Response) {
  try {
    const sb = getSupabase()
    const { data, error } = await sb.rpc('list_statuses')
    if (error) throw error
    return res.json(Array.isArray(data) ? data : [])
  } catch {
    return res.json([])
  }
}
