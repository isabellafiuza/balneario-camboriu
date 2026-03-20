'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Upload, X, Image as ImageIcon, Star } from 'lucide-react'
import Image from 'next/image'

interface ImagemImovel {
  id: string
  url: string
  alt: string | null
  principal: boolean
  ordem: number
}

interface ImovelData {
  id?: string
  titulo?: string
  descricao?: string
  preco?: number
  condominio?: number | null
  iptu?: number | null
  tipo?: string
  tipoTransacao?: string
  status?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  endereco?: string
  numero?: string
  complemento?: string
  quartos?: number
  banheiros?: number
  vagas?: number
  metragem?: number
  metragemTerreno?: number | null
  suites?: number
  comodidades?: string[]
  metaTitle?: string
  metaDescription?: string
  destaque?: boolean
  imagens?: ImagemImovel[]
}

interface FormularioImovelProps {
  imovel?: ImovelData
  modo: 'criar' | 'editar'
}

const COMODIDADES_PADRAO = [
  'Piscina',
  'Academia',
  'Portaria 24h',
  'Salão de Festas',
  'Churrasqueira',
  'Área Gourmet',
  'Playground',
  'Segurança 24h',
  'Jardim',
  'Bicicletário',
  'Elevador',
  'Gerador',
  'Câmeras de Segurança',
  'Interfone',
  'Varanda',
  'Ar Condicionado',
  'Aquecimento Solar',
  'Cozinha Americana',
]

type CampoNumerico =
  | 'quartos'
  | 'suites'
  | 'banheiros'
  | 'vagas'
  | 'metragem'
  | 'metragemTerreno'
  | 'preco'
  | 'condominio'
  | 'iptu'

