"use server";

import { createClient } from "@/utils/supabase/server";
import { checkRole } from "@/utils/supabase/check-role";
import { revalidatePath } from "next/cache";

export async function updateIndicacao(
  id: number,
  data: {
    empresa: string;
    nome_contato: string;
    cnpj: string;
    telefone: string;
    email: string;
    observacao: string;
  },
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autorizado");
  }

  const isAdmin = await checkRole(1);
  if (!isAdmin) {
    throw new Error("Apenas administradores podem editar indicações");
  }

  const cleanCnpj = data.cnpj.replace(/\D/g, "");
  const cleanTelefone = data.telefone.replace(/\D/g, "");

  const { error } = await supabase
    .from("indicacoes")
    .update({
      empresa: data.empresa,
      nome_contato: data.nome_contato,
      cnpj: cleanCnpj,
      telefone: cleanTelefone,
      email: data.email,
      observacao: data.observacao || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505" && error.message.includes("cnpj")) {
      throw new Error("Este CNPJ já está cadastrado em outra indicação.");
    }
    throw new Error("Falha ao atualizar indicação. Detalhes: " + error.message);
  }

  revalidatePath("/dashboard/indicacoes");
  return { success: true };
}
