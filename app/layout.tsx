import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: process.env.NEXT_PUBLIC_SITE_NAME || 'Imóveis Premium',
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME || 'Imóveis Premium'}`,
  },
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Encontre o imóvel dos seus sonhos',
  keywords: ['imóveis', 'apartamentos', 'casas', 'terrenos', 'comprar imóvel', 'alugar imóvel'],
  authors: [{ name: process.env.NEXT_PUBLIC_SITE_NAME || 'Imóveis Premium' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Imóveis Premium',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
