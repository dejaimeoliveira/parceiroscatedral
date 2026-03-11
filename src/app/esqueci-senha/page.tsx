'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from './actions'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setErrorMsg('')
    
    const result = await resetPassword(formData)
    
    if (result?.error) {
      setErrorMsg(result.error)
      setIsPending(false)
    } else if (result?.success) {
      setSuccess(true)
      setIsPending(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Recuperar Senha</h1>
        
        {success ? (
          <div className="text-center mt-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <p className="text-slate-600 mb-6">
              Se existe uma conta associada a <strong>{email}</strong>, um link de recuperação foi enviado para esta caixa de entrada.
            </p>
            <Link 
              href="/login"
              className="bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-6 rounded-lg shadow transition-colors inline-block w-full"
            >
              Retornar ao Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-center text-slate-500 mb-6 text-sm">
              Digite seu email abaixo e enviaremos instruções para criar uma nova senha.
            </p>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">E-mail</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Seu email cadastrado"
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
                {isPending ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </button>

              <div className="text-center mt-6">
                <Link href="/login" className="text-sm text-slate-500 hover:text-amber-700 hover:underline">
                  Lembrou a senha? Volte para o Login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
