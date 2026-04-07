export const dynamic = 'force-dynamic'
export const revalidate = 0
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Building2, PlusCircle, Eye, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'
import { formatarPreco } from '@/lib/utils'

async function getEstatisticas() {
  const [
    total,
    disponiveis,
    vendidos,
    alugados,
    reservados,
    semImagem,
    recentes,
  ] = await Promise.all([
    prisma.imovel.count(),
    prisma.imovel.count({ where: { status: 'DISPONIVEL' } }),
    prisma.imovel.count({ where: { status: 'VENDIDO' } }),
    prisma.imovel.count({ where: { status: 'ALUGADO' } }),
    prisma.imovel.count({ where: { status: 'RESERVADO' } }),
    prisma.imovel.count({ where: { imagens: { none: {} } } }),
    prisma.imovel.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        imagens: { take: 1, orderBy: { ordem: 'asc' } },
      },
    }),
  ])

  return { total, disponiveis, vendidos, alugados, reservados, semImagem, recentes }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const stats = await getEstatisticas()

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="space-y-6">
      {/* Saudação */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {saudacao}, {session?.user?.name?.split(' ')[0] || 'Corretora'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Aqui está o resumo dos seus imóveis.</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Total</p>
            <Building2 className="w-5 h-5 text-primary-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">imóveis cadastrados</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Disponíveis</p>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.disponiveis}</p>
          <p className="text-xs text-gray-500 mt-1">para venda/aluguel</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Vendidos</p>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.vendidos}</p>
          <p className="text-xs text-gray-500 mt-1">negócios fechados</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Reservados</p>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.reservados}</p>
          <p className="text-xs text-gray-500 mt-1">em negociação</p>
        </div>
      </div>

      {/* Alertas */}
      {stats.semImagem > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {stats.semImagem} {stats.semImagem === 1 ? 'imóvel sem imagem' : 'imóveis sem imagens'}
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Imóveis sem fotos têm menor visibilidade. Adicione imagens para melhorar o desempenho.
            </p>
            <Link href="/admin/imoveis" className="text-xs text-yellow-800 font-medium underline mt-1 inline-block">
              Ver imóveis →
            </Link>
          </div>
        </div>
      )}

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/imoveis/novo"
          className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
            <PlusCircle className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Cadastrar Imóvel</p>
            <p className="text-sm text-gray-500">Adicionar novo imóvel ao portfólio</p>
          </div>
        </Link>

        <Link
          href="/admin/imoveis"
          className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Gerenciar Imóveis</p>
            <p className="text-sm text-gray-500">Editar, excluir e atualizar status</p>
          </div>
        </Link>
      </div>

      {/* Imóveis recentes */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Imóveis Recentes</h2>
          <Link href="/admin/imoveis" className="text-sm text-primary-600 hover:text-primary-700">
            Ver todos →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {stats.recentes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>Nenhum imóvel cadastrado ainda.</p>
              <Link href="/admin/imoveis/novo" className="btn-primary mt-4 inline-flex text-sm">
                <PlusCircle className="w-4 h-4" />
                Cadastrar primeiro imóvel
              </Link>
            </div>
          ) : (
            stats.recentes.map((imovel) => (
              <div key={imovel.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{imovel.titulo}</p>
                  <p className="text-sm text-gray-500">
                    {imovel.bairro}, {imovel.cidade} · {formatarPreco(imovel.preco, imovel.tipoTransacao)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${
                    imovel.status === 'DISPONIVEL' ? 'bg-green-100 text-green-800' :
                    imovel.status === 'VENDIDO' ? 'bg-red-100 text-red-800' :
                    imovel.status === 'ALUGADO' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {imovel.status === 'DISPONIVEL' ? 'Disponível' :
                     imovel.status === 'VENDIDO' ? 'Vendido' :
                     imovel.status === 'ALUGADO' ? 'Alugado' : 'Reservado'}
                  </span>
                  <Link
                    href={`/admin/imoveis/${imovel.id}/editar`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
