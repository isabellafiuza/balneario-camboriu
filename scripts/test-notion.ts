/**
 * Script de teste para validar a integração com Notion
 * Uso: pnpm ts-node scripts/test-notion.ts
 * 
 * Este script testa:
 * 1. Se a API Key está configurada
 * 2. Se consegue conectar à API do Notion
 * 3. Se consegue acessar o banco de dados
 * 4. Quais campos estão disponíveis no banco
 */

import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const NOTION_API_URL = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || 'b83ab1514e4b49e281206d38ea926e05'

async function testarIntegracao() {
  const apiKey = process.env.NOTION_API_KEY

  console.log('🧪 Iniciando teste de integração com Notion...\n')

  // Teste 1: Verificar API Key
  if (!apiKey) {
    console.error('❌ NOTION_API_KEY não está configurada no .env.local')
    process.exit(1)
  }
  console.log('✅ NOTION_API_KEY está configurada')

  // Teste 2: Verificar Database ID
  if (!NOTION_DATABASE_ID) {
    console.error('❌ NOTION_DATABASE_ID não está configurada')
    process.exit(1)
  }
  console.log(`✅ NOTION_DATABASE_ID: ${NOTION_DATABASE_ID}\n`)

  // Teste 3: Conectar à API
  console.log('🔗 Conectando à API do Notion...')
  try {
    const response = await fetch(`${NOTION_API_URL}/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 1 }),
    })

    if (!response.ok) {
      const erro = await response.json()
      console.error('❌ Erro ao conectar à API do Notion:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Mensagem: ${erro.message}`)
      console.error(`   Detalhes:`, erro)
      process.exit(1)
    }

    console.log('✅ Conexão bem-sucedida com a API do Notion\n')

    // Teste 4: Listar campos disponíveis
    const dados = await response.json()
    console.log(`📊 Total de imóveis no banco: ${dados.results.length}`)

    if (dados.results.length > 0) {
      const primeiroImovel = dados.results[0]
      console.log('\n📋 Campos disponíveis no primeiro imóvel:')
      console.log('-------------------------------------------')

      const campos = Object.keys(primeiroImovel.properties)
      campos.forEach((campo) => {
        const propriedade = primeiroImovel.properties[campo]
        console.log(`  • ${campo} (${propriedade.type})`)
      })

      console.log('\n📝 Valores do primeiro imóvel:')
      console.log('-------------------------------------------')
      campos.forEach((campo) => {
        const propriedade = primeiroImovel.properties[campo]
        let valor = ''

        switch (propriedade.type) {
          case 'title':
            valor = propriedade.title?.map((t: any) => t.plain_text).join('') || '(vazio)'
            break
          case 'rich_text':
            valor = propriedade.rich_text?.map((t: any) => t.plain_text).join('') || '(vazio)'
            break
          case 'number':
            valor = String(propriedade.number ?? '(vazio)')
            break
          case 'select':
            valor = propriedade.select?.name || '(vazio)'
            break
          case 'multi_select':
            valor = propriedade.multi_select?.map((s: any) => s.name).join(', ') || '(vazio)'
            break
          case 'checkbox':
            valor = String(propriedade.checkbox ?? false)
            break
          default:
            valor = `(tipo: ${propriedade.type})`
        }

        console.log(`  ${campo}: ${valor}`)
      })
    } else {
      console.log('⚠️  Nenhum imóvel encontrado no banco de dados')
    }

    console.log('\n✅ Teste concluído com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao testar integração:')
    console.error(error)
    process.exit(1)
  }
}

testarIntegracao()
