import { createClient } from '@/utils/supabase/server'
import { CadastroForm } from './form'

export default async function CadastroPage() {
  const supabase = await createClient()

  // Fetch roles id > 1 limit (excluding Admin)
  const { data: funcoes } = await supabase
    .from('funcoes')
    .select('id, funcaoNome')
    .gt('id', 1)
    .order('funcaoNome', { ascending: true })

  // Find the 'Contador' role to be suggested as default if it exists
  const contadorRole = funcoes?.find(f => f.funcaoNome.toLowerCase() === 'contador')
  const defaultFuncaoId = contadorRole ? contadorRole.id : funcoes?.[0]?.id || ''

  return (
    <div className="flex-1 flex flex-col w-full h-screen items-center justify-center bg-amber-50/50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Cadastre-se</h1>
        <p className="text-center text-slate-500 mb-6 text-sm">
          Torne-se um Parceiro da Catedral e gerencie suas indicações.
        </p>

        <CadastroForm funcoes={funcoes || []} defaultFuncaoId={defaultFuncaoId.toString()} />
      </div>
    </div>
  )
}
