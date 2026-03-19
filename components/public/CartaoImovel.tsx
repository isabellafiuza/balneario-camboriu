import Link from 'next/link'
import Image from 'next/image'
import { BedDouble, Bath, Car, Maximize, MapPin } from 'lucide-react'
import { formatarPreco, formatarMetragem, traduzirTipo, traduzirStatus, corStatus, cn } from '@/lib/utils'

interface CartaoImovelProps {
  imovel: {
    id: string
    slug: string
    titulo: string
    preco: number
    tipo: string
    tipoTransacao: string
    status: string
    bairro: string
    cidade: string
    estado: string
    quartos: number
    banheiros: number
    vagas: number
    metragem: number
    destaque: boolean
    imagens: {
      id: string
      url: string
      alt: string | null
      principal: boolean
    }[]
  }
}

export default function CartaoImovel({ imovel }: CartaoImovelProps) {
  const imagemPrincipal = imovel.imagens.find((img) => img.principal) || imovel.imagens[0]

  return (
    <Link href={`/imoveis/${imovel.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Imagem */}
        <div className="relative h-56 bg-gray-200 overflow-hidden">
          {imagemPrincipal ? (
            <Image
              src={imagemPrincipal.url}
              alt={imagemPrincipal.alt || imovel.titulo}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Maximize className="w-12 h-12 text-gray-300" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className={cn('text-xs px-2 py-1 rounded-md font-medium backdrop-blur-sm bg-white/80', corStatus(imovel.status))}>
              {traduzirStatus(imovel.status)}
            </span>

            {imovel.destaque && (
              <span className="text-xs px-2 py-1 rounded-md font-medium bg-yellow-400 text-black">
                Destaque
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <span className="text-xs px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm">
              {imovel.tipoTransacao === 'ALUGUEL' ? 'Aluguel' : 'Venda'}
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{imovel.bairro}, {imovel.cidade}</span>
          </div>

          <h3 className="font-semibold text-gray-900 text-lg leading-snug mb-3 line-clamp-2 group-hover:text-primary-700 transition-colors">
            {imovel.titulo}
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 flex-wrap">
            {imovel.quartos > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="w-4 h-4 text-gray-400" />
                {imovel.quartos}
              </span>
            )}

            {imovel.banheiros > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4 text-gray-400" />
                {imovel.banheiros}
              </span>
            )}

            {imovel.vagas > 0 && (
              <span className="flex items-center gap-1">
                <Car className="w-4 h-4 text-gray-400" />
                {imovel.vagas}
              </span>
            )}

            <span className="flex items-center gap-1">
              <Maximize className="w-4 h-4 text-gray-400" />
              {formatarMetragem(imovel.metragem)}
            </span>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100">
            <p className="text-2xl font-bold text-primary-700 tracking-tight">
              {formatarPreco(imovel.preco, imovel.tipoTransacao)}
            </p>

            <span className="text-xs text-gray-400">
              {imovel.tipoTransacao === 'ALUGUEL' ? 'por mês' : 'valor total'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}