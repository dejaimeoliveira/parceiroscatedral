'use server'

import { createClient } from '@/utils/supabase/server'

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Por favor, informe um email válido.' }
  }

  // Uses the Next.js standard URL base to set the callback properly
  // Since we don't have a verified top-level domain on this env, we rely on NEXT_PUBLIC_SUPABASE_URL origin redirect configurations
  // The redirect URL should be whitelisted in Supabase Dashboard (Authentication -> URL Configuration)
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/nova-senha`,
  })

  if (error) {
    return { error: 'Falha ao solicitar o reset. Detalhes: ' + error.message }
  }

  return { success: true }
}
