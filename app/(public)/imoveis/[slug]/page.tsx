export const revalidate = 60
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  formatarPreco,
  formatarMetragem,
  traduzirTipo,
  traduzirStatus,
  traduzirTransacao,
  corStatus,
  gerarUrlWhatsApp,
} from '@/lib/utils'
import {
  BedDouble,
  Bath,
  Car,
  Maximize,
  MapPin,
  Phone,
  ChevronLeft,
  Home,
  CheckCircle,
} from 'lucide-react'
import GaleriaImagens from '@/components/public/GaleriaImagens'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const imovel = await prisma.imovel.findUnique({
    where: { slug: params.slug },
    include: { imagens: { orderBy: { ordem: 'asc' }, take: 1 } },
  })

  if (!imovel) return { title: 'Imóvel não encontrado' }

  const imagemPrincipal = imovel.imagens[0]
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: imovel.metaTitle || imovel.titulo,
    description:
      imovel.metaDescription ||
      `${traduzirTipo(imovel.tipo)} em ${imovel.bairro}, ${imovel.cidade}. ${formatarPreco(imovel.preco, imovel.tipoTransacao)}. ${formatarMetragem(imovel.metragem)}.`,
    openGraph: {
      title: imovel.titulo,
      description: imovel.descricao.slice(0, 160),
      images: imagemPrincipal
        ? [{ url: `${siteUrl}${imagemPrincipal.url}`, alt: imovel.titulo }]
        : [],
      type: 'article',
    },
  }
}

export async function generateStaticParams() {
  const imoveis = await prisma.imovel.findMany({
    select: { slug: true },
    where: { status: 'DISPONIVEL' },
  })
  return imoveis.map((i) => ({ slug: i.slug }))
}

