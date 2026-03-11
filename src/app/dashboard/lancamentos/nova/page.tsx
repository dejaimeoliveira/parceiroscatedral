import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { checkRole } from '@/utils/supabase/check-role'
import { getParceirosOptions } from '../../extrato/actions'
import { LancamentoForm } from './components/lancamento-form'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LancarCatsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Only Admins can launch CATs
  const isAdmin = await checkRole(1)
  if (!isAdmin) {
    return <div className="p-8 text-center text-red-500 font-medium">Acesso Negado: Perfil sem permissão para lançar CATs.</div>
  }

  // Fetch partners for the dropdown
  const parceirosOptions = await getParceirosOptions()

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-screen">
      {/* App-like Header matching the screenshot color block */}
      <div className="bg-[#cc8822] text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <Link 
          href="/dashboard"
          className="p-1 hover:bg-black/10 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-medium">Lançar CATs</h1>
      </div>

      <div className="w-full max-w-2xl mx-auto px-6 py-8">
        <LancamentoForm parceirosOptions={parceirosOptions} />
      </div>
    </div>
  )
}
