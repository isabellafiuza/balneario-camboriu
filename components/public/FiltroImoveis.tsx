'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

export default function FiltroImoveis() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [filtros, setFiltros] = useState({
    busca: searchParams.get('busca') || '',
    tipo: searchParams.get('tipo') || '',
    tipoTransacao: searchParams.get('tipoTransacao') || '',
    bairro: searchParams.get('bairro') || '',
    cidade: searchParams.get('cidade') || '',
    precoMin: searchParams.get('precoMin') || '',
    precoMax: searchParams.get('precoMax') || '',
    quartosMin: searchParams.get('quartosMin') || '',
    ordenar: searchParams.get('ordenar') || 'data_desc',
  })

  const aplicarFiltros = useCallback(() => {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([chave, valor]) => {
      if (valor) params.set(chave, valor)
    })
    params.set('pagina', '1')
    router.push(`/imoveis?${params.toString()}`)
  }, [filtros, router])

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      tipo: '',
      tipoTransacao: '',
      bairro: '',
      cidade: '',
      precoMin: '',
      precoMax: '',
      quartosMin: '',
      ordenar: 'data_desc',
    })
    router.push('/imoveis')
  }

  const temFiltrosAtivos = Object.entries(filtros).some(
    ([chave, valor]) => valor && chave !== 'ordenar'
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Busca principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título, bairro, cidade..."
            value={filtros.busca}
            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`btn-secondary py-2.5 px-4 relative ${mostrarFiltros ? 'bg-primary-50 border-primary-300 text-primary-700' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
          {temFiltrosAtivos && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
              !
            </span>
          )}
        </button>
        <button onClick={aplicarFiltros} className="btn-primary py-2.5 px-4">
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>

      {/* Filtros expandidos */}
      {mostrarFiltros && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo de transação */}
            <div>
              <label className="label-field">Tipo</label>
              <select
                value={filtros.tipoTransacao}
                onChange={(e) => setFiltros({ ...filtros, tipoTransacao: e.target.value })}
                className="input-field"
              >
                <option value="">Comprar ou Alugar</option>
                <option value="VENDA">Comprar</option>
                <option value="ALUGUEL">Alugar</option>
              </select>
            </div>

            {/* Tipo de imóvel */}
            <div>
              <label className="label-field">Tipo de Imóvel</label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                className="input-field"
              >
                <option value="">Todos os tipos</option>
                <option value="APARTAMENTO">Apartamento</option>
                <option value="CASA">Casa</option>
                <option value="TERRENO">Terreno</option>
                <option value="COMERCIAL">Comercial</option>
                <option value="COBERTURA">Cobertura</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>

            {/* Bairro */}
            <div>
              <label className="label-field">Bairro</label>
              <input
                type="text"
                placeholder="Ex: Vila Madalena"
                value={filtros.bairro}
                onChange={(e) => setFiltros({ ...filtros, bairro: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Cidade */}
            <div>
              <label className="label-field">Cidade</label>
              <input
                type="text"
                placeholder="Ex: São Paulo"
                value={filtros.cidade}
                onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Preço mínimo */}
            <div>
              <label className="label-field">Preço Mínimo (R$)</label>
              <input
                type="number"
                placeholder="Ex: 200000"
                value={filtros.precoMin}
                onChange={(e) => setFiltros({ ...filtros, precoMin: e.target.value })}
                className="input-field"
                min="0"
              />
            </div>

            {/* Preço máximo */}
            <div>
              <label className="label-field">Preço Máximo (R$)</label>
              <input
                type="number"
                placeholder="Ex: 1000000"
                value={filtros.precoMax}
                onChange={(e) => setFiltros({ ...filtros, precoMax: e.target.value })}
                className="input-field"
                min="0"
              />
            </div>

            {/* Quartos mínimos */}
            <div>
              <label className="label-field">Quartos (mínimo)</label>
              <select
                value={filtros.quartosMin}
                onChange={(e) => setFiltros({ ...filtros, quartosMin: e.target.value })}
                className="input-field"
              >
                <option value="">Qualquer</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            {/* Ordenar */}
            <div>
              <label className="label-field">Ordenar por</label>
              <select
                value={filtros.ordenar}
                onChange={(e) => setFiltros({ ...filtros, ordenar: e.target.value })}
                className="input-field"
              >
                <option value="data_desc">Mais recentes</option>
                <option value="data_asc">Mais antigos</option>
                <option value="preco_asc">Menor preço</option>
                <option value="preco_desc">Maior preço</option>
              </select>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 mt-4 justify-end">
            {temFiltrosAtivos && (
              <button
                onClick={limparFiltros}
                className="btn-secondary py-2 px-4 text-sm"
              >
                <X className="w-4 h-4" />
                Limpar filtros
              </button>
            )}
            <button onClick={aplicarFiltros} className="btn-primary py-2 px-4 text-sm">
              <Search className="w-4 h-4" />
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
