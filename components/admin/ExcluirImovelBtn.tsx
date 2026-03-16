'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

interface ExcluirImovelBtnProps {
  imovelId: string
  titulo: string
}

export default function ExcluirImovelBtn({ imovelId, titulo }: ExcluirImovelBtnProps) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  async function handleExcluir() {
    setExcluindo(true)
    try {
      const res = await fetch(`/api/imoveis/${imovelId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      }
    } catch {
      alert('Erro ao excluir imóvel')
    } finally {
      setExcluindo(false)
      setConfirmando(false)
    }
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleExcluir}
          disabled={excluindo}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
        >
          {excluindo ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          Confirmar
        </button>
        <button
          onClick={() => setConfirmando(false)}
          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirmando(true)}
      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
      title={`Excluir "${titulo}"`}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
