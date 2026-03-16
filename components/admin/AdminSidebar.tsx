'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building2, PlusCircle, RefreshCw, LayoutDashboard, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/admin/imoveis',
    label: 'Imóveis',
    icon: Building2,
    exact: false,
  },
  {
    href: '/admin/imoveis/novo',
    label: 'Novo Imóvel',
    icon: PlusCircle,
    exact: true,
  },
  {
    href: '/admin/notion',
    label: 'Sync Notion',
    icon: RefreshCw,
    exact: false,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Imóveis Premium'

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-gray-900 text-white min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
          <Home className="w-6 h-6 text-primary-400" />
          <span className="truncate">{siteName}</span>
        </Link>
        <p className="text-xs text-gray-500 mt-1">Painel Administrativo</p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const ativo = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && item.href !== '/admin'
                ? true
                : pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    ativo
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Link para o site */}
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ver site público
        </Link>
      </div>
    </aside>
  )
}
