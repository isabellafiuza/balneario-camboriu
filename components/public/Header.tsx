'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Home, Phone } from 'lucide-react'

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false)
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Imóveis Premium'
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-700">
            <Home className="w-6 h-6" />
            <span>{siteName}</span>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary-700 font-medium transition-colors"
            >
              Início
            </Link>
            <Link
              href="/imoveis"
              className="text-gray-600 hover:text-primary-700 font-medium transition-colors"
            >
              Imóveis
            </Link>
            <Link
              href="/imoveis?tipoTransacao=VENDA"
              className="text-gray-600 hover:text-primary-700 font-medium transition-colors"
            >
              Comprar
            </Link>
            <Link
              href="/imoveis?tipoTransacao=ALUGUEL"
              className="text-gray-600 hover:text-primary-700 font-medium transition-colors"
            >
              Alugar
            </Link>
          </nav>

          {/* CTA Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-sm py-2 px-4"
            >
              <Phone className="w-4 h-4" />
              WhatsApp
            </a>
          </div>

          {/* Menu Mobile */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label="Menu"
          >
            {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {menuAberto && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4">
          <div className="container-page flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setMenuAberto(false)}
              className="text-gray-700 hover:text-primary-700 font-medium py-2"
            >
              Início
            </Link>
            <Link
              href="/imoveis"
              onClick={() => setMenuAberto(false)}
              className="text-gray-700 hover:text-primary-700 font-medium py-2"
            >
              Todos os Imóveis
            </Link>
            <Link
              href="/imoveis?tipoTransacao=VENDA"
              onClick={() => setMenuAberto(false)}
              className="text-gray-700 hover:text-primary-700 font-medium py-2"
            >
              Comprar
            </Link>
            <Link
              href="/imoveis?tipoTransacao=ALUGUEL"
              onClick={() => setMenuAberto(false)}
              className="text-gray-700 hover:text-primary-700 font-medium py-2"
            >
              Alugar
            </Link>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-sm py-2 px-4 w-full justify-center"
            >
              <Phone className="w-4 h-4" />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
