import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { gerarSlug } from '@/lib/utils'
import { TipoImovel, StatusImovel, TipoTransacao } from '@prisma/client'

const NOTION_API_URL = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

// Mapeia valores do Notion para enums do sistema
function mapearTipo(valor: string): TipoImovel {
  const mapa: Record<string, TipoImovel> = {
    'Apartamento': TipoImovel.APARTAMENTO,
    'apartamento': TipoImovel.APARTAMENTO,
    'Casa': TipoImovel.CASA,
    'casa': TipoImovel.CASA,
    'Terreno': TipoImovel.TERRENO,
    'terreno': TipoImovel.TERRENO,
    'Comercial': TipoImovel.COMERCIAL,
    'comercial': TipoImovel.COMERCIAL,
    'Cobertura': TipoImovel.COBERTURA,
    'cobertura': TipoImovel.COBERTURA,
    'Studio': TipoImovel.STUDIO,
    'studio': TipoImovel.STUDIO,
  }
  return mapa[valor] || TipoImovel.APARTAMENTO
}

function mapearStatus(valor: string): StatusImovel {
  const mapa: Record<string, StatusImovel> = {
    'Disponível': StatusImovel.DISPONIVEL,
    'Disponivel': StatusImovel.DISPONIVEL,
    'disponivel': StatusImovel.DISPONIVEL,
    'Vendido': StatusImovel.VENDIDO,
    'vendido': StatusImovel.VENDIDO,
    'Alugado': StatusImovel.ALUGADO,
    'alugado': StatusImovel.ALUGADO,
    'Reservado': StatusImovel.RESERVADO,
    'reservado': StatusImovel.RESERVADO,
  }
  return mapa[valor] || StatusImovel.DISPONIVEL
}

function mapearTransacao(valor: string): TipoTransacao {
  const mapa: Record<string, TipoTransacao> = {
    'Venda': TipoTransacao.VENDA,
    'venda': TipoTransacao.VENDA,
    'Aluguel': TipoTransacao.ALUGUEL,
    'aluguel': TipoTransacao.ALUGUEL,
    'Venda ou Aluguel': TipoTransacao.VENDA_ALUGUEL,
  }
  return mapa[valor] || TipoTransacao.VENDA
}

// Extrai valor de uma propriedade do Notion
function extrairValor(propriedade: any): any {
  if (!propriedade) return null

  switch (propriedade.type) {
    case 'title':
      return propriedade.title?.map((t: any) => t.plain_text).join('') || ''
    case 'rich_text':
      return propriedade.rich_text?.map((t: any) => t.plain_text).join('') || ''
    case 'number':
      return propriedade.number ?? 0
    case 'select':
      return propriedade.select?.name || ''
    case 'multi_select':
      return propriedade.multi_select?.map((s: any) => s.name) || []
    case 'checkbox':
      return propriedade.checkbox ?? false
    case 'url':
      return propriedade.url || ''
    case 'email':
      return propriedade.email || ''
    case 'phone_number':
      return propriedade.phone_number || ''
    case 'date':
      return propriedade.date?.start || null
    case 'files':
      return propriedade.files?.map((f: any) => f.file?.url || f.external?.url).filter(Boolean) || []
    default:
      return null
  }
}

