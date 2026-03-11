'use client'

import { useState } from 'react'
import { Search, Edit, X, Save } from 'lucide-react'
import { toast } from 'sonner'
import { ParceiroRow, updateParceiro } from '../actions'

type FuncaoRow = {
  id: number;
  funcaoNome: string;
}

function formatCPF(cpf: string): string {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  return cpf;
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

export function ParceirosClient({ 
  initialData, 
  funcoes 
}: { 
  initialData: ParceiroRow[]
  funcoes: FuncaoRow[]
}) {
  const [data, setData] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditing, setIsEditing] = useState<ParceiroRow | null>(null)
  const [formData, setFormData] = useState<Partial<ParceiroRow>>({})
  const [isSaving, setIsSaving] = useState(false)

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    
    return (
      (item.nome && item.nome.toLowerCase().includes(searchLower)) ||
      (item.email && item.email.toLowerCase().includes(searchLower)) ||
      (item.cpf && item.cpf.includes(searchLower)) ||
      (item.telefone && item.telefone.includes(searchLower))
    )
  })

  const handleEditClick = (parceiro: ParceiroRow) => {
    setIsEditing(parceiro)
    setFormData({
      telefone: formatTelefone(parceiro.telefone || ''),
      cpf: formatCPF(parceiro.cpf || ''),
      idFuncao: parceiro.idFuncao || 1,
      ativo: parceiro.ativo ?? false, // fallbacks to false if undefined
      emailVendedor: parceiro.emailVendedor || '',
      pixConta: parceiro.pixConta || ''
    })
  }

  const handleMaskedChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cpf' | 'telefone') => {
    const { value } = e.target;
    let formatted = value;
    
    if (type === 'cpf') {
      formatted = formatCPF(value);
    } else {
      formatted = formatTelefone(value);
    }
    
    setFormData({ ...formData, [type]: formatted });
  }

  const handleSave = async () => {
    if (!isEditing) return

    setIsSaving(true)
    try {
      // The Server Action handles stripping out non-numeric characters for phone/cpf
      await updateParceiro(isEditing.id, {
        telefone: formData.telefone,
        cpf: formData.cpf,
        idFuncao: Number(formData.idFuncao),
        ativo: formData.ativo,
        emailVendedor: formData.emailVendedor,
        pixConta: formData.pixConta
      })

      // Update local state to reflect changes without a full refetch
      setData(data.map(p => 
        p.id === isEditing.id 
          ? { 
              ...p, 
              telefone: formData.telefone?.replace(/\D/g, '') || '',
              cpf: formData.cpf?.replace(/\D/g, '') || '',
              idFuncao: Number(formData.idFuncao),
              ativo: formData.ativo ?? false,
              emailVendedor: formData.emailVendedor || '',
              pixConta: formData.pixConta || ''
            } 
          : p
      ))

      toast.success('Parceiro atualizado com sucesso!')
      setIsEditing(null)
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro ao salvar')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
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
              placeholder="Buscar por nome, email, CPF..."
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
                <th className="px-6 py-4 rounded-tl-lg">Nome / E-mail</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">CPF</th>
                <th className="px-6 py-4">Função</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.length > 0 ? (
                filteredData.map((parceiro) => {
                  const funcaoName = funcoes.find(f => f.id === parceiro.idFuncao)?.funcaoNome || '-'
                  return (
                    <tr key={parceiro.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {parceiro.nome || '-'}
                        <div className="text-xs text-slate-400 font-normal mt-0.5">{parceiro.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatTelefone(parceiro.telefone) || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatCPF(parceiro.cpf) || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {funcaoName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          parceiro.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {parceiro.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleEditClick(parceiro)}
                          className="text-amber-500 hover:text-amber-700 p-2 hover:bg-amber-50 rounded-lg transition-colors inline-block"
                        >
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhum parceiro encontrado nesta busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">Editar Parceiro: {isEditing.nome}</h2>
              <button 
                onClick={() => setIsEditing(null)}
                className="text-slate-400 hover:text-slate-700 p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-700">Email Login</label>
                <input
                  type="text"
                  disabled
                  value={isEditing.email}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500"
                />
              </div>

              <div className="space-y-2">
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">CPF</label>
                <input
                  type="text"
                  value={formData.cpf || ''}
                  onChange={(e) => handleMaskedChange(e, 'cpf')}
                  maxLength={14}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">E-mail Vendedor (Referência)</label>
                <input
                  type="email"
                  value={formData.emailVendedor || ''}
                  onChange={(e) => setFormData({ ...formData, emailVendedor: e.target.value })}
                  placeholder="vendedor@email.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Chave PIX (Conta Repasse)</label>
                <input
                  type="text"
                  value={formData.pixConta || ''}
                  onChange={(e) => setFormData({ ...formData, pixConta: e.target.value })}
                  placeholder="chave pix do parceiro"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2 col-span-2 md:col-span-1 border-t border-slate-100 pt-4 mt-2">
                <label className="text-sm font-medium text-slate-700">Função</label>
                <select
                  value={formData.idFuncao}
                  onChange={(e) => setFormData({ ...formData, idFuncao: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                >
                  {funcoes.map(f => (
                    <option key={f.id} value={f.id}>{f.funcaoNome}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 col-span-2 md:col-span-1 border-t border-slate-100 pt-4 mt-2">
                <label className="text-sm font-medium text-slate-700">Status de Acesso</label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.ativo || false}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                  <span className={`text-sm font-semibold ${formData.ativo ? 'text-green-600' : 'text-slate-500'}`}>
                    {formData.ativo ? 'Permitir acesso' : 'Acesso bloqueado'}
                  </span>
                </div>
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
