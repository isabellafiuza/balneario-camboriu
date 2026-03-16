'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn, corStatus, traduzirStatus } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface AlterarStatusBtnProps {
  imovelId: string
  statusAtual: string
}

const STATUS_OPTIONS = [
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'VENDIDO', label: 'Vendido' },
  { value: 'ALUGADO', label: 'Alugado' },
]

export default function AlterarStatusBtn({ imovelId, statusAtual }: AlterarStatusBtnProps) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [atualizando, setAtualizando] = useState(false)
  const [statusLocal, setStatusLocal] = useState(statusAtual)

  async function alterarStatus(novoStatus: string) {
    if (novoStatus === statusLocal) {
      setAberto(false)
      return
    }

    setAtualizando(true)
    setAberto(false)

    try {
      const res = await fetch(`/api/imoveis/${imovelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })

      if (res.ok) {
        setStatusLocal(novoStatus)
        router.refresh()
      }
    } catch {
      // Reverter em caso de erro
    } finally {
      setAtualizando(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        disabled={atualizando}
        className={cn(
          'badge cursor-pointer flex items-center gap-1 pr-1',
          corStatus(statusLocal)
        )}
      >
        {traduzirStatus(statusLocal)}
        <ChevronDown className="w-3 h-3" />
      </button>

      {aberto && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setAberto(false)}
          />
          <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 min-w-[130px]">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => alterarStatus(option.value)}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors',
                  option.value === statusLocal ? 'font-medium' : ''
                )}
              >
                <span className={cn('badge', corStatus(option.value))}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
