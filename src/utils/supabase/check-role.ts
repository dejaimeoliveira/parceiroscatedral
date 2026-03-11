import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function checkRole(roleId: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: parceiro, error } = await supabase
    .from('parceiros')
    .select('idFuncao')
    .eq('uid', user.id)
    .single()

  console.log('Role check for:', user.email, 'idFuncao:', parceiro?.idFuncao, 'Comparing to roleId:', roleId)

  return Number(parceiro?.idFuncao) === roleId
}
