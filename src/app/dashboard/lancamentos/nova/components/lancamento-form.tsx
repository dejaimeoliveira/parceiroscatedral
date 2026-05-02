'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createLancamento } from '../actions'
import { toast } from 'sonner'
import { Calendar } from 'lucide-react'
import { SearchableSelect } from '@/components/ui/searchable-select'

type ParceiroOption = {
  nome: string;
  email: string;
}

export function LancamentoForm({ parceirosOptions }: { parceirosOptions: ParceiroOption[] }) {
  const router = useRouter()

  // States
  // Get today's date in YYYY-MM-DD format for the default value
  const today = new Date().toISOString().split('T')[0]

  const [data_lancamento, setdata_lancamento] = useState(today)
  const [email_parceiro, setemail_parceiro] = useState('')
  const [cnpj_empresa, setcnpj_empresa] = useState('')
  const [tipo, setTipo] = useState('Crédito')
  const [qtd, setQtd] = useState('')
  const [descricao, setDescricao] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // CNPJ Mask `99.999.999/9999-99`
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 14) value = value.slice(0, 14)

    if (value.length > 12) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5')
    } else if (value.length > 8) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4}).*/, '$1.$2.$3/$4')
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3}).*/, '$1.$2.$3')
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{3}).*/, '$1.$2')
    }

    setcnpj_empresa(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!data_lancamento || !email_parceiro || !qtd) {
      toast.error('Preencha os campos obrigatórios: Data, Parceiro e Quantidade de CATs.')
      setIsLoading(false)
      return;
    }

    try {
      const result = await createLancamento({
        data_lancamento,
        email_parceiro,
        cnpj_empresa,
        tipo,
        qtd: Number(qtd),
        descricao: descricao.trim()
      })

      if (result.success) {
        toast.success('Lançamento registrado com sucesso!')
        router.push(`/dashboard/extrato?email=${encodeURIComponent(email_parceiro)}`)
      } else {
        toast.error(result.error || 'Erro ao registrar.')
      }

    } catch (err: any) {
      console.error(err)
      toast.error('Erro de servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectOptions = parceirosOptions.map(p => ({
    value: p.email,
    label: `${p.nome} (${p.email})`
  }))

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Visual Data area acting as modern date picker styling replacement */}
      <div className="flex flex-col gap-2">
        <label htmlFor="data_lancamento" className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" />
          Data do Lançamento
        </label>
        <input
          type="date"
          id="data_lancamento"
          required
          value={data_lancamento}
          onChange={(e) => setdata_lancamento(e.target.value)}
          className="w-full text-lg border-b-2 border-slate-300 py-2 focus:outline-none focus:border-[#a855f7] bg-transparent font-medium text-slate-800 transition-colors"
        />
      </div>

      {/* Select Parceiro */}
      <div className="flex flex-col gap-2 mt-4">
        <SearchableSelect
          label="Escolha email Parceiro"
          placeholder="Selecione da lista..."
          options={selectOptions}
          value={email_parceiro}
          onChange={(v) => setemail_parceiro(v)}
        />
      </div>

      {/* CNPJ Input */}
      <div className="flex flex-col gap-2 mt-2">
        <label htmlFor="cnpj_empresa" className="text-sm font-medium text-slate-600">
          CNPJ da Empresa Indicada (opcional)
        </label>
        <input
          type="text"
          id="cnpj_empresa"
          placeholder="00.000.000/0000-00"
          value={cnpj_empresa}
          onChange={handleCnpjChange}
          maxLength={18}
          className="w-full text-base border-b-2 border-slate-300 py-2 focus:outline-none focus:border-[#a855f7] bg-transparent text-slate-800 transition-colors placeholder:text-slate-300"
        />
      </div>

      {/* Type Radios */}
      <div className="flex items-center gap-6 mt-4 bg-slate-100/50 p-4 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="tipo"
            value="Crédito"
            checked={tipo === 'Crédito'}
            onChange={(e) => setTipo(e.target.value)}
            className="w-5 h-5 text-purple-600 focus:ring-purple-600 border-slate-300"
          />
          <span className="font-medium text-slate-800">Crédito</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="tipo"
            value="Débito"
            checked={tipo === 'Débito'}
            onChange={(e) => setTipo(e.target.value)}
            className="w-5 h-5 text-purple-600 focus:ring-purple-600 border-slate-300"
          />
          <span className="font-medium text-slate-500">Débito</span>
        </label>
      </div>

      {/* Quantidade */}
      <div className="flex flex-col gap-2 mt-2">
        <label htmlFor="qtd" className="text-sm font-medium text-slate-600">
          Quantidade de CATs
        </label>
        <input
          type="number"
          id="qtd"
          required
          min="1"
          placeholder="Ex: 50"
          value={qtd}
          onChange={(e) => setQtd(e.target.value)}
          className="w-full text-base border-b border-slate-300 py-2 focus:outline-none focus:border-[#a855f7] bg-transparent text-slate-800 transition-colors"
        />
      </div>

      {/* Descrição */}
      <div className="flex flex-col gap-2 mt-2">
        <label htmlFor="descricao" className="sr-only">
          Descrição
        </label>
        <textarea
          id="descricao"
          rows={3}
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full border border-slate-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-[#a855f7] bg-transparent text-slate-800 resize-none shadow-sm"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-6 flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-64 bg-[#d9952a] hover:bg-[#c48422] text-white font-bold text-lg py-3 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? 'Gravando...' : 'Gravar'}
        </button>
      </div>

    </form>
  )
}
