/**
 * Script de sincronização com Notion via linha de comando
 * Uso: pnpm notion:sync
 * 
 * Requer as variáveis de ambiente:
 * - NOTION_API_KEY
 * - NOTION_DATABASE_ID
 * - DATABASE_URL
 */

import { PrismaClient, TipoImovel, StatusImovel, TipoTransacao } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

const NOTION_API_URL = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

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
    'Casa': TipoImovel.CASA,
    'Terreno': TipoImovel.TERRENO,
    'Comercial': TipoImovel.COMERCIAL,
    'Cobertura': TipoImovel.COBERTURA,
    'Studio': TipoImovel.STUDIO,
  }
  return mapa[valor] || TipoImovel.APARTAMENTO
}

function mapearStatus(valor: string): StatusImovel {
  const mapa: Record<string, StatusImovel> = {
    'Disponível': StatusImovel.DISPONIVEL,
    'Disponivel': StatusImovel.DISPONIVEL,
    'Vendido': StatusImovel.VENDIDO,
    'Alugado': StatusImovel.ALUGADO,
    'Reservado': StatusImovel.RESERVADO,
  }
  return mapa[valor] || StatusImovel.DISPONIVEL
}

async function sincronizar() {
  const apiKey = process.env.NOTION_API_KEY
  const databaseId = process.env.NOTION_DATABASE_ID

  if (!apiKey || !databaseId) {
    console.error('❌ Configure NOTION_API_KEY e NOTION_DATABASE_ID no .env.local')
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

      const titulo = extrairValor(props['Título'] || props['Title'] || props['Nome'] || props['Name']) || 'Sem título'
      const descricao = extrairValor(props['Descrição'] || props['Descricao'] || props['Description']) || ''
      const preco = parseFloat(String(extrairValor(props['Preço'] || props['Preco'] || props['Price']) || '0'))
      const tipoStr = extrairValor(props['Tipo']) || 'Apartamento'
      const statusStr = extrairValor(props['Status']) || 'Disponível'
      const bairro = extrairValor(props['Bairro']) || ''
      const cidade = extrairValor(props['Cidade']) || ''
      const estado = extrairValor(props['Estado']) || 'SP'
      const quartos = parseInt(String(extrairValor(props['Quartos']) || '0'))
      const banheiros = parseInt(String(extrairValor(props['Banheiros']) || '0'))
      const vagas = parseInt(String(extrairValor(props['Vagas']) || '0'))
      const metragem = parseFloat(String(extrairValor(props['Metragem'] || props['Área'] || props['Area']) || '0'))
      const suites = parseInt(String(extrairValor(props['Suítes'] || props['Suites']) || '0'))
      const comodidades = extrairValor(props['Comodidades']) || []
      const destaque = extrairValor(props['Destaque']) || false

      let slug = slugify(titulo)
      const imovelExistente = await prisma.imovel.findFirst({
        where: { OR: [{ notionId }, { slug }] },
      })

      if (imovelExistente && imovelExistente.notionId === notionId) {
        await prisma.imovel.update({
          where: { id: imovelExistente.id },
          data: {
            titulo, descricao, preco,
            tipo: mapearTipo(tipoStr),
            status: mapearStatus(statusStr),
            bairro, cidade, estado,
            quartos, banheiros, vagas,
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
            notionId, slug, titulo, descricao, preco,
            tipo: mapearTipo(tipoStr),
            status: mapearStatus(statusStr),
            bairro, cidade, estado,
            quartos, banheiros, vagas,
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
