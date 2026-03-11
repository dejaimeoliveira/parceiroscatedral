import Link from 'next/link'
import { UserPlus, List, Wallet, DollarSign, Users, PlusCircle } from 'lucide-react'
import { checkRole } from '@/utils/supabase/check-role'

export default async function DashboardPage() {
  const isAdmin = await checkRole(1)

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
        <p className="text-gray-500">Bem-vindo ao portal de parceiros. O que você deseja fazer hoje?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card: Indicar Cliente */}
        <Link 
          href="/dashboard/indicacoes/nova"
          className="bg-white rounded-xl shadow-sm hover:shadow-md border border-amber-100 p-6 flex flex-col items-center justify-center gap-4 transition-all group hover:-translate-y-1"
        >
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
            <UserPlus size={32} className="text-amber-500" />
          </div>
          <span className="text-lg font-semibold text-gray-700 group-hover:text-amber-600 transition-colors">
            Indicar Cliente
          </span>
        </Link>

        {/* Card: Listar Indicações */}
        <Link 
          href="/dashboard/indicacoes"
          className="bg-white rounded-xl shadow-sm hover:shadow-md border border-amber-100 p-6 flex flex-col items-center justify-center gap-4 transition-all group hover:-translate-y-1"
        >
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
            <List size={32} className="text-amber-500" />
          </div>
          <span className="text-lg font-semibold text-gray-700 group-hover:text-amber-600 transition-colors">
            Listar Indicações
          </span>
        </Link>

        {/* Card: Extrato */}
        <Link 
          href="/dashboard/extrato"
          className="bg-white rounded-xl shadow-sm hover:shadow-md border border-amber-100 p-6 flex flex-col items-center justify-center gap-4 transition-all group hover:-translate-y-1"
        >
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
            <Wallet size={32} className="text-amber-500" />
          </div>
          <span className="text-lg font-semibold text-gray-700 group-hover:text-amber-600 transition-colors">
            Extrato
          </span>
        </Link>
        
        {/* Card: Parceiros (Admin Only) */}
        {isAdmin && (
          <Link 
            href="/dashboard/parceiros"
            className="bg-white rounded-xl shadow-sm hover:shadow-md border border-amber-100 p-6 flex flex-col items-center justify-center gap-4 transition-all group hover:-translate-y-1"
          >
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Users size={32} className="text-amber-500" />
            </div>
            <span className="text-lg font-semibold text-gray-700 group-hover:text-amber-600 transition-colors">
              Parceiros
            </span>
          </Link>
        )}

        {/* Card: Mensalidades */}
        <Link 
          href="/dashboard/mensalidades"
          className="bg-white rounded-xl shadow-sm hover:shadow-md border border-amber-100 p-6 flex flex-col items-center justify-center gap-4 transition-all group hover:-translate-y-1"
        >
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
            <DollarSign size={32} className="text-amber-500" />
          </div>
          <span className="text-lg font-semibold text-gray-700 group-hover:text-amber-600 transition-colors">
            Comissões
          </span>
        </Link>
        
        {/* Card: Lançar CATs (Admin Only) */}
        {isAdmin && (
          <Link 
            href="/dashboard/lancamentos/nova"
            className="bg-white rounded-xl shadow-sm hover:shadow-md border border-amber-100 p-6 flex flex-col items-center justify-center gap-4 transition-all group hover:-translate-y-1"
          >
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <PlusCircle size={32} className="text-amber-500" />
            </div>
            <span className="text-lg font-semibold text-gray-700 group-hover:text-amber-600 transition-colors">
              Lançar CATs
            </span>
          </Link>
        )}

      </div>
    </div>
  )
}
