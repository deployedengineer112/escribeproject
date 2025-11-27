import type { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

function getSupabase(): SupabaseClient {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase environment variables are missing')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function getTranscript(_req: Request, res: Response) {
  try {
    const sb = getSupabase()
    const { data, error } = await sb.rpc('get_transcript')
    if (error) throw error
    const arr = Array.isArray(data) ? data : []
    return res.json(arr)
  } catch {
    return res.json([])
  }
}
