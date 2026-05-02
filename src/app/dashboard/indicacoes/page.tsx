import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { IndicationsTable } from './components/data-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { checkRole } from '@/utils/supabase/check-role'
import { getParceirosOptions } from '../extrato/actions'

export default async function IndicacoesPage(props: { searchParams?: Promise<{ email?: string }> }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  const isAdmin = await checkRole(1)
  const searchParams = props.searchParams ? await props.searchParams : {}
  const selectedEmail = (isAdmin && searchParams.email) ? searchParams.email : user.email

  // Get Parceiro ID to filter indications exclusively for this user
  const { data: parceiro } = await supabase
    .from('parceiros')
    .select('uid')
    .eq('email', selectedEmail)
    .single()

  if (!parceiro) {
    return <div className="p-8 text-center text-red-500">Acesso Negado: Perfil de parceiro não encontrado para {selectedEmail}.</div>
  }

  // Fetch indications assigned to this partner
  const { data: indicacoes } = await supabase
    .from('indicacoes')
    .select('*')
    .eq('uid_parceiro', parceiro.uid)
    .order('empresa', { ascending: true })

  let parceirosOptions: any[] = []
  if (isAdmin) {
    parceirosOptions = await getParceirosOptions()
  }

  return (
    <div className="flex-1 w-full flex flex-col items-start gap-6 pt-6 bg-slate-50 min-h-screen">
      <div className="w-full px-8 flex flex-row items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Listar Indicações</h1>
        <Link
          href="/dashboard/indicacoes/nova"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Indicar Cliente</span>
        </Link>
      </div>

      <div className="w-full px-8 pb-12">
        <IndicationsTable
          data={indicacoes || []}
          isAdmin={isAdmin}
          parceirosOptions={parceirosOptions}
          selectedEmail={selectedEmail}
        />
      </div>
    </div>
  )
}
