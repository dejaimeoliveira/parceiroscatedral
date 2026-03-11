'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { LancamentoComSaldo } from '../actions'
import { SearchableSelect } from '@/components/ui/searchable-select'

type ParceiroOption = {
  nome: string;
  email: string;
}

export function ExtratoClient({ 
  data,
  isAdmin,
  parceirosOptions = [],
  selectedEmail
}: { 
  data: LancamentoComSaldo[];
  isAdmin?: boolean;
  parceirosOptions?: ParceiroOption[];
  selectedEmail?: string;
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  const handleParceiroChange = (email: string) => {
    if (!email) {
      router.push(pathname)
    } else {
      router.push(`${pathname}?email=${encodeURIComponent(email)}`)
    }
  }

  const selectOptions = parceirosOptions.map(p => ({
    value: p.email,
    label: `${p.nome} (${p.email})`
  }))

  return (
    <div className="flex flex-col gap-6">
      {isAdmin && (
        <div className="w-full max-w-sm">
          <SearchableSelect
            label="Selecionar Parceiro (Visão Admin)"
            placeholder="Selecione um parceiro..."
            options={selectOptions}
            value={selectedEmail || ''}
            onChange={handleParceiroChange}
          />
        </div>
      )}

      <div className="w-full bg-[#f0f4f8] rounded-md overflow-hidden">
        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#334155]">
            <thead className="bg-[#f0f4f8] text-[#1e293b] font-semibold border-b border-slate-300">
              <tr>
                <th className="px-6 py-4 w-[40%]">Data</th>
                <th className="px-6 py-4 w-[20%]">Tipo</th>
                <th className="px-6 py-4 w-[20%]">Qtd</th>
                <th className="px-6 py-4 w-[20%] font-bold">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.length > 0 ? (
                data.map((lanc, index) => {
                  const isCredito = lanc.tipo?.toLowerCase().startsWith('c') || lanc.tipo?.toLowerCase() === 'crédito';
                  
                  return (
                    <tr key={lanc.id || index} className="transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lanc.dataLancamento 
                          ? (new Date(lanc.dataLancamento)).toLocaleDateString('pt-BR')
                          : 'null'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isCredito ? 'C' : 'D'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lanc.qtd}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold">
                        {lanc.saldoAcumulado}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
