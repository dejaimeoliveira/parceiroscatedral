"use server";

import { createClient } from "@/utils/supabase/server";
import { sendIndicacaoEmails } from "@/utils/mailgun";

export async function submitIndicacaoPublica(formData: FormData) {
  const supabase = await createClient();

  const token = formData.get("token") as string;
  if (!token) {
    return { error: "Token inválido ou ausente." };
  }

  // Se o token for um UUID sem traços (32 caracteres), adicionamos os traços
  const formattedToken =
    token.length === 32
      ? token.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5")
      : token;

  // Buscar parceiro pelo uid (token)
  const { data: parceiro, error: parceiroError } = await supabase
    .from("parceiros")
    .select("uid, email, nome")
    .eq("uid", formattedToken)
    .single();

  if (parceiroError || !parceiro) {
    return { error: "Link de indicação inválido ou parceiro não encontrado." };
  }

  // Obter valores do form e limpar não-numéricos do CNPJ e telefone
  const nome_contato = formData.get("nome_contato") as string;
  const empresa = formData.get("empresa") as string;
  const email = formData.get("email") as string;
  const observacao = formData.get("observacao") as string | null;

  const rawCnpj = formData.get("cnpj") as string;
  const cnpj = rawCnpj.replace(/\D/g, "");

  const rawTelefone = formData.get("telefone") as string;
  const telefone = rawTelefone.replace(/\D/g, "");

  // Calcular datas
  const indicacaoDate = new Date();
  const limiteDate = new Date(indicacaoDate);
  limiteDate.setDate(limiteDate.getDate() + 90);

  // Inserir indicação
  const { error } = await supabase.from("indicacoes").insert({
    empresa,
    nome_contato,
    cnpj,
    telefone,
    email,
    observacao,
    email_parceiro: parceiro.email,
    uid_parceiro: parceiro.uid,
    data_indicacao: indicacaoDate.toISOString(),
    data_limite: limiteDate.toISOString(),
  });

  if (error) {
    // Violação de CNPJ único (se aplicável ao schema)
    if (error.code === "23505" && error.message.includes("cnpj")) {
      return { error: "Este CNPJ já foi indicado anteriormente." };
    }
    return {
      error: "Falha ao registrar indicação. Detalhes: " + error.message,
    };
  }

  // Enviar email de notificação
  try {
    console.log("Iniciando envio de email para parceiro e admin (Pública)...", {
      parceiroEmail: parceiro.email,
      empresa,
    });
    const emailResult = await sendIndicacaoEmails(
      parceiro.nome || "Parceiro",
      parceiro.email,
      empresa,
      nome_contato,
      telefone,
      email || "Não informado",
    );
    console.log("Resultado do envio de emails (Pública):", emailResult);
  } catch (err) {
    console.error(
      "Erro crítico ao disparar a função de email de indicação (Pública):",
      err,
    );
  }

  return { success: true };
}
