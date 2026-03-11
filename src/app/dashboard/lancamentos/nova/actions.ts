'use server'

import { createClient } from '@/utils/supabase/server'
import { checkRole } from '@/utils/supabase/check-role'

export type LancamentoData = {
  dataLancamento: string;
  emailParceiro: string;
  cnpjEmpresa: string;
  tipo: string;
  qtd: number;
  descricao: string;
}

export async function createLancamento(data: LancamentoData) {
  // 1. Verify Authentication and Role
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Usuário não autenticado.' }
  }

  const isAdmin = await checkRole(1)
  if (!isAdmin) {
    return { success: false, error: 'Acesso Negado: Apenas administradores podem gravar CATs.' }
  }

  // 2. Validate input and trim spaces
  if (!data.dataLancamento || !data.emailParceiro || !data.tipo || !data.qtd) {
    return { success: false, error: 'Preencha todos os campos obrigatórios.' }
  }

  // Remove mask from CNPJ before saving
  const cleanCnpj = data.cnpjEmpresa ? data.cnpjEmpresa.replace(/\D/g, '') : null;

  // 3. Insert into the database
  const { error } = await supabase
    .from('lancamentos')
    .insert([{
      dataLancamento: data.dataLancamento,
      emailParceiro: data.emailParceiro,
      cnpjEmpresa: cleanCnpj,
      tipo: data.tipo,
      qtd: data.qtd,
      descricao: data.descricao
    }])

  if (error) {
    console.error('Database Error inserting lancamento:', error)
    return { success: false, error: 'Erro ao gravar lançamento no banco de dados. ' + error.message }
  }

  return { success: true }
}
