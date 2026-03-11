'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter, usePathname } from 'next/navigation'
import { SearchableSelect } from '@/components/ui/searchable-select'

// Typing according to the database structure we used in the INSERT
export type Indicacao = {
  id: number;
  empresa: string;
  nomeContato: string;
  cnpj: string;
  telefone: string;
  email: string;
  dataIndicacao: string;
  data_limite?: string; // or dataLimite depending on the exact schema, using strings for serialization
}

type ParceiroOption = {
  nome: string;
  email: string;
}

function formatCNPJ(cnpj: string): string {
  if (!cnpj) return '';
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length === 14) {
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }
  return cnpj;
}

function formatTelefone(telefone: string): string {
  if (!telefone) return '';
  const cleaned = telefone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  } else if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }
  return telefone;
}

export function IndicationsTable({ 
  data,
  isAdmin,
  parceirosOptions = [],
  selectedEmail
}: { 
  data: Indicacao[];
  isAdmin?: boolean;
  parceirosOptions?: ParceiroOption[];
  selectedEmail?: string;
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  const handleParceiroChange = (email: string) => {
    if (!email) {
      router.push(pathname)
    } else {
      router.push(`${pathname}?email=${encodeURIComponent(email)}`)
    }
  }

  // Client-side filtering implementation for case-insensitive search
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    
    return (
      item.empresa?.toLowerCase().includes(searchLower) ||
      item.nomeContato?.toLowerCase().includes(searchLower) ||
      item.cnpj?.includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower)
    )
  })

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

      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
            placeholder="Buscar por empresa, contato, CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500 ml-4 font-medium">
          {filteredData.length} {filteredData.length === 1 ? 'resultado' : 'resultados'}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 rounded-tl-lg">Empresa</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4">CNPJ</th>
              <th className="px-6 py-4">Telefone</th>
              <th className="px-6 py-4">Data Indicação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredData.length > 0 ? (
              filteredData.map((ind) => (
                <tr key={ind.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {ind.empresa}
                    {ind.email && <div className="text-xs text-slate-400 font-normal mt-0.5">{ind.email}</div>}
                  </td>
                  <td className="px-6 py-4">{ind.nomeContato}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCNPJ(ind.cnpj)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatTelefone(ind.telefone)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {ind.dataIndicacao ? format(parseISO(ind.dataIndicacao), "dd 'de' MMMM, yyyy", { locale: ptBR }) : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  {searchTerm ? 'Nenhuma indicação encontrada para esta busca.' : 'Você ainda não indicou nenhum cliente.'}
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
