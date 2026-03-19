"use client"

import { login } from './actions'
import Link from 'next/link'

export default function LoginForm({ message }: { message?: string }) {
    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 min-h-screen mx-auto">
            <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
                <h1 className="text-3xl font-bold text-center mb-8">Parceiros Catedral</h1>

                <label className="text-md font-medium" htmlFor="email">Email</label>
                <input
                    className="rounded-md px-4 py-2 bg-inherit border mb-6"
                    name="email"
                    placeholder="voce@exemplo.com"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    onChange={(e) => (e.target.value = e.target.value.toLowerCase())}
                />

                <label className="text-md font-medium" htmlFor="password">Senha</label>
                <input
                    className="rounded-md px-4 py-2 bg-inherit border mb-6"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                />

                <div className="flex flex-col gap-4 mt-6">
                    <button
                        formAction={login}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors"
                    >
                        Entrar
                    </button>

                    <div className="flex justify-between text-sm mt-2">
                        <Link href="/esqueci-senha" className="text-amber-700 hover:text-amber-800 hover:underline transition-colors">
                            Esqueci minha senha
                        </Link>
                        <Link href="/cadastro" className="text-amber-700 hover:text-amber-800 font-medium hover:underline transition-colors">
                            Criar uma conta
                        </Link>
                    </div>
                </div>

                {message && (
                    <p className="mt-4 p-4 bg-red-100 text-red-600 font-medium text-center rounded-md">
                        {message}
                    </p>
                )}
            </form>
        </div>
    )
}