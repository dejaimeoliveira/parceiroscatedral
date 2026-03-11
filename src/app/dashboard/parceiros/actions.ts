'use server'

import { createClient } from '@/utils/supabase/server'
import { checkRole } from '@/utils/supabase/check-role'

export type ParceiroRow = {
  id: number;
  uid: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  idFuncao: number;
  ativo: boolean;
  emailVendedor: string;
  pixConta: string;
}

export async function getParceiros() {
  const isAdmin = await checkRole(1)
  if (!isAdmin) {
    throw new Error('Acesso negado. Apenas administradores podem listar os parceiros.')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('parceiros')
    .select('id, uid, nome, email, telefone, cpf, idFuncao, ativo, emailVendedor, pixConta')
    .order('nome', { ascending: true })

  if (error) {
    throw new Error('Erro ao buscar parceiros: ' + error.message)
  }

  return data as ParceiroRow[]
}

export async function updateParceiro(id: number, updates: Partial<ParceiroRow>) {
  const isAdmin = await checkRole(1)
  if (!isAdmin) {
    throw new Error('Acesso negado. Apenas administradores podem atualizar parceiros.')
  }

  const supabase = await createClient()

  // Limpando máscaras de telefone e cpf caso venham
  const cleanedUpdates = { ...updates }
  
  if (cleanedUpdates.telefone) {
    cleanedUpdates.telefone = cleanedUpdates.telefone.replace(/\D/g, '')
  }
  if (cleanedUpdates.cpf) {
    cleanedUpdates.cpf = cleanedUpdates.cpf.replace(/\D/g, '')
  }

  const { data, error } = await supabase
    .from('parceiros')
    .update({
      telefone: cleanedUpdates.telefone,
      cpf: cleanedUpdates.cpf,
      idFuncao: cleanedUpdates.idFuncao,
      ativo: cleanedUpdates.ativo,
      emailVendedor: cleanedUpdates.emailVendedor,
      pixConta: cleanedUpdates.pixConta
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao atualizar parceiro: ' + error.message)
  }

  return data
}
