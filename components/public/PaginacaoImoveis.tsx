'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginacaoImoveisProps {
  paginaAtual: number
  totalPaginas: number
  searchParams: Record<string, string | undefined>
}

export default function PaginacaoImoveis({
  paginaAtual,
  totalPaginas,
  searchParams,
}: PaginacaoImoveisProps) {
  function gerarUrl(pagina: number) {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([chave, valor]) => {
      if (valor && chave !== 'pagina') params.set(chave, valor)
    })
    params.set('pagina', String(pagina))
    return `/imoveis?${params.toString()}`
  }

  // Gerar array de páginas para exibir
  const paginas: (number | '...')[] = []
  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) paginas.push(i)
  } else {
    paginas.push(1)
    if (paginaAtual > 3) paginas.push('...')
    for (let i = Math.max(2, paginaAtual - 1); i <= Math.min(totalPaginas - 1, paginaAtual + 1); i++) {
      paginas.push(i)
    }
    if (paginaAtual < totalPaginas - 2) paginas.push('...')
    paginas.push(totalPaginas)
  }

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Paginação">
      {/* Anterior */}
      {paginaAtual > 1 ? (
        <Link
          href={gerarUrl(paginaAtual - 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm text-gray-300 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </span>
      )}

      {/* Números de página */}
      {paginas.map((pagina, index) =>
        pagina === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-gray-400">
            ...
          </span>
        ) : (
          <Link
            key={pagina}
            href={gerarUrl(pagina)}
            className={cn(
              'w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-colors',
              pagina === paginaAtual
                ? 'bg-primary-600 text-white font-medium'
                : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'
            )}
          >
            {pagina}
          </Link>
        )
      )}

      {/* Próxima */}
      {paginaAtual < totalPaginas ? (
        <Link
          href={gerarUrl(paginaAtual + 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        >
          Próxima
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm text-gray-300 cursor-not-allowed">
          Próxima
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  )
}
