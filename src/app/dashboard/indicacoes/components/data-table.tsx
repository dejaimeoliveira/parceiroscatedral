'use client'

import { useState, useEffect } from 'react'
import { Search, Edit, X, Save } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter, usePathname } from 'next/navigation'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { toast } from 'sonner'
import { updateIndicacao } from '../actions'

// Typing according to the database structure we used in the INSERT
export type Indicacao = {
  id: number;
  empresa: string;
  nome_contato: string;
  cnpj: string;
  telefone: string;
  email: string;
  observacao?: string;
  data_indicacao: string;
  data_limite?: string; // or data_limite depending on the exact schema, using strings for serialization
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
  data: initialData,
  isAdmin,
  parceirosOptions = [],
  selectedEmail
}: {
  data: Indicacao[];
  isAdmin?: boolean;
  parceirosOptions?: ParceiroOption[];
  selectedEmail?: string;
}) {
  const [data, setData] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditing, setIsEditing] = useState<Indicacao | null>(null)
  const [formData, setFormData] = useState<Partial<Indicacao>>({})
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setData(initialData)
  }, [initialData])

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
      item.nome_contato?.toLowerCase().includes(searchLower) ||
      item.cnpj?.includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower)
    )
  })

  const selectOptions = parceirosOptions.map(p => ({
    value: p.email,
    label: `${p.nome} (${p.email})`
  }))

  const handleEditClick = (indicacao: Indicacao) => {
    setIsEditing(indicacao)
    setFormData({
      empresa: indicacao.empresa || '',
      nome_contato: indicacao.nome_contato || '',
      cnpj: formatCNPJ(indicacao.cnpj || ''),
      telefone: formatTelefone(indicacao.telefone || ''),
      email: indicacao.email || '',
      observacao: indicacao.observacao || ''
    })
  }

  const handleMaskedChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cnpj' | 'telefone') => {
    const { value } = e.target;
    let formatted = value;

    if (type === 'cnpj') {
      formatted = formatCNPJ(value);
    } else {
      formatted = formatTelefone(value);
    }

    setFormData({ ...formData, [type]: formatted });
  }

  const handleSave = async () => {
    if (!isEditing) return

    setIsSaving(true)
    try {
      await updateIndicacao(isEditing.id, {
        empresa: formData.empresa || '',
        nome_contato: formData.nome_contato || '',
        cnpj: formData.cnpj || '',
        telefone: formData.telefone || '',
        email: formData.email || '',
        observacao: formData.observacao || ''
      })

      // Update local state to reflect changes without a full refetch
      setData(data.map(i =>
        i.id === isEditing.id
          ? {
            ...i,
            empresa: formData.empresa || '',
            nome_contato: formData.nome_contato || '',
            cnpj: formData.cnpj?.replace(/\D/g, '') || '',
            telefone: formData.telefone?.replace(/\D/g, '') || '',
            email: formData.email || '',
            observacao: formData.observacao || ''
          }
          : i
      ))

      toast.success('Indicação atualizada com sucesso!')
      setIsEditing(null)
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro ao salvar')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
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
                  {isAdmin && <th className="px-6 py-4 text-right">Ações</th>}
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
                      <td className="px-6 py-4">{ind.nome_contato}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatCNPJ(ind.cnpj)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatTelefone(ind.telefone)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {ind.data_indicacao ? format(parseISO(ind.data_indicacao), "dd 'de' MMMM, yyyy", { locale: ptBR }) : '-'}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleEditClick(ind)}
                            className="text-amber-500 hover:text-amber-700 p-2 hover:bg-amber-50 rounded-lg transition-colors inline-block"
                          >
                            <Edit size={18} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-500">
                      {searchTerm ? 'Nenhuma indicação encontrada para esta busca.' : 'Você ainda não indicou nenhum cliente.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">Editar Indicação: {isEditing.empresa}</h2>
              <button
                onClick={() => setIsEditing(null)}
                className="text-slate-400 hover:text-slate-700 p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium text-slate-700">Empresa</label>
                <input
                  type="text"
                  value={formData.empresa || ''}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  maxLength={60}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium text-slate-700">Contato</label>
                <input
                  type="text"
                  value={formData.nome_contato || ''}
                  onChange={(e) => setFormData({ ...formData, nome_contato: e.target.value })}
                  maxLength={60}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium text-slate-700">CNPJ</label>
                <input
                  type="text"
                  value={formData.cnpj || ''}
                  onChange={(e) => handleMaskedChange(e, 'cnpj')}
                  maxLength={18}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-sm font-medium text-slate-700">Telefone</label>
                <input
                  type="text"
                  value={formData.telefone || ''}
                  onChange={(e) => handleMaskedChange(e, 'telefone')}
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  maxLength={60}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-700">Observação</label>
                <textarea
                  value={formData.observacao || ''}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                onClick={() => setIsEditing(null)}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 border border-transparent rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
