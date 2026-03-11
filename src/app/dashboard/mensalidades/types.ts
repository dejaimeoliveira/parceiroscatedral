export interface Mensalidade {
  id: number
  created_at: string
  nu_registro: number
  co_cliente: number
  no_cliente: string
  nu_cgc: string
  vr_areceber: number
  vr_pago: number
  vr_areceber_parceiro: number
  vr_pago_parceiro: number
  mes_ano_ref: string
  fg_sit_pagamento: string
  data_pagamento: string
  dt_recebimento?: string
  parceiro_id: number
  email_parceiro: string
}

