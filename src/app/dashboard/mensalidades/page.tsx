import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MensalidadesClient } from './components/mensalidades-client'
import { Mensalidade } from './types'
import { checkRole } from '@/utils/supabase/check-role'
import { getParceirosOptions } from '../extrato/actions'

export default async function MensalidadesPage(props: { searchParams?: Promise<{ email?: string }> }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = await checkRole(1)
  const searchParams = props.searchParams ? await props.searchParams : {}
  const selectedEmail = (isAdmin && searchParams.email) ? searchParams.email : user.email

  // Get Parceiro ID to filter explicit records for this user based on selectedEmail
  const { data: parceiro } = await supabase
    .from('parceiros')
    .select('id, uid')
    .eq('email', selectedEmail)
    .single()

  if (!parceiro) {
    return <div className="p-8 text-center text-red-500">Acesso Negado: Perfil de parceiro não encontrado para {selectedEmail}.</div>
  }

  // Initial Fetch: we will load all data matching the partner
  const { data: mensalidades } = await supabase
    .from('mensalidadesrecebidas')
    .select('*')
    .or(`parceiro_id.eq.${parceiro.id},email_parceiro.eq.${selectedEmail}`)
    .order('no_cliente', { ascending: true })

  let parceirosOptions: any[] = []
  if (isAdmin) {
    parceirosOptions = await getParceirosOptions()
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6 pt-2 bg-slate-50 min-h-screen">
      {/* 
        We pass the raw data array to the Client Component 
        which will hold the state for the filtering controls (Month, Year, Status)
      */}
      <MensalidadesClient 
        initialData={(mensalidades as Mensalidade[]) || []} 
        email={selectedEmail} 
        isAdmin={isAdmin}
        parceirosOptions={parceirosOptions}
        selectedEmail={selectedEmail}
      />
    </div>
  )
}