export default async function ImovelPage({ params }: Props) {
  const imovel = await prisma.imovel.findUnique({
    where: { slug: params.slug },
    include: {
      imagens: { orderBy: { ordem: 'asc' } },
    },
  })

  if (!imovel) notFound()

  const urlWhatsApp = gerarUrlWhatsApp(imovel.titulo, imovel.slug)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Schema.org para SEO
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: imovel.titulo,
    description: imovel.descricao,
    url: `${siteUrl}/imoveis/${imovel.slug}`,
    image: imovel.imagens.map((img) => `${siteUrl}${img.url}`),
    offers: {
      '@type': 'Offer',
      price: imovel.preco,
      priceCurrency: 'BRL',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: imovel.cidade,
      addressRegion: imovel.estado,
      addressCountry: 'BR',
    },
  }

  return (
    <>
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      <div className="py-8">
        <div className="container-page">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="flex items-center gap-1 hover:text-primary-700">
              <Home className="w-4 h-4" />
              Início
            </Link>
            <span>/</span>
            <Link href="/imoveis" className="hover:text-primary-700">
              Imóveis
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{imovel.titulo}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna principal */}
            <div className="lg:col-span-2">
              {/* Galeria */}
              <GaleriaImagens imagens={imovel.imagens} titulo={imovel.titulo} />

              {/* Informações principais */}
              <div className="mt-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`badge ${corStatus(imovel.status)}`}>
                    {traduzirStatus(imovel.status)}
                  </span>
                  <span className="badge bg-primary-100 text-primary-800">
                    {traduzirTipo(imovel.tipo)}
                  </span>
                  <span className="badge bg-gray-100 text-gray-700">
                    {traduzirTransacao(imovel.tipoTransacao)}
                  </span>
                  {imovel.destaque && (
                    <span className="badge bg-yellow-100 text-yellow-800">
                      ⭐ Destaque
                    </span>
                  )}
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {imovel.titulo}
                </h1>

                <div className="flex items-center gap-1 text-gray-600 mb-6">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {imovel.bairro}, {imovel.cidade} - {imovel.estado}
                    {imovel.cep && ` · CEP: ${imovel.cep}`}
                  </span>
                </div>

                {/* Características */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                  {imovel.quartos > 0 && (
                    <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg">
                      <BedDouble className="w-6 h-6 text-primary-600 mb-1" />
                      <span className="text-xl font-bold text-gray-900">{imovel.quartos}</span>
                      <span className="text-xs text-gray-500">
                        {imovel.quartos === 1 ? 'Quarto' : 'Quartos'}
                      </span>
                      {imovel.suites > 0 && (
                        <span className="text-xs text-primary-600 mt-0.5">
                          {imovel.suites} suíte{imovel.suites > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}
                  {imovel.banheiros > 0 && (
                    <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg">
                      <Bath className="w-6 h-6 text-primary-600 mb-1" />
                      <span className="text-xl font-bold text-gray-900">{imovel.banheiros}</span>
                      <span className="text-xs text-gray-500">
                        {imovel.banheiros === 1 ? 'Banheiro' : 'Banheiros'}
                      </span>
                    </div>
                  )}
                  {imovel.vagas > 0 && (
                    <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg">
                      <Car className="w-6 h-6 text-primary-600 mb-1" />
                      <span className="text-xl font-bold text-gray-900">{imovel.vagas}</span>
                      <span className="text-xs text-gray-500">
                        {imovel.vagas === 1 ? 'Vaga' : 'Vagas'}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg">
                    <Maximize className="w-6 h-6 text-primary-600 mb-1" />
                    <span className="text-xl font-bold text-gray-900">{imovel.metragem}</span>
                    <span className="text-xs text-gray-500">m² úteis</span>
                    {imovel.metragemTerreno && (
                      <span className="text-xs text-gray-400 mt-0.5">
                        {imovel.metragemTerreno} m² terreno
                      </span>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Descrição</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {imovel.descricao}
                  </div>
                </div>

                {/* Comodidades */}
                {imovel.comodidades.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Comodidades</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {imovel.comodidades.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                {/* Preço */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">
                    {imovel.tipoTransacao === 'ALUGUEL' ? 'Aluguel mensal' : 'Valor de venda'}
                  </p>
                  <p className="text-3xl font-bold text-primary-700">
                    {formatarPreco(imovel.preco, imovel.tipoTransacao)}
                  </p>
                </div>

                {/* Resumo */}
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tipo</span>
                    <span className="font-medium text-gray-900">{traduzirTipo(imovel.tipo)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Área</span>
                    <span className="font-medium text-gray-900">{formatarMetragem(imovel.metragem)}</span>
                  </div>
{/* Custos adicionais */}
{((imovel.condominio ?? 0) > 0 || (imovel.iptu ?? 0) > 0) && (
  <div className="mt-4 pt-4 border-t border-gray-200">
    <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
      Custos adicionais
    </p>

    <div className="space-y-1 text-sm">
      {(imovel.condominio ?? 0) > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-500">Condomínio</span>
          <span className="font-medium text-gray-700">
            {(imovel.condominio ?? 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>
      )}

      {(imovel.iptu ?? 0) > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-500">IPTU</span>
          <span className="font-medium text-gray-700">
            {(imovel.iptu ?? 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>
      )}
    </div>
  </div>
)}                  {imovel.quartos > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Quartos</span>
                      <span className="font-medium text-gray-900">{imovel.quartos}</span>
                    </div>
                  )}
                  {imovel.banheiros > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Banheiros</span>
                      <span className="font-medium text-gray-900">{imovel.banheiros}</span>
                    </div>
                  )}
                  {imovel.vagas > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Vagas</span>
                      <span className="font-medium text-gray-900">{imovel.vagas}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Localização</span>
                    <span className="font-medium text-gray-900 text-right">
                      {imovel.bairro}, {imovel.cidade}
                    </span>
                  </div>
                </div>

                {/* Botão WhatsApp */}
                <a
                  href={urlWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full mb-3"
                >
                  <Phone className="w-5 h-5" />
                  Tenho Interesse
                </a>

                <p className="text-xs text-gray-500 text-center">
                  Clique para falar diretamente com a corretora via WhatsApp
                </p>

                {/* Código do imóvel */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 text-center">
                    Código: {imovel.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Voltar */}
          <div className="mt-8">
            <Link href="/imoveis" className="btn-secondary inline-flex">
              <ChevronLeft className="w-4 h-4" />
              Voltar para listagem
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
