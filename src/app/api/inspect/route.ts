import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: user } = await supabase.auth.getUser()

    // Assuming we do have some rows there, let's fetch any row
    const { data, error } = await supabase
      .from('mensalidadesrecebidas')
      .select('*')
      .limit(2)

    return NextResponse.json({
      success: true,
      error,
      columns: data && data.length > 0 ? Object.keys(data[0]) : null,
      data
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message })
  }
}
