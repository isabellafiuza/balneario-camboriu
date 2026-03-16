'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Maximize, ZoomIn } from 'lucide-react'

interface Imagem {
  id: string
  url: string
  alt: string | null
}

interface GaleriaImagensProps {
  imagens: Imagem[]
  titulo: string
}

export default function GaleriaImagens({ imagens, titulo }: GaleriaImagensProps) {
  const [indiceAtivo, setIndiceAtivo] = useState(0)
  const [lightboxAberto, setLightboxAberto] = useState(false)

  if (imagens.length === 0) {
    return (
      <div className="relative h-72 sm:h-96 bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Maximize className="w-16 h-16 mx-auto mb-2" />
          <p>Sem imagens disponíveis</p>
        </div>
      </div>
    )
  }

  const irParaAnterior = () => {
    setIndiceAtivo((prev) => (prev === 0 ? imagens.length - 1 : prev - 1))
  }

  const irParaProxima = () => {
    setIndiceAtivo((prev) => (prev === imagens.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      {/* Imagem principal */}
      <div className="relative h-72 sm:h-96 lg:h-[480px] bg-gray-100 rounded-xl overflow-hidden group">
        <Image
          src={imagens[indiceAtivo].url}
          alt={imagens[indiceAtivo].alt || titulo}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
          priority
        />

        {/* Botão zoom */}
        <button
          onClick={() => setLightboxAberto(true)}
          className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Ampliar imagem"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {/* Navegação */}
        {imagens.length > 1 && (
          <>
            <button
              onClick={irParaAnterior}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={irParaProxima}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Contador */}
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {indiceAtivo + 1} / {imagens.length}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {imagens.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {imagens.map((imagem, index) => (
            <button
              key={imagem.id}
              onClick={() => setIndiceAtivo(index)}
              className={`relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                index === indiceAtivo
                  ? 'border-primary-500 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={imagem.url}
                alt={imagem.alt || `${titulo} - foto ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxAberto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxAberto(false)}
        >
          <button
            onClick={() => setLightboxAberto(false)}
            className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative w-full max-w-5xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[80vh]">
              <Image
                src={imagens[indiceAtivo].url}
                alt={imagens[indiceAtivo].alt || titulo}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </div>

          {imagens.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); irParaAnterior() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); irParaProxima() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-1.5 rounded-full">
                {indiceAtivo + 1} / {imagens.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
