"use server";

import { createClient } from "@/utils/supabase/server";

export type Lancamento = {
  id: number;
  created_at: string;
  tipo: string;
  qtd: number;
  data_lancamento: string | null;
  descricao: string | null;
  email_parceiro: string;
  cnpj_empresa: string | null;
};

export type LancamentoComSaldo = Lancamento & {
  saldoAcumulado: number;
};

export async function getExtratoParceiro(
  email_parceiro: string,
): Promise<LancamentoComSaldo[]> {
  const supabase = await createClient();

  // Use order by data_lancamento asc for chronological order, then created_at to break ties
  const { data, error } = await supabase
    .from("lancamentos")
    .select("*")
    .eq("email_parceiro", email_parceiro)
    .order("data_lancamento", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Erro ao buscar extrato: " + error.message);
  }

  // Calculate Running Balance (Saldo)
  let saldoAtual = 0;
  const lancamentosComSaldo: LancamentoComSaldo[] = (data as Lancamento[]).map(
    (lancamento) => {
      const isCredito =
        lancamento.tipo?.toLowerCase().startsWith("c") ||
        lancamento.tipo?.toLowerCase() === "crédito";
      const valor = Number(lancamento.qtd) || 0;

      if (isCredito) {
        saldoAtual += valor;
      } else {
        saldoAtual -= valor;
      }

      return {
        ...lancamento,
        saldoAcumulado: saldoAtual,
      };
    },
  );

  return lancamentosComSaldo;
}

export async function getParceirosOptions() {
  const { checkRole } = await import("@/utils/supabase/check-role");
  const isAdmin = await checkRole(1);
  if (!isAdmin) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parceiros")
    .select("email, nome")
    .order("nome");

  if (error) {
    console.error("Error fetching parceiros options:", error);
    return [];
  }

  return data;
}
