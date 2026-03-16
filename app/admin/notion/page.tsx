'use client'

import { useState } from 'react'
import { RefreshCw, Eye, Download, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react'

interface ResultadoSync {
  message: string
  resumo: {
    criados: number
    atualizados: number
    erros: number
    total: number
  }
  detalhes: string[]
}

interface PreviewNotion {
  notionId: string
  titulo: string
  tipo: string
  status: string
  preco: number
  bairro: string
  cidade: string
  quartos: number
  metragem: number
}

export default function NotionSyncPage() {
  const [carregando, setCarregando] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)
  const [preview, setPreview] = useState<PreviewNotion[]>([])
  const [resultado, setResultado] = useState<ResultadoSync | null>(null)
  const [erro, setErro] = useState('')

  async function carregarPreview() {
    setCarregando(true)
    setErro('')
    setResultado(null)

    try {
      const res = await fetch('/api/notion')
      const dados = await res.json()

      if (!res.ok) {
        setErro(dados.error || 'Erro ao carregar dados do Notion')
        return
      }

      setPreview(dados.imoveis)
    } catch {
      setErro('Erro de conexão com o Notion')
    } finally {
      setCarregando(false)
    }
  }

  async function sincronizar() {
    setSincronizando(true)
    setErro('')

    try {
      const res = await fetch('/api/notion', { method: 'POST' })
      const dados = await res.json()

      if (!res.ok) {
        setErro(dados.error || 'Erro na sincronização')
        return
      }

      setResultado(dados)
    } catch {
      setErro('Erro de conexão durante a sincronização')
    } finally {
      setSincronizando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sincronização com Notion</h1>
        <p className="text-gray-600 mt-1">
          Importe ou sincronize imóveis da sua base de dados no Notion
        </p>
      </div>

      {/* Instruções de configuração */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Como configurar</h2>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="font-bold text-primary-600 flex-shrink-0">1.</span>
            <span>
              Crie uma integração em{' '}
              <a
                href="https://www.notion.so/my-integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline inline-flex items-center gap-1"
              >
                notion.so/my-integrations
                <ExternalLink className="w-3 h-3" />
              </a>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-primary-600 flex-shrink-0">2.</span>
            <span>Copie o token da integração e adicione ao <code className="bg-gray-100 px-1 rounded">.env.local</code> como <code className="bg-gray-100 px-1 rounded">NOTION_API_KEY</code></span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-primary-600 flex-shrink-0">3.</span>
            <span>Abra seu banco de dados no Notion, clique em <strong>···</strong> → <strong>Adicionar conexões</strong> e adicione sua integração</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-primary-600 flex-shrink-0">4.</span>
            <span>Copie o ID do banco de dados da URL e adicione como <code className="bg-gray-100 px-1 rounded">NOTION_DATABASE_ID</code></span>
          </li>
        </ol>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-600 mb-1">Colunas esperadas no Notion:</p>
          <div className="flex flex-wrap gap-1.5">
            {['Título', 'Descrição', 'Preço', 'Tipo', 'Status', 'Bairro', 'Cidade', 'Estado', 'Quartos', 'Banheiros', 'Vagas', 'Metragem', 'Comodidades', 'Destaque'].map((col) => (
              <span key={col} className="px-2 py-0.5 bg-white border border-gray-200 text-xs text-gray-600 rounded">
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro</p>
            <p className="text-sm mt-0.5">{erro}</p>
          </div>
        </div>
      )}

      {/* Resultado da sincronização */}
      {resultado && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-gray-900">Sincronização Concluída</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{resultado.resumo.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{resultado.resumo.criados}</p>
              <p className="text-xs text-gray-500">Criados</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{resultado.resumo.atualizados}</p>
              <p className="text-xs text-gray-500">Atualizados</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{resultado.resumo.erros}</p>
              <p className="text-xs text-gray-500">Erros</p>
            </div>
          </div>

          {resultado.detalhes.length > 0 && (
            <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3">
              {resultado.detalhes.map((detalhe, i) => (
                <p key={i} className="text-xs text-gray-700 py-0.5">{detalhe}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={carregarPreview}
          disabled={carregando || sincronizando}
          className="btn-secondary"
        >
          {carregando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          Visualizar dados do Notion
        </button>

        <button
          onClick={sincronizar}
          disabled={carregando || sincronizando}
          className="btn-primary"
        >
          {sincronizando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Sincronizar com banco de dados
        </button>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Preview: {preview.length} imóveis encontrados no Notion
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Tipo</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Localização</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {preview.map((item) => (
                  <tr key={item.notionId} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900 truncate max-w-xs">{item.titulo || '—'}</td>
                    <td className="px-4 py-2 text-gray-600 hidden sm:table-cell">{item.tipo || '—'}</td>
                    <td className="px-4 py-2 text-gray-600 hidden md:table-cell">
                      {[item.bairro, item.cidade].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-2">
                      <span className="badge bg-gray-100 text-gray-700">{item.status || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
