import { createClient } from '@/utils/supabase/server'

export async function checkSchema() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('mensalidadesrecebidas').select('*').limit(1)
  console.log('--- SCHEMA CHECKER ---')
  if (error) {
    console.error('Error fetching mensalidadesrecebidas:', error)
  } else {
    console.log('Columns existing in mensalidadesrecebidas:', data && data.length > 0 ? Object.keys(data[0]) : 'No data, but table exists')
    console.log('Data:', data)
  }
  return data
}

checkSchema()
