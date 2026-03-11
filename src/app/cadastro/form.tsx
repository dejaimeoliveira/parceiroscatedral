'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from './actions'

type Funcao = {
  id: number
  funcaoNome: string
}

export function CadastroForm({ funcoes, defaultFuncaoId }: { funcoes: Funcao[], defaultFuncaoId: string }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telefone, setTelefone] = useState('')
  const [idFuncao, setIdFuncao] = useState(defaultFuncaoId)
  
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)

  const applyPhoneMask = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15)
  }

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setErrorMsg('')
    
    // Explicitly append idFuncao if disabled or not picked up natively
    formData.set('idFuncao', idFuncao)

    const result = await signUp(formData)
    
    if (result?.error) {
      setErrorMsg(result.error)
      setIsPending(false)
    } else if (result?.success) {
      setSuccess(true)
      setIsPending(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Cadastro Realizado!</h2>
        <p className="text-slate-500 mb-6">
          Um link de confirmação foi enviado para <strong>{email}</strong>. Por favor, verifique sua caixa de entrada e spam para validar seu cadastro.
        </p>
        <Link 
          href="/login"
          className="bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-6 rounded-lg shadow transition-colors inline-block"
        >
          Voltar para o Login
        </Link>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Nome completo</label>
        <input
          name="nome"
          type="text"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border border-slate-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Ex: João Silva"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Telefone (Whatsapp)</label>
        <input
          name="telefone"
          type="text"
          value={telefone}
          onChange={(e) => setTelefone(applyPhoneMask(e.target.value))}
          className="w-full border border-slate-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-300"
          placeholder="(00) 00000-0000"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">E-mail</label>
        <input
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="seu@email.com"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Senha</label>
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

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Qual sua área de atuação?</label>
        <select
          value={idFuncao}
          onChange={(e) => setIdFuncao(e.target.value)}
          className="w-full border border-slate-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
        >
          {funcoes.map(f => (
            <option key={f.id} value={f.id}>{f.funcaoNome}</option>
          ))}
        </select>
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
        {isPending ? 'Concluindo...' : 'Finalizar Cadastro'}
      </button>

      <div className="text-center mt-6">
        <Link href="/login" className="text-sm text-slate-500 hover:text-amber-700 hover:underline">
          Já tem uma conta? Faça login
        </Link>
      </div>
    </form>
  )
}
