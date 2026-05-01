import { createClient } from '@/utils/supabase/server'
import { IndicacaoForm } from './form'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Indique sua Empresa - Parceiros Catedral',
  description: 'Formulário de indicação para novos clientes.',
}

export default async function IndicacaoPublicaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const tokenRaw = resolvedParams.token

  if (!tokenRaw || typeof tokenRaw !== 'string') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Link Inválido</h1>
          <p className="text-slate-600 mb-6">O link de indicação fornecido não possui um token válido.</p>
          <Link href="/" className="inline-block px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
            Ir para o Início
          </Link>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  const formattedToken = tokenRaw.length === 32 
    ? tokenRaw.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5') 
    : tokenRaw

  const { data: parceiro } = await supabase
    .from('parceiros')
    .select('nome')
    .eq('uid', formattedToken)
    .single()

  if (!parceiro) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Parceiro Não Encontrado</h1>
          <p className="text-slate-600 mb-6">O link que você acessou expirou ou é inválido. Por favor, solicite um novo link ao seu contato.</p>
          <Link href="/" className="inline-block px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
            Ir para o Início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Header/Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Catedral Parceiros
        </h1>
        <p className="mt-2 text-lg text-slate-600 max-w-xl mx-auto">
          Você foi indicado por <span className="font-semibold text-amber-700">{parceiro.nome}</span>.
          Preencha o formulário abaixo para registrar o interesse da sua empresa.
        </p>
      </div>

      {/* Formulário Card */}
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-amber-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Formulário de Indicação</h2>
        </div>
        <div className="p-6 sm:p-8">
          <IndicacaoForm token={tokenRaw} parceiroNome={parceiro.nome || 'Nosso Parceiro'} />
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Parceiros Catedral. Todos os direitos reservados.</p>
      </div>
    </div>
  )
}
