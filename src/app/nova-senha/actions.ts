'use server'

import { createClient } from '@/utils/supabase/server'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string

  if (!password || password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  // The user should have a valid session initiated by clicking the email reset link
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'Erro ao atualizar a senha. O link pode ter expirado. Detalhes: ' + error.message }
  }

  return { success: true }
}
