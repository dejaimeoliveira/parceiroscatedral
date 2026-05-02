"use server";

import { createClient } from "@/utils/supabase/server";
import { checkRole } from "@/utils/supabase/check-role";

export type LancamentoData = {
  data_lancamento: string;
  email_parceiro: string;
  cnpj_empresa: string;
  tipo: string;
  qtd: number;
  descricao: string;
};

export async function createLancamento(data: LancamentoData) {
  // 1. Verify Authentication and Role
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const isAdmin = await checkRole(1);
  if (!isAdmin) {
    return {
      success: false,
      error: "Acesso Negado: Apenas administradores podem gravar CATs.",
    };
  }

  // 2. Validate input and trim spaces
  if (
    !data.data_lancamento ||
    !data.email_parceiro ||
    !data.tipo ||
    !data.qtd
  ) {
    return { success: false, error: "Preencha todos os campos obrigatórios." };
  }

  // Remove mask from CNPJ before saving
  const cleanCnpj = data.cnpj_empresa
    ? data.cnpj_empresa.replace(/\D/g, "")
    : null;

  // 3. Insert into the database
  const { error } = await supabase.from("lancamentos").insert([
    {
      data_lancamento: data.data_lancamento,
      email_parceiro: data.email_parceiro,
      cnpj_empresa: cleanCnpj,
      tipo: data.tipo,
      qtd: data.qtd,
      descricao: data.descricao,
    },
  ]);

  if (error) {
    console.error("Database Error inserting lancamento:", error);
    return {
      success: false,
      error: "Erro ao gravar lançamento no banco de dados. " + error.message,
    };
  }

  return { success: true };
}
