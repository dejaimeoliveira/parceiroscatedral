# Parceiros.com.br

## Stack

- Next.js (App Router)
- Supabase (PostgreSQL)
- Deploy via GitHub

## Banco de dados

- Cliente Supabase configurado em `@/lib/supabaseClient`
- Colunas usam camelCase entre aspas duplas (ex: "email_parceiro", "data_indicacao")
- Saldo do parceiro calculado pela view `extratolancamentos`

## Tabelas principais

- `parceiros` — uid, email, email_vendedor, token_indicacao
- `indicacoes` — cnpj (único), uid_parceiro, email_parceiro, origem ('parceiro' | 'link')
- `lancamentos` — tipo ('Crédito' | 'Débito'), qtd, email_parceiro
- `mensalidadesrecebidas` — nu_cgc, vr_areceber, dt_recebimento, parceiro_id
- `extratolancamentos` — view com saldo acumulado por parceiro
