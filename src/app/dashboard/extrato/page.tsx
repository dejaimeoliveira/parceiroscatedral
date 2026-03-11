import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getExtratoParceiro, getParceirosOptions } from './actions'
import { ExtratoClient } from './components/extrato-client'
import { checkRole } from '@/utils/supabase/check-role'

export const dynamic = 'force-dynamic'

export default async function ExtratoPage(props: { searchParams?: Promise<{ email?: string }> }) {
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

  // Fetch the partner's extrato
  const lancamentos = await getExtratoParceiro(selectedEmail)

  let parceirosOptions: any[] = []
  if (isAdmin) {
    parceirosOptions = await getParceirosOptions()
  }

  return (
    <div className="flex-1 w-full flex flex-col items-start gap-6 pt-6 bg-slate-50 min-h-screen">
      <div className="w-full px-8 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-800">Extrato Parceiro</h1>
        <p className="text-slate-500 font-medium">Histórico de movimentações e saldo acumulado da sua conta.</p>
      </div>

      <div className="w-full px-8 pb-12">
        <ExtratoClient 
          data={lancamentos} 
          isAdmin={isAdmin}
          parceirosOptions={parceirosOptions}
          selectedEmail={selectedEmail}
        />
      </div>
    </div>
  )
}
