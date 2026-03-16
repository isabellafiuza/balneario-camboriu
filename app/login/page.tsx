'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Home, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'
  const erro = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erroLogin, setErroLogin] = useState('')

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Imóveis Premium'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErroLogin('')

    try {
      const resultado = await signIn('credentials', {
        email,
        password: senha,
        redirect: false,
        callbackUrl,
      })

      if (resultado?.error) {
        setErroLogin('Email ou senha incorretos. Tente novamente.')
      } else if (resultado?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setErroLogin('Ocorreu um erro. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-2xl">
            <Home className="w-8 h-8" />
            <span>{siteName}</span>
          </Link>
          <p className="text-primary-200 mt-2">Área da Corretora</p>
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Entrar</h1>
          <p className="text-gray-600 mb-6">Acesse o painel de gerenciamento de imóveis</p>

          {/* Erro de autenticação */}
          {(erroLogin || erro) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {erroLogin || 'Erro de autenticação. Verifique suas credenciais.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label-field">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="corretora@exemplo.com"
                className="input-field"
                required
                autoComplete="email"
                disabled={carregando}
              />
            </div>

            <div>
              <label htmlFor="senha" className="label-field">
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  required
                  autoComplete="current-password"
                  disabled={carregando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="btn-primary w-full mt-2"
            >
              {carregando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-primary-700 transition-colors">
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
