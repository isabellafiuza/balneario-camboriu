/**
 * Script de sincronização com Notion via linha de comando
 * Uso: pnpm notion:sync
 * 
 * Requer as variáveis de ambiente:
 * - NOTION_API_KEY
 * - DATABASE_URL
 * 
 * O ID do banco de dados está hardcoded como padrão:
 * - b83ab1514e4b49e281206d38ea926e05
 */

import { PrismaClient, TipoImovel, StatusImovel, TipoTransacao } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

const NOTION_API_URL = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'
// ID correto do banco de dados do Notion
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || 'b83ab1514e4b49e281206d38ea926e05'

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

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
    default:
      return null
  }
}

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

async function sincronizar() {
  const apiKey = process.env.NOTION_API_KEY
  const databaseId = NOTION_DATABASE_ID

  if (!apiKey) {
    console.error('❌ Configure NOTION_API_KEY no .env.local')
    process.exit(1)
  }

  if (!databaseId) {
    console.error('❌ Configure NOTION_DATABASE_ID no .env.local ou use o padrão')
    process.exit(1)
  }

  console.log('🔄 Iniciando sincronização com Notion...')
  console.log(`📊 Database ID: ${databaseId}`)

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
    console.error('❌ Erro ao consultar Notion:', erro)
    console.error('   Status:', response.status)
    console.error('   Detalhes:', JSON.stringify(erro, null, 2))
    process.exit(1)
  }

  const dados = await response.json()
  console.log(`📋 ${dados.results.length} imóveis encontrados no Notion\n`)

  let criados = 0
  let atualizados = 0
  let erros = 0

  for (const pagina of dados.results) {
    try {
      const props = pagina.properties
      const notionId = pagina.id

      // Mapeamento correto dos campos do Notion
      const titulo = extrairValor(props['Codigo'] || props['Título'] || props['Title'] || props['Nome'] || props['Name']) || 'Sem título'
      const descricao = extrairValor(props['Descrição'] || props['Descricao'] || props['Description']) || ''
      const preco = parseFloat(String(extrairValor(props['Valor'] || props['Preço'] || props['Preco'] || props['Price']) || '0'))
      const tipoStr = extrairValor(props['Tipo']) || 'Apartamento'
      const statusStr = extrairValor(props['Status']) || 'Disponível'
      const transacaoStr = extrairValor(props['Transação'] || props['Transacao'] || props['Tipo de Transação']) || 'Venda'
      const bairro = extrairValor(props['Bairro']) || ''
      const cidade = extrairValor(props['Cidade']) || ''
      const estado = extrairValor(props['Estado']) || 'SC'
      const quartos = parseInt(String(extrairValor(props['Dormitórios'] || props['Dormitorios'] || props['Quartos']) || '0'))
      const banheiros = parseInt(String(extrairValor(props['Banheiros']) || '0'))
      const vagas = parseInt(String(extrairValor(props['Vagas']) || '0'))
      const suites = parseInt(String(extrairValor(props['Suítes'] || props['Suites']) || '0'))
      
      // Metragem: tentar Area Privativa primeiro, depois Area Total
      const metragem = parseFloat(
        String(
          extrairValor(props['Area Privativa'] || props['Área Privativa']) ||
          extrairValor(props['Area Total'] || props['Área Total']) ||
          extrairValor(props['Metragem'] || props['Área'] || props['Area']) ||
          '0'
        )
      )

      const comodidades = extrairValor(props['Diferenciais'] || props['Comodidades']) || []
      const destaque = extrairValor(props['Destaque']) || false

      let slug = slugify(titulo)
      const imovelExistente = await prisma.imovel.findFirst({
        where: { OR: [{ notionId }, { slug }] },
      })

      if (imovelExistente && imovelExistente.notionId === notionId) {
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
        console.log(`  ✅ Atualizado: ${titulo}`)
      } else {
        if (imovelExistente) slug = `${slug}-${Date.now()}`
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
        console.log(`  🆕 Criado: ${titulo}`)
      }
    } catch (err: any) {
      erros++
      console.error(`  ❌ Erro: ${err.message}`)
    }
  }

  console.log('\n📊 Resumo da sincronização:')
  console.log(`  🆕 Criados: ${criados}`)
  console.log(`  ✅ Atualizados: ${atualizados}`)
  console.log(`  ❌ Erros: ${erros}`)
  console.log(`  📋 Total processado: ${dados.results.length}`)
}

sincronizar()
  .catch((e) => {
    console.error('❌ Erro fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