// GET /api/notion - Listar imóveis do Notion (preview)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const apiKey = process.env.NOTION_API_KEY
    const databaseId = process.env.NOTION_DATABASE_ID

    if (!apiKey || !databaseId) {
      return NextResponse.json(
        { error: 'Integração com Notion não configurada. Defina NOTION_API_KEY e NOTION_DATABASE_ID.' },
        { status: 400 }
      )
    }

    const response = await fetch(`${NOTION_API_URL}/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100 }),
    })

    if (!response.ok) {
      const erro = await response.json()
      return NextResponse.json(
        { error: 'Erro ao consultar Notion', detalhes: erro },
        { status: response.status }
      )
    }

    const dados = await response.json()

    // Mapear resultados para preview
    const imoveis = dados.results.map((pagina: any) => {
      const props = pagina.properties
      return {
        notionId: pagina.id,
        titulo: extrairValor(props['Título'] || props['Title'] || props['Nome'] || props['Name']),
        tipo: extrairValor(props['Tipo']),
        status: extrairValor(props['Status']),
        preco: extrairValor(props['Preço'] || props['Preco'] || props['Price']),
        bairro: extrairValor(props['Bairro']),
        cidade: extrairValor(props['Cidade']),
        quartos: extrairValor(props['Quartos']),
        metragem: extrairValor(props['Metragem'] || props['Área'] || props['Area']),
      }
    })

    return NextResponse.json({ imoveis, total: dados.results.length })
  } catch (error) {
    console.error('Erro ao consultar Notion:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/notion - Sincronizar imóveis do Notion para o banco
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const apiKey = process.env.NOTION_API_KEY
    const databaseId = process.env.NOTION_DATABASE_ID

    if (!apiKey || !databaseId) {
      return NextResponse.json(
        { error: 'Integração com Notion não configurada.' },
        { status: 400 }
      )
    }

    const response = await fetch(`${NOTION_API_URL}/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100 }),
    })

    if (!response.ok) {
      const erro = await response.json()
      return NextResponse.json(
        { error: 'Erro ao consultar Notion', detalhes: erro },
        { status: response.status }
      )
    }

    const dados = await response.json()

    let criados = 0
    let atualizados = 0
    let erros = 0
    const detalhes: string[] = []

    for (const pagina of dados.results) {
      try {
        const props = pagina.properties
        const notionId = pagina.id

        const titulo = extrairValor(props['Título'] || props['Title'] || props['Nome'] || props['Name'] || props['Codigo']) || 'Sem título'
        const descricao = extrairValor(props['Descrição'] || props['Descricao'] || props['Description']) || ''
        const preco = parseFloat(extrairValor(props['Preço'] || props['Preco'] || props['Price']) || '0')
        const tipoStr = extrairValor(props['Tipo']) || 'Apartamento'
        const statusStr = extrairValor(props['Status']) || 'Disponível'
        const transacaoStr = extrairValor(props['Transação'] || props['Transacao'] || props['Tipo de Transação']) || 'Venda'
        const bairro = extrairValor(props['Bairro']) || ''
        const cidade = extrairValor(props['Cidade']) || ''
        const estado = extrairValor(props['Estado']) || 'SP'
        const quartos = parseInt(extrairValor(props['Quartos'] || props['Dormitórios'] || props['Dormitorios']) || '0')
        const banheiros = parseInt(extrairValor(props['Banheiros']) || '0')
        const vagas = parseInt(extrairValor(props['Vagas']) || '0')
        const metragem = parseFloat(
  extrairValor(
    props['Metragem'] ||
    props['Área'] ||
    props['Area'] ||
    props['Area Total'] ||
    props['Área Total'] ||
    props['Area Privativa'] ||
    props['Área Privativa']
  ) || '0'
)
        const suites = parseInt(extrairValor(props['Suítes'] || props['Suites']) || '0')
        const comodidades = extrairValor(props['Comodidades']) || []
        const destaque = extrairValor(props['Destaque']) || false

        // Gerar slug único
        let slug = gerarSlug(titulo)
        const imovelExistente = await prisma.imovel.findFirst({
          where: { OR: [{ notionId }, { slug }] },
        })

        if (imovelExistente && imovelExistente.notionId === notionId) {
          // Atualizar
          await prisma.imovel.update({
            where: { id: imovelExistente.id },
            data: {
              titulo,
              descricao,
              preco,
              tipo: mapearTipo(tipoStr),
              tipoTransacao: mapearTransacao(transacaoStr),
              status: mapearStatus(statusStr),
              bairro,
              cidade,
              estado,
              quartos,
              banheiros,
              vagas,
              metragem: metragem || 0,
              suites,
              comodidades: Array.isArray(comodidades) ? comodidades : [],
              destaque,
            },
          })
          atualizados++
          detalhes.push(`✅ Atualizado: ${titulo}`)
        } else {
          // Verificar slug duplicado
          if (imovelExistente) {
            slug = `${slug}-${Date.now()}`
          }

          // Criar novo
          await prisma.imovel.create({
            data: {
              notionId,
              slug,
              titulo,
              descricao,
              preco,
              tipo: mapearTipo(tipoStr),
              tipoTransacao: mapearTransacao(transacaoStr),
              status: mapearStatus(statusStr),
              bairro,
              cidade,
              estado,
              quartos,
              banheiros,
              vagas,
              metragem: metragem || 0,
              suites,
              comodidades: Array.isArray(comodidades) ? comodidades : [],
              destaque,
            },
          })
          criados++
          detalhes.push(`🆕 Criado: ${titulo}`)
        }
      } catch (err: any) {
        erros++
        detalhes.push(`❌ Erro: ${err.message}`)
      }
    }

    return NextResponse.json({
      message: 'Sincronização concluída',
      resumo: { criados, atualizados, erros, total: dados.results.length },
      detalhes,
    })
  } catch (error) {
    console.error('Erro na sincronização com Notion:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