export default function FormularioImovel({ imovel, modo }: FormularioImovelProps) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [imagens, setImagens] = useState<ImagemImovel[]>(imovel?.imagens || [])
  const [uploadando, setUploadando] = useState(false)
  const [novaComodidade, setNovaComodidade] = useState('')

  const [form, setForm] = useState({
    titulo: imovel?.titulo || '',
    descricao: imovel?.descricao || '',
    preco: imovel?.preco?.toString() || '',
    condominio: imovel?.condominio?.toString() || '',
    iptu: imovel?.iptu?.toString() || '',
    tipo: imovel?.tipo || 'APARTAMENTO',
    tipoTransacao: imovel?.tipoTransacao || 'VENDA',
    status: imovel?.status || 'DISPONIVEL',
    bairro: imovel?.bairro || '',
    cidade: imovel?.cidade || '',
    estado: imovel?.estado || 'SP',
    cep: imovel?.cep || '',
    endereco: imovel?.endereco || '',
    numero: imovel?.numero || '',
    complemento: imovel?.complemento || '',
    quartos: imovel?.quartos?.toString() || '0',
    banheiros: imovel?.banheiros?.toString() || '0',
    vagas: imovel?.vagas?.toString() || '0',
    metragem: imovel?.metragem?.toString() || '',
    metragemTerreno: imovel?.metragemTerreno?.toString() || '',
    suites: imovel?.suites?.toString() || '0',
    comodidades: imovel?.comodidades || [],
    metaTitle: imovel?.metaTitle || '',
    metaDescription: imovel?.metaDescription || '',
    destaque: imovel?.destaque || false,
  })

  function atualizarCampo<K extends keyof typeof form>(campo: K, valor: (typeof form)[K]) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  function atualizarCampoNumerico(campo: CampoNumerico, valor: string) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  function toggleComodidade(item: string) {
    setForm((prev) => ({
      ...prev,
      comodidades: prev.comodidades.includes(item)
        ? prev.comodidades.filter((c) => c !== item)
        : [...prev.comodidades, item],
    }))
  }

  function adicionarComodidade() {
    if (novaComodidade.trim() && !form.comodidades.includes(novaComodidade.trim())) {
      setForm((prev) => ({
        ...prev,
        comodidades: [...prev.comodidades, novaComodidade.trim()],
      }))
      setNovaComodidade('')
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = e.target.files
    if (!arquivos || !imovel?.id) return

    setUploadando(true)
    setErro('')

    for (const arquivo of Array.from(arquivos)) {
      const formData = new FormData()
      formData.append('arquivo', arquivo)
      formData.append('imovelId', imovel.id)

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (res.ok) {
          const novaImagem = await res.json()
          setImagens((prev) => [...prev, novaImagem])
        } else {
          const err = await res.json()
          setErro(err.error || 'Erro no upload')
        }
      } catch {
        setErro('Erro ao fazer upload da imagem')
      }
    }

    setUploadando(false)
    e.target.value = ''
  }

  async function removerImagem(imagemId: string) {
    try {
      const res = await fetch(`/api/upload?imagemId=${imagemId}`, { method: 'DELETE' })
      if (res.ok) {
        setImagens((prev) => prev.filter((img) => img.id !== imagemId))
      }
    } catch {
      setErro('Erro ao remover imagem')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    setSucesso('')

    const dados = {
      titulo: form.titulo,
      descricao: form.descricao,
      preco: parseFloat(form.preco),
      condominio: form.condominio ? parseFloat(form.condominio) : undefined,
      iptu: form.iptu ? parseFloat(form.iptu) : undefined,
      tipo: form.tipo,
      tipoTransacao: form.tipoTransacao,
      status: form.status,
      bairro: form.bairro,
      cidade: form.cidade,
      estado: form.estado,
      cep: form.cep || undefined,
      endereco: form.endereco || undefined,
      numero: form.numero || undefined,
      complemento: form.complemento || undefined,
      quartos: parseInt(form.quartos),
      banheiros: parseInt(form.banheiros),
      vagas: parseInt(form.vagas),
      metragem: parseFloat(form.metragem),
      metragemTerreno: form.metragemTerreno ? parseFloat(form.metragemTerreno) : undefined,
      suites: parseInt(form.suites),
      comodidades: form.comodidades,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      destaque: form.destaque,
    }

    try {
      const url = modo === 'criar' ? '/api/imoveis' : `/api/imoveis/${imovel?.id}`
      const method = modo === 'criar' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })

      if (res.ok) {
        const resultado = await res.json()
        setSucesso(modo === 'criar' ? 'Imóvel criado com sucesso!' : 'Imóvel atualizado com sucesso!')

        if (modo === 'criar') {
          setTimeout(() => {
            router.push(`/admin/imoveis/${resultado.id}/editar`)
          }, 1000)
        }
      } else {
        const err = await res.json()
        setErro(err.error || 'Erro ao salvar imóvel')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {sucesso}
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Informações Básicas</h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label-field">Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => atualizarCampo('titulo', e.target.value)}
              placeholder="Ex: Apartamento 3 Quartos - Vila Madalena"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-field">Descrição *</label>
            <textarea
              value={form.descricao}
              onChange={(e) => atualizarCampo('descricao', e.target.value)}
              placeholder="Descreva o imóvel em detalhes..."
              className="input-field min-h-[120px] resize-y"
              required
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Tipo de Imóvel *</label>
              <select
                value={form.tipo}
                onChange={(e) => atualizarCampo('tipo', e.target.value)}
                className="input-field"
                required
              >
                <option value="APARTAMENTO">Apartamento</option>
                <option value="CASA">Casa</option>
                <option value="TERRENO">Terreno</option>
                <option value="COMERCIAL">Comercial</option>
                <option value="COBERTURA">Cobertura</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>

            <div>
              <label className="label-field">Tipo de Transação *</label>
              <select
                value={form.tipoTransacao}
                onChange={(e) => atualizarCampo('tipoTransacao', e.target.value)}
                className="input-field"
                required
              >
                <option value="VENDA">Venda</option>
                <option value="ALUGUEL">Aluguel</option>
                <option value="VENDA_ALUGUEL">Venda ou Aluguel</option>
              </select>
            </div>

            <div>
              <label className="label-field">Status *</label>
              <select
                value={form.status}
                onChange={(e) => atualizarCampo('status', e.target.value)}
                className="input-field"
                required
              >
                <option value="DISPONIVEL">Disponível</option>
                <option value="RESERVADO">Reservado</option>
                <option value="VENDIDO">Vendido</option>
                <option value="ALUGADO">Alugado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Preço (R$) *</label>
              <input
                type="number"
                value={form.preco}
                onChange={(e) => atualizarCampoNumerico('preco', e.target.value)}
                placeholder="Ex: 850000"
                className="input-field"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="label-field">Condomínio (R$)</label>
              <input
                type="number"
                value={form.condominio}
                onChange={(e) => atualizarCampoNumerico('condominio', e.target.value)}
                placeholder="Ex: 950"
                className="input-field"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="label-field">IPTU (R$)</label>
              <input
                type="number"
                value={form.iptu}
                onChange={(e) => atualizarCampoNumerico('iptu', e.target.value)}
                placeholder="Ex: 320"
                className="input-field"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="destaque"
              checked={form.destaque}
              onChange={(e) => atualizarCampo('destaque', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label
              htmlFor="destaque"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 cursor-pointer"
            >
              <Star className="w-4 h-4 text-yellow-500" />
              Marcar como destaque
            </label>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Localização</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Bairro *</label>
            <input
              type="text"
              value={form.bairro}
              onChange={(e) => atualizarCampo('bairro', e.target.value)}
              placeholder="Ex: Vila Madalena"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-field">Cidade *</label>
            <input
              type="text"
              value={form.cidade}
              onChange={(e) => atualizarCampo('cidade', e.target.value)}
              placeholder="Ex: São Paulo"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-field">Estado</label>
            <input
              type="text"
              value={form.estado}
              onChange={(e) => atualizarCampo('estado', e.target.value.toUpperCase().slice(0, 2))}
              placeholder="SP"
              className="input-field"
              maxLength={2}
            />
          </div>

          <div>
            <label className="label-field">CEP</label>
            <input
              type="text"
              value={form.cep}
              onChange={(e) => atualizarCampo('cep', e.target.value)}
              placeholder="00000-000"
              className="input-field"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label-field">Endereço</label>
            <input
              type="text"
              value={form.endereco}
              onChange={(e) => atualizarCampo('endereco', e.target.value)}
              placeholder="Rua, Avenida..."
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">Número</label>
            <input
              type="text"
              value={form.numero}
              onChange={(e) => atualizarCampo('numero', e.target.value)}
              placeholder="123"
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">Complemento</label>
            <input
              type="text"
              value={form.complemento}
              onChange={(e) => atualizarCampo('complemento', e.target.value)}
              placeholder="Apto 42, Bloco B..."
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Características</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Quartos', key: 'quartos' as const },
            { label: 'Suítes', key: 'suites' as const },
            { label: 'Banheiros', key: 'banheiros' as const },
            { label: 'Vagas', key: 'vagas' as const },
          ].map((campo) => (
            <div key={campo.key}>
              <label className="label-field">{campo.label}</label>
              <input
                type="number"
                value={form[campo.key]}
                onChange={(e) => atualizarCampoNumerico(campo.key, e.target.value)}
                className="input-field"
                min="0"
              />
            </div>
          ))}

          <div>
            <label className="label-field">Metragem (m²) *</label>
            <input
              type="number"
              value={form.metragem}
              onChange={(e) => atualizarCampoNumerico('metragem', e.target.value)}
              placeholder="95"
              className="input-field"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="label-field">Terreno (m²)</label>
            <input
              type="number"
              value={form.metragemTerreno}
              onChange={(e) => atualizarCampoNumerico('metragemTerreno', e.target.value)}
              placeholder="200"
              className="input-field"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Comodidades</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {COMODIDADES_PADRAO.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleComodidade(item)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                form.comodidades.includes(item)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={novaComodidade}
            onChange={(e) => setNovaComodidade(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarComodidade())}
            placeholder="Adicionar comodidade personalizada..."
            className="input-field flex-1"
          />
          <button
            type="button"
            onClick={adicionarComodidade}
            className="btn-secondary py-2 px-4"
          >
            Adicionar
          </button>
        </div>

        {form.comodidades.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {form.comodidades.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
              >
                {item}
                <button
                  type="button"
                  onClick={() => toggleComodidade(item)}
                  className="hover:text-primary-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {modo === 'editar' && imovel?.id && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Imagens</h2>

          <div className="mb-4">
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Clique para adicionar imagens</p>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG, PNG ou WebP · Máximo 10MB por arquivo
                </p>

                {uploadando && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-primary-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Enviando...</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleUpload}
                className="hidden"
                disabled={uploadando}
              />
            </label>
          </div>

          {imagens.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {imagens.map((imagem) => (
                <div key={imagem.id} className="relative group">
                  <div className="relative h-28 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={imagem.url}
                      alt={imagem.alt || 'Imagem do imóvel'}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    {imagem.principal && (
                      <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded font-medium">
                        Principal
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removerImagem(imagem.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover imagem"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <ImageIcon className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">Nenhuma imagem adicionada</p>
            </div>
          )}
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-1">SEO (opcional)</h2>
        <p className="text-sm text-gray-500 mb-4">
          Personalize como o imóvel aparece nos buscadores
        </p>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label-field">Meta Título (máx. 60 caracteres)</label>
            <input
              type="text"
              value={form.metaTitle}
              onChange={(e) => atualizarCampo('metaTitle', e.target.value)}
              placeholder="Deixe em branco para usar o título do imóvel"
              className="input-field"
              maxLength={60}
            />
            <p className="text-xs text-gray-400 mt-1">{form.metaTitle.length}/60</p>
          </div>

          <div>
            <label className="label-field">Meta Descrição (máx. 160 caracteres)</label>
            <textarea
              value={form.metaDescription}
              onChange={(e) => atualizarCampo('metaDescription', e.target.value)}
              placeholder="Descrição para os buscadores..."
              className="input-field"
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-gray-400 mt-1">{form.metaDescription.length}/160</p>
          </div>
        </div>
      </div>

      {modo === 'criar' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <strong>Dica:</strong> Após criar o imóvel, você será redirecionado para a página de
          edição onde poderá adicionar as imagens.
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
          disabled={carregando}
        >
          Cancelar
        </button>

        <button type="submit" disabled={carregando} className="btn-primary">
          {carregando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {modo === 'criar' ? 'Criar Imóvel' : 'Salvar Alterações'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}