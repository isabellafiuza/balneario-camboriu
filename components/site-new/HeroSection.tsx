'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Phone } from 'lucide-react'
import { useState } from 'react'

interface HeroSectionProps {
  whatsapp: string
}

export default function HeroSection({ whatsapp }: HeroSectionProps) {
  const router = useRouter()

  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState('')
  const [tipoTransacao, setTipoTransacao] = useState('')
  const [faixa, setFaixa] = useState('')

  function handleBuscar() {
    const params = new URLSearchParams()

    if (busca.trim()) params.set('busca', busca.trim())
    if (tipo) params.set('tipo', tipo)
    if (tipoTransacao) params.set('tipoTransacao', tipoTransacao)

    if (faixa === 'ate-1mi') {
      params.set('precoMax', '1000000')
    } else if (faixa === '1mi-3mi') {
      params.set('precoMin', '1000000')
      params.set('precoMax', '3000000')
    } else if (faixa === '3mi-5mi') {
      params.set('precoMin', '3000000')
      params.set('precoMax', '5000000')
    } else if (faixa === 'acima-5mi') {
      params.set('precoMin', '5000000')
    }

    router.push(`/imoveis?${params.toString()}`)
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#071816_0%,#0f312c_52%,#8a7131_100%)] text-white">
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative container-page py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_460px] xl:gap-16">
          <div className="max-w-4xl">
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.32em] text-white/70 lg:text-xs">
              Isabella Fiuza • Balneário Camboriú e região
            </p>

            <h1 className="max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
  Imóveis de alto padrão com{' '}
  <span className="text-secondary-400">curadoria e estratégia</span>
</h1>

            <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-white/82 sm:text-lg lg:text-[1.25rem]">
              Em Balneário Camboriú e região, cada escolha merece leitura de mercado,
              clareza no processo e atenção ao imóvel que realmente faz sentido para você.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/imoveis"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 font-semibold text-slate-900 transition hover:bg-secondary-500 hover:text-black"
              >
                <Search className="h-5 w-5" />
                Ver imóveis
              </Link>

              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  'Olá! Quero falar sobre imóveis em Balneário Camboriú e região.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-4 font-semibold text-white backdrop-blur-sm transition hover:border-secondary-400 hover:bg-secondary-500 hover:text-black"
              >
                <Phone className="h-5 w-5" />
                Falar com a Isabella
              </a>
            </div>
          </div>

          <div className="w-full max-w-[460px] justify-self-end rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-premium backdrop-blur-md lg:p-8">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-white/70">
              Busca rápida
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Cidade, bairro ou imóvel"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/90 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400"
              />

              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/90 px-4 py-3 text-slate-900 outline-none"
              >
                <option value="">Tipo de imóvel</option>
                <option value="CASA">Casa</option>
                <option value="APARTAMENTO">Apartamento</option>
                <option value="COBERTURA">Cobertura</option>
                <option value="TERRENO">Terreno</option>
                <option value="COMERCIAL">Comercial</option>
                <option value="STUDIO">Studio</option>
              </select>

              <select
                value={tipoTransacao}
                onChange={(e) => setTipoTransacao(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/90 px-4 py-3 text-slate-900 outline-none"
              >
                <option value="">Finalidade</option>
                <option value="VENDA">Compra</option>
                <option value="ALUGUEL">Aluguel</option>
              </select>

              <select
                value={faixa}
                onChange={(e) => setFaixa(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/90 px-4 py-3 text-slate-900 outline-none"
              >
                <option value="">Faixa de valor</option>
                <option value="ate-1mi">Até R$ 1 mi</option>
                <option value="1mi-3mi">R$ 1 mi a R$ 3 mi</option>
                <option value="3mi-5mi">R$ 3 mi a R$ 5 mi</option>
                <option value="acima-5mi">Acima de R$ 5 mi</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleBuscar}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-secondary-500 px-5 py-4 font-semibold text-slate-950 transition hover:brightness-105"
            >
              Buscar imóveis
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}