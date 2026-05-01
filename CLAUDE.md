# Parceiros.com.br

## Stack

- Next.js (App Router)
- Supabase (PostgreSQL)
- Deploy via GitHub

## Banco de dados

- Cliente Supabase configurado em `@/lib/supabaseClient`
- Colunas usam camelCase entre aspas duplas (ex: "emailParceiro", "dataIndicacao")
- Saldo do parceiro calculado pela view `extratolancamentos`

## Tabelas principais

- `parceiros` — uid, email, emailVendedor, token_indicacao
- `indicacoes` — cnpj (único), uidParceiro, emailParceiro, origem ('parceiro' | 'link')
- `lancamentos` — tipo ('Crédito' | 'Débito'), qtd, emailParceiro
- `mensalidadesrecebidas` — nu_cgc, vr_areceber, dt_recebimento, parceiro_id
- `extratolancamentos` — view com saldo acumulado por parceiro
