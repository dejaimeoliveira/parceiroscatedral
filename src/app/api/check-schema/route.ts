import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('parceiros').select('*').limit(1)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  const columns = data && data.length > 0 ? Object.keys(data[0]) : 'No data, but table exists'
  return NextResponse.json({ columns, sample: data })
}
