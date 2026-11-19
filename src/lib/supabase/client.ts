import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing required environment variable: VITE_SUPABASE_URL')
}

if (!supabasePublishableKey) {
  throw new Error('Missing required environment variable: VITE_SUPABASE_PUBLISHABLE_KEY')
}

/**
 * Single shared Supabase client for the browser.
 *
 * Use the publishable (anon) key only. Service-role and secret keys must never
 * be exposed through VITE_ variables; backend work belongs in Edge Functions.
 */
export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey)
