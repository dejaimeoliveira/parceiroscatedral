'use client'

import { useRef, useState } from 'react'
import { submitIndicacaoPublica } from './actions'
import { formatCNPJ, formatTelefone } from '@/utils/formatters'

export function IndicacaoForm({ token, parceiroNome }: { token: string, parceiroNome: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [cnpj, setCnpj] = useState('')
  const [telefone, setTelefone] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    // Anexa o token ao FormData
    formData.append('token', token)

    const result = await submitIndicacaoPublica(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg text-center">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold mb-2">Indicação Enviada!</h2>
        <p className="text-green-700">
          Seus dados foram enviados com sucesso para nosso parceiro <strong>{parceiroNome}</strong>.
          Entraremos em contato em breve.
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6 text-sm">
        Você está sendo indicado por <strong>{parceiroNome}</strong>.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="empresa" className="block text-sm font-medium text-gray-700">
            Nome da Empresa *
          </label>
          <input
            id="empresa"
            name="empresa"
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            placeholder="Razão Social ou Nome Fantasia"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
            CNPJ *
          </label>
          <input
            id="cnpj"
            name="cnpj"
            type="text"
            required
            value={cnpj}
            onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
            maxLength={18}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            placeholder="00.000.000/0000-00"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="nome_contato" className="block text-sm font-medium text-gray-700">
            Nome do Contato *
          </label>
          <input
            id="nome_contato"
            name="nome_contato"
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            placeholder="Nome da pessoa responsável"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
            Telefone / WhatsApp *
          </label>
          <input
            id="telefone"
            name="telefone"
            type="text"
            required
            value={telefone}
            onChange={(e) => setTelefone(formatTelefone(e.target.value))}
            maxLength={15}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-mail *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
          placeholder="contato@empresa.com.br"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="observacao" className="block text-sm font-medium text-gray-700">
          Observação (Opcional)
        </label>
        <textarea
          id="observacao"
          name="observacao"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
          placeholder="Alguma informação adicional que devemos saber?"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enviando Indicação...
          </span>
        ) : (
          'Enviar Indicação'
        )}
      </button>
    </form>
  )
}
