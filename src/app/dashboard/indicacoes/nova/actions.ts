'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createIndicacao(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get form values and remove non-numeric chars from CNPJ and phone
  const nomeContato = formData.get('nomeContato') as string
  const empresa = formData.get('empresa') as string
  const email = formData.get('email') as string
  
  const rawCnpj = formData.get('cnpj') as string
  const cnpj = rawCnpj.replace(/\D/g, '')
  
  const rawTelefone = formData.get('telefone') as string
  const telefone = rawTelefone.replace(/\D/g, '')

  // Get Parceiro ID based on user email to link it properly
  const { data: parceiro, error: parceiroError } = await supabase
    .from('parceiros')
    .select('uid, email')
    .eq('email', user.email)
    .single()

  if (parceiroError || !parceiro) {
    return { error: 'Não foi possível identificar o seu cadastro de parceiro.' }
  }

  // Calculate dates
  const indicacaoDate = new Date()
  const limiteDate = new Date(indicacaoDate)
  limiteDate.setDate(limiteDate.getDate() + 90)

  const { error } = await supabase
    .from('indicacoes')
    .insert({
      empresa,
      nomeContato,
      cnpj,
      telefone,
      email,
      emailParceiro: parceiro.email,
      uidParceiro: parceiro.uid,
      dataIndicacao: indicacaoDate.toISOString(),
      dataLimite: limiteDate.toISOString()
    })

  if (error) {
    // If it's a unique CNPJ constraint violation, show a friendly message
    if (error.code === '23505' && error.message.includes('cnpj')) {
      return { error: 'Este CNPJ já foi indicado anteriormente.' }
    }
    return { error: 'Falha ao gravar indicação. Detalhes: ' + error.message }
  }

  return { success: true }
}
