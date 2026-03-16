import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import FormularioImovel from '@/components/admin/FormularioImovel'

export default function NovoImovelPage() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Link href="/admin/imoveis" className="btn-secondary py-2 px-3">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Imóvel</h1>
          <p className="text-gray-600 mt-0.5">Preencha os dados para cadastrar um novo imóvel</p>
        </div>
      </div>

      <FormularioImovel modo="criar" />
    </div>
  )
}
