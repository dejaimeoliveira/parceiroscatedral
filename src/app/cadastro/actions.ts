'use server'

import { createClient } from '@/utils/supabase/server'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nome = formData.get('nome') as string
  const telefone = formData.get('telefone') as string
  const idFuncaoRaw = formData.get('idFuncao') as string

  // Handle phone mask stripping
  const telefoneLimpo = telefone ? telefone.replace(/\D/g, '') : ''
  const idFuncao = parseInt(idFuncaoRaw, 10)

  // 1. Validate data
  if (!email || !password || !nome) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  // 2. Perform Supabase Sign Up
  // This triggers a confirmation email if enabled in Supabase Dashboard
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: nome, // metadata for the auth engine
      }
    }
  })

  if (authError) {
    return { error: 'Ocorreu um erro no servidor de autenticação. Detalhes: ' + authError.message }
  }

  // 3. Create Partner record in DB
  if (authData.user) {
    const { error: insertError } = await supabase.from('parceiros').insert({
      uid: authData.user.id,
      nome,
      email,
      telefone: telefoneLimpo,
      idFuncao: isNaN(idFuncao) ? null : idFuncao,
      ativo: true, // or false depending on whether you want them inactive until email confirmation
      // If the email is unique but auth fails, it will hit an error here, but Supabase Auth takes precedence
    })

    if (insertError) {
      return { error: 'Cadastro autenticado, mas o vínculo de parceiro falhou. Contate o administrador. Detalhes: ' + insertError.message }
    }
  }

  return { success: true }
}
