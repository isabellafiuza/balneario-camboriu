export const revalidate = 60
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CartaoImovel from '@/components/public/CartaoImovel'
import HeroSection from '@/components/site-new/HeroSection'
import { Phone, Shield, Star, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Início',
  description: 'Encontre o imóvel dos seus sonhos. Apartamentos, casas, terrenos e muito mais.',
}

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

export default async function HomePage() {
  const [imoveisDestaque, imoveisRecentes] = await Promise.all([
    getImoveisDestaque(),
    getImoveisRecentes(),
  ])

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5547988419882'

  return (
    <>
      <HeroSection whatsapp={whatsapp} />

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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {imoveisRecentes.map((imovel) => (
              <CartaoImovel key={imovel.id} imovel={imovel as any} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/imoveis" className="btn-primary">
              Ver Todos os Imóveis
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="section-title">Por que nos escolher?</h2>
            <p className="section-subtitle">
              Comprometidos com a melhor experiência para você
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: Shield,
                titulo: 'Segurança e Confiança',
                descricao:
                  'Todos os imóveis são verificados e documentados para sua tranquilidade.',
              },
              {
                icon: Star,
                titulo: 'Atendimento Personalizado',
                descricao:
                  'Corretores especializados prontos para encontrar o imóvel ideal para você.',
              },
              {
                icon: TrendingUp,
                titulo: 'Melhores Oportunidades',
                descricao:
                  'Acesso às melhores ofertas do mercado imobiliário da região.',
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

      <section className="bg-primary-700 text-white py-16">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para encontrar seu imóvel?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
            Entre em contato agora e fale diretamente com nossa corretora especializada.
          </p>

          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
              'Olá! Gostaria de saber mais sobre os imóveis disponíveis.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
inline-flex items-center gap-2
px-10 py-4 text-lg font-medium
rounded-xl
bg-green-600 text-white
transition-all duration-300
hover:bg-[#C6A85A] hover:text-black
hover:shadow-[0_0_20px_rgba(198,168,90,0.4)]
hover:scale-[1.02]
active:scale-[0.98]
"
          >
            <Phone className="w-5 h-5" />
            Falar no WhatsApp Agora
          </a>
        </div>
      </section>
    </>
  )
}