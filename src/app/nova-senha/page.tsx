'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updatePassword } from './actions'
import { useRouter } from 'next/navigation'

export default function NovaSenhaPage() {
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setErrorMsg('')
    
    const result = await updatePassword(formData)
    
    if (result?.error) {
      setErrorMsg(result.error)
      setIsPending(false)
    } else if (result?.success) {
      setSuccess(true)
      setIsPending(false)
      
      // Redirect to login after a few seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Criar Nova Senha</h1>
        
        {success ? (
          <div className="text-center mt-6 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <p className="text-slate-600 mb-2 font-medium">
              Senha atualizada com sucesso!
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Você será redirecionado para o login em instantes...
            </p>
            <Link 
              href="/login"
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg shadow transition-colors inline-block w-full"
            >
              Ir para o Login Agora
            </Link>
          </div>
        ) : (
          <>
            <p className="text-center text-slate-500 mb-6 text-sm">
              Digite e confirme sua nova senha de acesso.
            </p>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nova Senha</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mt-2">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all mt-4 disabled:opacity-50"
              >
                {isPending ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
