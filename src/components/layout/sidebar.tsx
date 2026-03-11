'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  UserPlus, 
  List, 
  Wallet, 
  Users,
  DollarSign,
  Home, // Added Home icon
  PlusCircle // Added PlusCircle icon
} from 'lucide-react'

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Parceiros', href: '/dashboard/parceiros', icon: Users },
  { name: 'Indicar Cliente', href: '/dashboard/indicacoes/nova', icon: UserPlus },
  { name: 'Listar Indicações', href: '/dashboard/indicacoes', icon: List },
  { name: 'Comissões', href: '/dashboard/mensalidades', icon: DollarSign },
  { name: 'Extrato', href: '/dashboard/extrato', icon: Wallet },
  { name: 'Lançar CATs', href: '/dashboard/lancamentos/nova', icon: PlusCircle },
]

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  const filteredMenuItems = MENU_ITEMS.filter(
    item => {
      // Only admins can see Parceiros and Lançar CATs
      if ((item.name === 'Parceiros' || item.name === 'Lançar CATs') && !isAdmin) {
        return false;
      }
      return true;
    }
  )

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 shadow-sm overflow-y-auto hidden md:block z-40">
      <nav className="p-4 flex flex-col gap-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/dashboard')

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-amber-50 text-amber-600' 
                  : 'text-gray-600 hover:bg-slate-50 hover:text-amber-600'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
