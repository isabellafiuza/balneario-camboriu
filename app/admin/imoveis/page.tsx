import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { PlusCircle, Pencil, Eye, Building2 } from 'lucide-react'
import { formatarPreco, traduzirTipo, traduzirStatus, corStatus } from '@/lib/utils'
import ExcluirImovelBtn from '@/components/admin/ExcluirImovelBtn'
import AlterarStatusBtn from '@/components/admin/AlterarStatusBtn'

export const revalidate = 0

async function getImoveis() {
  return prisma.imovel.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      imagens: {
        orderBy: { ordem: 'asc' },
        take: 1,
      },
    },
  })
}

export default async function AdminImoveisPage() {
  const imoveis = await getImoveis()

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Imóveis</h1>
          <p className="text-gray-600 mt-1">{imoveis.length} imóveis cadastrados</p>
        </div>
        <Link href="/admin/imoveis/novo" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Novo Imóvel
        </Link>
      </div>

      {/* Lista */}
      {imoveis.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum imóvel cadastrado</h3>
          <p className="text-gray-500 mb-6">Comece adicionando seu primeiro imóvel ao portfólio.</p>
          <Link href="/admin/imoveis/novo" className="btn-primary inline-flex">
            <PlusCircle className="w-4 h-4" />
            Cadastrar Primeiro Imóvel
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Imóvel
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                    Localização
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                    Preço
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {imoveis.map((imovel) => {
                  const imagem = imovel.imagens[0]
                  return (
                    <tr key={imovel.id} className="hover:bg-gray-50 transition-colors">
                      {/* Imóvel */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {imagem ? (
                              <Image
                                src={imagem.url}
                                alt={imovel.titulo}
                                width={56}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-xs">{imovel.titulo}</p>
                            <p className="text-xs text-gray-500">{traduzirTipo(imovel.tipo)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Localização */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-gray-700">{imovel.bairro}</p>
                        <p className="text-xs text-gray-500">{imovel.cidade}, {imovel.estado}</p>
                      </td>

                      {/* Preço */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-sm font-medium text-gray-900">
                          {formatarPreco(imovel.preco, imovel.tipoTransacao)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <AlterarStatusBtn
                          imovelId={imovel.id}
                          statusAtual={imovel.status}
                        />
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/imoveis/${imovel.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver no site"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/imoveis/${imovel.id}/editar`}
                            className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <ExcluirImovelBtn imovelId={imovel.id} titulo={imovel.titulo} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
