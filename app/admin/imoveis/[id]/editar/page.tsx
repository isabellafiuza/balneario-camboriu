import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import FormularioImovel from '@/components/admin/FormularioImovel'

interface Props {
  params: { id: string }
}

export default async function EditarImovelPage({ params }: Props) {
  const imovel = await prisma.imovel.findUnique({
    where: { id: params.id },
    include: {
      imagens: { orderBy: { ordem: 'asc' } },
    },
  })

  if (!imovel) notFound()

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/imoveis" className="btn-secondary py-2 px-3">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Imóvel</h1>
            <p className="text-gray-600 mt-0.5 truncate max-w-md">{imovel.titulo}</p>
          </div>
        </div>
        <Link
          href={`/imoveis/${imovel.slug}`}
          target="_blank"
          className="btn-secondary py-2 px-4 text-sm hidden sm:flex"
        >
          <ExternalLink className="w-4 h-4" />
          Ver no site
        </Link>
      </div>

      <FormularioImovel
        imovel={{
          ...imovel,
          metragemTerreno: imovel.metragemTerreno ?? undefined,
          cep: imovel.cep ?? undefined,
          endereco: imovel.endereco ?? undefined,
          numero: imovel.numero ?? undefined,
          complemento: imovel.complemento ?? undefined,
          metaTitle: imovel.metaTitle ?? undefined,
          metaDescription: imovel.metaDescription ?? undefined,
        }}
        modo="editar"
      />
    </div>
  )
}
