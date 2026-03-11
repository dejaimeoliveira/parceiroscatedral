import { createClient } from '@/utils/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { Sidebar } from '@/components/layout/sidebar'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import { checkRole } from '@/utils/supabase/check-role'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = await checkRole(1)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Topbar Fixa (Passando o e-mail do usuário) */}
      <Topbar userEmail={user.email} />

      <div className="flex flex-1 pt-16">
        {/* Sidebar Fixa (Esquerda) */}
        <Sidebar isAdmin={isAdmin} />

        {/* Conteúdo Principal Central */}
        <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
