'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createIndicacao } from './actions'
import { createClient } from '@/utils/supabase/client'

// Masks
const applyCnpjMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18)
}

const applyPhoneMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 15)
}

export default function NovaIndicacaoPage() {
  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [observacao, setObservacao] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || '')
    })
  }, [])

  const validateCnpj = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, '')
    if (numbers.length !== 14) return false
    if (/^(\d)\1+$/.test(numbers)) return false

    const calc = (nums: string, len: number) => {
      let sum = 0
      let pos = len - 7
      for (let i = len; i >= 1; i--) {
        sum += parseInt(nums[len - i]) * pos--
        if (pos < 2) pos = 9
      }
      const result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
      return result === parseInt(nums[len])
    }

    return calc(numbers, 12) && calc(numbers, 13)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const BYPASS_EMAIL = 'dejaimeoliveira@uol.com.br'
    if (userEmail !== BYPASS_EMAIL && !validateCnpj(cnpj)) {
      setErrorMsg('CNPJ inválido. Verifique o número informado.')
      return
    }

    setIsPending(true)
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)
    const result = await createIndicacao(formData)

    if (result?.error) {
      setErrorMsg(result.error)
      setIsPending(false)
      return
    }

    if (result?.success) {
      toast.success('Cliente indicado com sucesso!')
      setTimeout(() => {
        router.push('/dashboard/indicacoes')
      }, 1500)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen bg-slate-50 pb-20">

      {/* Top Banner */}
      <div className="bg-amber-500 h-16 flex items-center justify-center relative shadow-sm">
        <Link
          href="/dashboard"
          className="absolute left-4 text-amber-900 hover:text-amber-950 transition-colors"
        >
          <ChevronLeft size={28} />
        </Link>
        <h1 className="text-white text-xl font-medium tracking-wide">
          Indicar Cliente
        </h1>
      </div>

      {/* Form Container */}
      <div className="p-6 mt-4">
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">

          {/* Nome Contato */}
          <div className="flex flex-col relative pb-6 border-b border-amber-500">
            <label className="text-sm text-gray-600 mb-1 pl-2">Nome da pessoa indicada</label>
            <input
              type="text"
              name="nomeContato"
              value={nome}
              onChange={(e) => setNome(e.target.value.substring(0, 60))}
              required
              className="bg-transparent border-none outline-none text-gray-800 text-lg px-2 w-full focus:ring-0"
              maxLength={60}
            />
            <span className="absolute bottom-1 right-2 text-xs text-gray-400">
              {nome.length}/60
            </span>
          </div>

          {/* Nome Empresa */}
          <div className="flex flex-col relative pb-6 border-b border-gray-200 focus-within:border-amber-500 transition-colors">
            <label className="text-sm text-gray-600 mb-1 pl-2">Nome da empresa indicada</label>
            <input
              type="text"
              name="empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value.substring(0, 60))}
              required
              className="bg-transparent border-none outline-none text-gray-800 text-lg px-2 w-full focus:ring-0"
              maxLength={60}
            />
            <span className="absolute bottom-1 right-2 text-xs text-gray-400">
              {empresa.length}/60
            </span>
          </div>

          {/* CNPJ */}
          <div className="flex flex-col relative pb-6 border-b border-gray-200 focus-within:border-amber-500 transition-colors">
            <label className="text-sm text-gray-600 mb-1 pl-2">CNPJ</label>
            <input
              type="text"
              name="cnpj"
              value={cnpj}
              onChange={(e) => setCnpj(applyCnpjMask(e.target.value))}
              required
              placeholder="00.000.000/0000-00"
              className="bg-transparent border-none outline-none text-gray-800 text-lg px-2 w-full focus:ring-0 placeholder:text-gray-300"
            />
            <span className="absolute bottom-1 right-2 text-xs text-gray-400">
              {cnpj.length}/18
            </span>
          </div>

          {/* Telefone */}
          <div className="flex flex-col relative pb-6 border-b border-gray-200 focus-within:border-amber-500 transition-colors">
            <label className="text-sm text-gray-600 mb-1 pl-2">Telefone</label>
            <input
              type="text"
              name="telefone"
              value={telefone}
              onChange={(e) => setTelefone(applyPhoneMask(e.target.value))}
              required
              placeholder="(00) 00000-0000"
              className="bg-transparent border-none outline-none text-gray-800 text-lg px-2 w-full focus:ring-0 placeholder:text-gray-300"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col relative pb-6 border-b border-gray-200 focus-within:border-amber-500 transition-colors">
            <label className="text-sm text-gray-600 mb-1 pl-2">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.substring(0, 60))}
              required
              className="bg-transparent border-none outline-none text-gray-800 text-lg px-2 w-full focus:ring-0"
              maxLength={60}
            />
            <span className="absolute bottom-1 right-2 text-xs text-gray-400">
              {email.length}/60
            </span>
          </div>

          {/* Observacao */}
          <div className="flex flex-col relative pb-6 border-b border-gray-200 focus-within:border-amber-500 transition-colors">
            <label className="text-sm text-gray-600 mb-1 pl-2">Observação</label>
            <textarea
              name="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value.substring(0, 500))}
              placeholder="Alguma informação adicional sobre a empresa ou o contato?"
              className="bg-transparent border-none outline-none text-gray-800 text-base px-2 w-full focus:ring-0 resize-none"
              rows={4}
              maxLength={500}
            />
            <span className="absolute bottom-1 right-2 text-xs text-gray-400">
              {observacao.length}/500
            </span>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-center pt-8">
            <button
              type="submit"
              disabled={isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-12 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Gravando...' : 'Gravar'}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
