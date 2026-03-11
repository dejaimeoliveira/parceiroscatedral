import { createClient } from '@/utils/supabase/server'

export async function checkParceirosSchema() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('parceiros').select('*').limit(1)
  console.log('--- PARCEIROS SCHEMA CHECKER ---')
  if (error) {
    console.error('Error fetching parceiros:', error)
  } else {
    console.log('Columns existing in parceiros:', data && data.length > 0 ? Object.keys(data[0]) : 'No data, but table exists')
    console.log('Data sample:', data)
  }
}

checkParceirosSchema()
