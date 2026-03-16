import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CartaoImovel from '@/components/public/CartaoImovel'
import { Home, Search, Star, Phone, Shield, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Início',
  description: 'Encontre o imóvel dos seus sonhos. Apartamentos, casas, terrenos e muito mais.',
}

export const revalidate = 60 // Revalidar a cada 60 segundos

async function getImoveisDestaque() {
  return prisma.imovel.findMany({
    where: { status: 'DISPONIVEL', destaque: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      imagens: {
        orderBy: { ordem: 'asc' },
        take: 1,
      },
    },
  })
}

async function getImoveisRecentes() {
  return prisma.imovel.findMany({
    where: { status: 'DISPONIVEL' },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      imagens: {
        orderBy: { ordem: 'asc' },
        take: 1,
      },
    },
  })
}

async function getEstatisticas() {
  const [total, disponiveis, cidades] = await Promise.all([
    prisma.imovel.count(),
    prisma.imovel.count({ where: { status: 'DISPONIVEL' } }),
    prisma.imovel.findMany({
      select: { cidade: true },
      distinct: ['cidade'],
    }),
  ])
  return { total, disponiveis, cidades: cidades.length }
}

export default async function HomePage() {
  const [imoveisDestaque, imoveisRecentes, stats] = await Promise.all([
    getImoveisDestaque(),
    getImoveisRecentes(),
    getEstatisticas(),
  ])

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Imóveis Premium'

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20 lg:py-28">
        <div className="container-page text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
              <Home className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Encontre o Imóvel<br />
            <span className="text-primary-200">dos Seus Sonhos</span>
          </h1>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Apartamentos, casas, terrenos e imóveis comerciais. Atendimento personalizado para você.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/imoveis" className="btn-primary bg-white text-primary-700 hover:bg-primary-50 text-lg py-4 px-8">
              <Search className="w-5 h-5" />
              Ver Todos os Imóveis
            </Link>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-lg py-4 px-8"
            >
              <Phone className="w-5 h-5" />
              Falar com Corretor
            </a>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-page py-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary-700">{stats.total}+</p>
              <p className="text-sm text-gray-600 mt-1">Imóveis Cadastrados</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{stats.disponiveis}</p>
              <p className="text-sm text-gray-600 mt-1">Disponíveis Agora</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-700">{stats.cidades}</p>
              <p className="text-sm text-gray-600 mt-1">{stats.cidades === 1 ? 'Cidade' : 'Cidades'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Imóveis em Destaque */}
      {imoveisDestaque.length > 0 && (
        <section className="py-16">
          <div className="container-page">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 text-primary-600 font-medium mb-2">
                  <Star className="w-5 h-5 fill-current" />
                  <span>Selecionados para você</span>
                </div>
                <h2 className="section-title">Imóveis em Destaque</h2>
              </div>
              <Link href="/imoveis?destaque=true" className="btn-secondary hidden sm:flex">
                Ver todos
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {imoveisDestaque.map((imovel) => (
                <CartaoImovel key={imovel.id} imovel={imovel as any} />
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Link href="/imoveis?destaque=true" className="btn-secondary">
                Ver todos os destaques
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Imóveis Recentes */}
      <section className="py-16 bg-gray-50">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary-600 font-medium mb-2">
                <TrendingUp className="w-5 h-5" />
                <span>Novidades</span>
              </div>
              <h2 className="section-title">Imóveis Recentes</h2>
            </div>
            <Link href="/imoveis" className="btn-secondary hidden sm:flex">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {imoveisRecentes.map((imovel) => (
              <CartaoImovel key={imovel.id} imovel={imovel as any} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/imoveis" className="btn-primary">
              <Search className="w-4 h-4" />
              Ver Todos os Imóveis
            </Link>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="section-title">Por que nos escolher?</h2>
            <p className="section-subtitle">Comprometidos com a melhor experiência para você</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                titulo: 'Segurança e Confiança',
                descricao: 'Todos os imóveis são verificados e documentados para sua tranquilidade.',
              },
              {
                icon: Star,
                titulo: 'Atendimento Personalizado',
                descricao: 'Corretores especializados prontos para encontrar o imóvel ideal para você.',
              },
              {
                icon: TrendingUp,
                titulo: 'Melhores Oportunidades',
                descricao: 'Acesso às melhores ofertas do mercado imobiliário da região.',
              },
            ].map((item) => (
              <div key={item.titulo} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-full mb-4">
                  <item.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.titulo}</h3>
                <p className="text-gray-600">{item.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-primary-700 text-white py-16">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para encontrar seu imóvel?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
            Entre em contato agora e fale diretamente com nossa corretora especializada.
          </p>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre os imóveis disponíveis.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp text-lg py-4 px-10 inline-flex"
          >
            <Phone className="w-5 h-5" />
            Falar no WhatsApp Agora
          </a>
        </div>
      </section>
    </>
  )
}
