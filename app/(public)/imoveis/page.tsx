export const dynamic = 'force-dynamic'
export const revalidate = 0
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
  [key: string]: string | string[] | undefined
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

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

async function getImoveis(params: SearchParams) {
  const pagina = parseInt(getParam(params.pagina) || '1')
  const porPagina = 12
  const skip = (pagina - 1) * porPagina

  const where: any = {}

  const status = getParam(params.status) || 'DISPONIVEL'
  if (status !== 'TODOS') {
    where.status = status
  }

  const busca = getParam(params.busca)
  const tipo = getParam(params.tipo)
  const tipoTransacao = getParam(params.tipoTransacao)
  const bairro = getParam(params.bairro)
  const cidade = getParam(params.cidade)
  const destaque = getParam(params.destaque)
  const precoMin = getParam(params.precoMin)
  const precoMax = getParam(params.precoMax)
  const quartosMin = getParam(params.quartosMin)
  const ordenar = getParam(params.ordenar)

  if (busca) {
    where.OR = [
      { titulo: { contains: busca, mode: 'insensitive' } },
      { descricao: { contains: busca, mode: 'insensitive' } },
      { bairro: { contains: busca, mode: 'insensitive' } },
      { cidade: { contains: busca, mode: 'insensitive' } },
    ]
  }

  if (tipo) where.tipo = tipo
  if (tipoTransacao) where.tipoTransacao = tipoTransacao
  if (bairro) where.bairro = { contains: bairro, mode: 'insensitive' }
  if (cidade) where.cidade = { contains: cidade, mode: 'insensitive' }
  if (destaque === 'true') where.destaque = true

  if (precoMin || precoMax) {
    where.preco = {}
    if (precoMin) where.preco.gte = parseFloat(precoMin)
    if (precoMax) where.preco.lte = parseFloat(precoMax)
  }

  if (quartosMin) {
    where.quartos = { gte: parseInt(quartosMin) }
  }

  let orderBy: any = { createdAt: 'desc' }
  if (ordenar === 'preco_asc') orderBy = { preco: 'asc' }
  else if (ordenar === 'preco_desc') orderBy = { preco: 'desc' }
  else if (ordenar === 'data_asc') orderBy = { createdAt: 'asc' }

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
    getParam(searchParams.busca) ||
    getParam(searchParams.tipo) ||
    getParam(searchParams.tipoTransacao) ||
    getParam(searchParams.bairro) ||
    getParam(searchParams.cidade) ||
    getParam(searchParams.precoMin) ||
    getParam(searchParams.precoMax) ||
    getParam(searchParams.quartosMin)
  )

  return (
    <div className="py-8">
      <div className="container-page">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getParam(searchParams.tipoTransacao) === 'ALUGUEL'
              ? 'Imóveis para Alugar'
              : getParam(searchParams.tipoTransacao) === 'VENDA'
              ? 'Imóveis à Venda'
              : 'Todos os Imóveis'}
          </h1>
          <p className="text-gray-600">
            {total === 0
              ? 'Nenhum imóvel encontrado'
              : `${total} ${total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`}
          </p>
        </div>

        <div className="mb-8">
          <Suspense fallback={<div className="h-16 bg-white rounded-xl animate-pulse" />}>
            <FiltroImoveis />
          </Suspense>
        </div>

        {imoveis.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {imoveis.map((imovel) => (
                <CartaoImovel key={imovel.id} imovel={imovel as any} />
              ))}
            </div>

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
