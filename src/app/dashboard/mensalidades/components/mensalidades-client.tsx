'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronLeft } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Mensalidade } from '../types'
import { SearchableSelect } from '@/components/ui/searchable-select'

const MONTHS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Fev' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Abr' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Ago' },
  { value: '09', label: 'Set' },
  { value: '10', label: 'Out' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dez' },
]

type ParceiroOption = {
  nome: string;
  email: string;
}

export function MensalidadesClient({ 
  initialData, 
  email,
  isAdmin,
  parceirosOptions = [],
  selectedEmail
}: { 
  initialData: Mensalidade[]; 
  email: string | undefined;
  isAdmin?: boolean;
  parceirosOptions?: ParceiroOption[];
  selectedEmail?: string;
}) {
  const router = useRouter()
  const pathname = usePathname()

  const handleParceiroChange = (newEmail: string) => {
    if (!newEmail) {
      router.push(pathname)
    } else {
      router.push(`${pathname}?email=${encodeURIComponent(newEmail)}`)
    }
  }
  const currentDate = new Date()
  const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
  const defaultMonth = String(prevMonthDate.getMonth() + 1).padStart(2, '0')
  const currentYearStr = String(currentDate.getFullYear())
  const prevYearStr = String(currentDate.getFullYear() - 1)

  // Filters State
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth)
  // Utilizamos o ano referente ao mês anterior por conta da virada de ano (ex: em Janeiro, o mês anterior é Dezembro de Ano - 1)
  const [selectedYear, setSelectedYear] = useState(String(prevMonthDate.getFullYear()))
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pg' | 'Np'>('Todos')

  // Apenas o ano atual e o anterior disponíveis no dropdown
  const availableYears = [currentYearStr, prevYearStr]

  // Filter Data
  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      let itemMonth = '', itemYear = ''
      if (item.dt_recebimento) {
        const match = item.dt_recebimento.match(/^(\d{4})-(\d{2})-(\d{2})/)
        if (match) {
           itemYear = match[1]
           itemMonth = match[2]
        }
      }

      // 1. Month/Year filter check
      const matchMonth = itemMonth === selectedMonth
      const matchYear = itemYear === selectedYear

      // 2. Status filter check
      let matchStatus = true
      const vr = item.vr_areceber || 0
      if (statusFilter === 'Pg') {
        matchStatus = vr > 0
      } else if (statusFilter === 'Np') {
        matchStatus = vr === 0
      }

      return matchMonth && matchYear && matchStatus
    }).sort((a, b) => {
      let dayA = 0, dayB = 0
      if (a.dt_recebimento) {
        const matchA = a.dt_recebimento.match(/^(\d{4})-(\d{2})-(\d{2})/)
        if (matchA) dayA = parseInt(matchA[3], 10)
      }
      if (b.dt_recebimento) {
        const matchB = b.dt_recebimento.match(/^(\d{4})-(\d{2})-(\d{2})/)
        if (matchB) dayB = parseInt(matchB[3], 10)
      }
      return dayA - dayB
    })
  }, [initialData, selectedMonth, selectedYear, statusFilter])

  // Calculate Running Balance (Saldo Cumulativo) based on the filtered list
  let runningBalance = 0
  const dataWithBalance = filteredData.map((item) => {
    const val = item.vr_areceber || 0
    runningBalance += val
    return { ...item, calculatedBalance: runningBalance }
  })

  const selectOptions = parceirosOptions.map(p => ({
    value: p.email,
    label: `${p.nome} (${p.email})`
  }))

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-50 min-h-screen">
      {/* App-like Header matching the screenshot color block */}
      <div className="bg-[#cc8822] text-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button className="p-1 hover:bg-black/10 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-medium truncate">{email}</h1>
      </div>

      {isAdmin && (
        <div className="px-4 py-4 bg-white border-b border-slate-200">
          <SearchableSelect
            label="Selecionar Parceiro (Visão Admin)"
            placeholder="Selecione um parceiro..."
            options={selectOptions}
            value={selectedEmail || ''}
            onChange={handleParceiroChange}
          />
        </div>
      )}

      {/* Control Panel (Filters) */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <select 
              className="bg-transparent border-b border-slate-400 text-slate-700 font-medium py-1 pr-6 focus:outline-none focus:border-amber-600 cursor-pointer appearance-none relative"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.2rem center', backgroundSize: '0.65em auto' }}
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            <select 
              className="bg-transparent border-b border-slate-400 text-slate-700 font-medium py-1 pr-6 focus:outline-none focus:border-amber-600 cursor-pointer appearance-none relative"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.2rem center', backgroundSize: '0.65em auto' }}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="radio" 
                name="status" 
                className="w-4 h-4 text-[#cc8822] focus:ring-[#cc8822]" 
                checked={statusFilter === 'Todos'} 
                onChange={() => setStatusFilter('Todos')} 
              />
              Todos
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="radio" 
                name="status" 
                className="w-4 h-4 text-[#cc8822] focus:ring-[#cc8822]" 
                checked={statusFilter === 'Pg'} 
                onChange={() => setStatusFilter('Pg')} 
              />
              Pg
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="radio" 
                name="status" 
                className="w-4 h-4 text-[#cc8822] focus:ring-[#cc8822]" 
                checked={statusFilter === 'Np'} 
                onChange={() => setStatusFilter('Np')} 
              />
              Np
            </label>
          </div>
        </div>

        <div className="flex justify-center">
          <button className="bg-[#cc8822] hover:bg-[#b3771e] text-white font-bold text-lg py-3 px-12 rounded shadow transition-colors w-full sm:w-auto">
            Pesquisar
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-50 w-full overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="border-b-2 border-slate-300">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-800 w-16">Di</th>
              <th className="px-4 py-3 font-bold text-slate-800">Cliente</th>
              <th className="px-4 py-3 font-bold text-slate-800 text-right">Valor</th>
              <th className="px-4 py-3 font-bold text-slate-800 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {dataWithBalance.length > 0 ? (
              dataWithBalance.map((row, idx) => {
                // Determine Di (Date formatted for the table as DD/MM)
                let dayStr = '--/--'
                if (row.dt_recebimento) {
                  const match = row.dt_recebimento.match(/^(\d{4})-(\d{2})-(\d{2})/)
                  if (match) dayStr = `${match[3]}/${match[2]}`
                } else if (row.data_pagamento) {
                  const d = new Date(row.data_pagamento)
                  dayStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
                } else if (row.created_at) {
                  const d = new Date(row.created_at)
                  dayStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
                }

                // Values
                const val = row.vr_areceber || 0
                const formattedVal = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(val)
                const formattedBalance = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(row.calculatedBalance)

                return (
                  <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-4 py-3 text-slate-700">{dayStr}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[200px]">{row.no_cliente}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formattedVal}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {val === 0 ? '' : formattedBalance}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                  Nenhuma mensalidade encontrada para o período selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
