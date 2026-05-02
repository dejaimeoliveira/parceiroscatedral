"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { sendIndicacaoEmails } from "@/utils/mailgun";

export async function createIndicacao(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get form values and remove non-numeric chars from CNPJ and phone
  const nome_contato = formData.get("nome_contato") as string;
  const empresa = formData.get("empresa") as string;
  const email = formData.get("email") as string;
  const observacao = formData.get("observacao") as string | null;

  const rawCnpj = formData.get("cnpj") as string;
  const cnpj = rawCnpj.replace(/\D/g, "");

  const rawTelefone = formData.get("telefone") as string;
  const telefone = rawTelefone.replace(/\D/g, "");

  // Get Parceiro ID based on user email to link it properly
  const { data: parceiro, error: parceiroError } = await supabase
    .from("parceiros")
    .select("uid, email, nome")
    .eq("email", user.email)
    .single();

  if (parceiroError || !parceiro) {
    return {
      error: "Não foi possível identificar o seu cadastro de parceiro.",
    };
  }

  // Calculate dates
  const indicacaoDate = new Date();
  const limiteDate = new Date(indicacaoDate);
  limiteDate.setDate(limiteDate.getDate() + 90);

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
    // If it's a unique CNPJ constraint violation, show a friendly message
    if (error.code === "23505" && error.message.includes("cnpj")) {
      return { error: "Este CNPJ já foi indicado anteriormente." };
    }
    return { error: "Falha ao gravar indicação. Detalhes: " + error.message };
  }

  // Enviar email de notificação
  try {
    console.log("Iniciando envio de email para parceiro e admin...", {
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
    console.log("Resultado do envio de emails:", emailResult);
  } catch (err) {
    console.error(
      "Erro crítico ao disparar a função de email de indicação:",
      err,
    );
  }

  return { success: true };
}
