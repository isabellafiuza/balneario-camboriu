import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import CartaoImovel from '@/components/public/CartaoImovel'
import FiltroImoveis from '@/components/public/FiltroImoveis'
import PaginacaoImoveis from '@/components/public/PaginacaoImoveis'
import { Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Imóveis Disponíveis',
  description: 'Encontre apartamentos, casas, terrenos e imóveis comerciais disponíveis para compra e aluguel.',
}

interface SearchParams {
  busca?: string
  tipo?: string
  tipoTransacao?: string
  bairro?: string
  cidade?: string
  precoMin?: string
  precoMax?: string
  quartosMin?: string
  status?: string
  ordenar?: string
  pagina?: string
  destaque?: string
}

async function getImoveis(params: SearchParams) {
  const pagina = parseInt(params.pagina || '1')
  const porPagina = 12
  const skip = (pagina - 1) * porPagina

  const where: any = {}

  // Status padrão: disponíveis
  const status = params.status || 'DISPONIVEL'
  if (status !== 'TODOS') {
    where.status = status
  }

  if (params.busca) {
    where.OR = [
      { titulo: { contains: params.busca, mode: 'insensitive' } },
      { descricao: { contains: params.busca, mode: 'insensitive' } },
      { bairro: { contains: params.busca, mode: 'insensitive' } },
      { cidade: { contains: params.busca, mode: 'insensitive' } },
    ]
  }
  if (params.tipo) where.tipo = params.tipo
  if (params.tipoTransacao) where.tipoTransacao = params.tipoTransacao
  if (params.bairro) where.bairro = { contains: params.bairro, mode: 'insensitive' }
  if (params.cidade) where.cidade = { contains: params.cidade, mode: 'insensitive' }
  if (params.destaque === 'true') where.destaque = true

  if (params.precoMin || params.precoMax) {
    where.preco = {}
    if (params.precoMin) where.preco.gte = parseFloat(params.precoMin)
    if (params.precoMax) where.preco.lte = parseFloat(params.precoMax)
  }

  if (params.quartosMin) {
    where.quartos = { gte: parseInt(params.quartosMin) }
  }

  let orderBy: any = { createdAt: 'desc' }
  if (params.ordenar === 'preco_asc') orderBy = { preco: 'asc' }
  else if (params.ordenar === 'preco_desc') orderBy = { preco: 'desc' }
  else if (params.ordenar === 'data_asc') orderBy = { createdAt: 'asc' }

  const [imoveis, total] = await Promise.all([
    prisma.imovel.findMany({
      where,
      orderBy,
      skip,
      take: porPagina,
      include: {
        imagens: {
          orderBy: { ordem: 'asc' },
          take: 1,
        },
      },
    }),
    prisma.imovel.count({ where }),
  ])

  return {
    imoveis,
    total,
    pagina,
    porPagina,
    totalPaginas: Math.ceil(total / porPagina),
  }
}

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { imoveis, total, pagina, totalPaginas } = await getImoveis(searchParams)

  const temFiltros = !!(
    searchParams.busca ||
    searchParams.tipo ||
    searchParams.tipoTransacao ||
    searchParams.bairro ||
    searchParams.cidade ||
    searchParams.precoMin ||
    searchParams.precoMax ||
    searchParams.quartosMin
  )

  return (
    <div className="py-8">
      <div className="container-page">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchParams.tipoTransacao === 'ALUGUEL'
              ? 'Imóveis para Alugar'
              : searchParams.tipoTransacao === 'VENDA'
              ? 'Imóveis à Venda'
              : 'Todos os Imóveis'}
          </h1>
          <p className="text-gray-600">
            {total === 0
              ? 'Nenhum imóvel encontrado'
              : `${total} ${total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`}
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <Suspense fallback={<div className="h-16 bg-white rounded-xl animate-pulse" />}>
            <FiltroImoveis />
          </Suspense>
        </div>

        {/* Grade de imóveis */}
        {imoveis.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {imoveis.map((imovel) => (
                <CartaoImovel key={imovel.id} imovel={imovel as any} />
              ))}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <PaginacaoImoveis
                paginaAtual={pagina}
                totalPaginas={totalPaginas}
                searchParams={searchParams}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum imóvel encontrado
            </h3>
            <p className="text-gray-500 mb-6">
              {temFiltros
                ? 'Tente ajustar os filtros para encontrar mais resultados.'
                : 'Ainda não há imóveis cadastrados.'}
            </p>
            {temFiltros && (
              <a href="/imoveis" className="btn-primary">
                Limpar filtros
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
