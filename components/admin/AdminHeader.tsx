'use client'

import { signOut } from 'next-auth/react'
import { LogOut, User, Menu } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | undefined
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Menu mobile */}
      <button className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block" />

      {/* Usuário */}
      <div className="relative">
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="font-medium text-gray-900 leading-none">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
          </div>
        </button>

        {menuAberto && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setMenuAberto(false)}
            >
              Ver site público
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
