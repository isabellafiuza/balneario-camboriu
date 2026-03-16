import Link from 'next/link'
import Image from 'next/image'
import { BedDouble, Bath, Car, Maximize, MapPin } from 'lucide-react'
import { formatarPreco, formatarMetragem, traduzirTipo, traduzirStatus, corStatus, cn } from '@/lib/utils'

interface ImagemImovel {
  id: string
  url: string
  alt: string | null
  principal: boolean
}

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
    imagens: ImagemImovel[]
  }
}

export default function CartaoImovel({ imovel }: CartaoImovelProps) {
  const imagemPrincipal = imovel.imagens.find((img) => img.principal) || imovel.imagens[0]

  return (
    <Link href={`/imoveis/${imovel.slug}`} className="group block">
      <div className="card hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        {/* Imagem */}
        <div className="relative h-52 bg-gray-200 overflow-hidden">
          {imagemPrincipal ? (
            <Image
              src={imagemPrincipal.url}
              alt={imagemPrincipal.alt || imovel.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Maximize className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className={cn('badge', corStatus(imovel.status))}>
              {traduzirStatus(imovel.status)}
            </span>
            {imovel.destaque && (
              <span className="badge bg-yellow-100 text-yellow-800">
                Destaque
              </span>
            )}
          </div>

          {/* Tipo de transação */}
          <div className="absolute top-3 right-3">
            <span className="badge bg-primary-600 text-white">
              {imovel.tipoTransacao === 'ALUGUEL' ? 'Aluguel' : 'Venda'}
            </span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-4 flex flex-col flex-1">
          {/* Tipo e localização */}
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
            <span className="font-medium text-primary-600">{traduzirTipo(imovel.tipo)}</span>
            <span>·</span>
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{imovel.bairro}, {imovel.cidade}</span>
          </div>

          {/* Título */}
          <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-700 transition-colors">
            {imovel.titulo}
          </h3>

          {/* Características */}
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 flex-wrap">
            {imovel.quartos > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="w-4 h-4 text-gray-400" />
                {imovel.quartos} {imovel.quartos === 1 ? 'quarto' : 'quartos'}
              </span>
            )}
            {imovel.banheiros > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4 text-gray-400" />
                {imovel.banheiros} {imovel.banheiros === 1 ? 'banheiro' : 'banheiros'}
              </span>
            )}
            {imovel.vagas > 0 && (
              <span className="flex items-center gap-1">
                <Car className="w-4 h-4 text-gray-400" />
                {imovel.vagas} {imovel.vagas === 1 ? 'vaga' : 'vagas'}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Maximize className="w-4 h-4 text-gray-400" />
              {formatarMetragem(imovel.metragem)}
            </span>
          </div>

          {/* Preço */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            <p className="text-xl font-bold text-primary-700">
              {formatarPreco(imovel.preco, imovel.tipoTransacao)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
