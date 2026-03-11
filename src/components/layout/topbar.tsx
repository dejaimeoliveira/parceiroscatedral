import { LogOut } from 'lucide-react'
import { logout } from '@/app/dashboard/actions'

interface TopbarProps {
  userEmail: string | undefined
}

export function Topbar({ userEmail }: TopbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-amber-500 text-white shadow-md z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        {/* Título Centralizado no conceito, mas alinhado à esquerda na Topbar real para manter o logo */}
        <h1 className="text-xl font-bold tracking-wide">
          Parceiros Catedral
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
            {userEmail?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium hidden sm:block">
            {userEmail}
          </span>
        </div>

        <form action={logout}>
          <button 
            title="Sair do Sistema"
            className="flex items-center justify-center p-2 rounded hover:bg-amber-600 transition-colors"
          >
            <LogOut size={20} className="text-amber-50" />
          </button>
        </form>
      </div>
    </header>
  )
}
