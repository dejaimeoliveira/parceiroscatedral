const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://fnowzbxorbkewtcnudhr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZub3d6YnhvcmJrZXd0Y251ZGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5Mzk5MzUsImV4cCI6MjAzMzUxNTkzNX0.Qq2JQZuqJCoMZbPRcEP1a8ON4w3cY1ccUz1KLlDwKvM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data, error } = await supabase.from('mensalidadesrecebidas').select('*').limit(2)
  if (error) {
    console.error('API Error:', error)
  } else {
    console.log('--- SCHEMA ---')
    console.log('Columns:', data && data.length > 0 ? Object.keys(data[0]) : 'Table empty but exists')
    console.log('Sample Data:', data)
  }
}

run()
