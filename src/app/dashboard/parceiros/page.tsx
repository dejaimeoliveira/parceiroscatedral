import { checkRole } from '@/utils/supabase/check-role'
import { redirect } from 'next/navigation'
import { getParceiros } from './actions'
import { ParceirosClient } from './components/parceiros-client'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ParceirosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = await checkRole(1)

  if (!isAdmin) {
    // Redirect or show not authorized
    redirect('/dashboard')
  }

  const parceiros = await getParceiros()

  // Fetch roles (funcoes) for the dropdown
  const { data: funcoes } = await supabase
    .from('funcoes')
    .select('*')
    .order('id', { ascending: true })

  return (
    <div className="flex-1 w-full flex flex-col items-start gap-6 pt-6 bg-slate-50 min-h-screen">
      <div className="w-full px-8 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-800">Gerenciar Parceiros</h1>
        <p className="text-slate-500 font-medium">Acesso restrito para administradores. Aqui você pode revisar as contas e ativar/desativar acessos.</p>
      </div>

      <div className="w-full px-8 pb-12">
        <ParceirosClient initialData={parceiros} funcoes={funcoes || []} />
      </div>
    </div>
  )
}
