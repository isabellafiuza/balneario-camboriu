import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { imovelSchema } from '@/lib/validations'
import { gerarSlug } from '@/lib/utils'

// GET /api/imoveis - Listar imóveis com filtros e paginação
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const pagina = parseInt(searchParams.get('pagina') || '1')
    const porPagina = Math.min(parseInt(searchParams.get('porPagina') || '12'), 50)
    const bairro = searchParams.get('bairro')
    const cidade = searchParams.get('cidade')
    const tipo = searchParams.get('tipo')
    const tipoTransacao = searchParams.get('tipoTransacao')
    const precoMin = searchParams.get('precoMin') ? parseFloat(searchParams.get('precoMin')!) : undefined
    const precoMax = searchParams.get('precoMax') ? parseFloat(searchParams.get('precoMax')!) : undefined
    const quartosMin = searchParams.get('quartosMin') ? parseInt(searchParams.get('quartosMin')!) : undefined
    const status = searchParams.get('status') || 'DISPONIVEL'
    const ordenar = searchParams.get('ordenar') || 'data_desc'
    const destaque = searchParams.get('destaque') === 'true' ? true : undefined
    const busca = searchParams.get('busca')

    // Construir filtro
    const where: any = {}

    if (status && status !== 'TODOS') {
      where.status = status
    }
    if (bairro) {
      where.bairro = { contains: bairro, mode: 'insensitive' }
    }
    if (cidade) {
      where.cidade = { contains: cidade, mode: 'insensitive' }
    }
    if (tipo) {
      where.tipo = tipo
    }
    if (tipoTransacao) {
      where.tipoTransacao = tipoTransacao
    }
    if (precoMin !== undefined || precoMax !== undefined) {
      where.preco = {}
      if (precoMin !== undefined) where.preco.gte = precoMin
      if (precoMax !== undefined) where.preco.lte = precoMax
    }
    if (quartosMin !== undefined) {
      where.quartos = { gte: quartosMin }
    }
    if (destaque !== undefined) {
      where.destaque = destaque
    }
    if (busca) {
      where.OR = [
        { titulo: { contains: busca, mode: 'insensitive' } },
        { descricao: { contains: busca, mode: 'insensitive' } },
        { bairro: { contains: busca, mode: 'insensitive' } },
        { cidade: { contains: busca, mode: 'insensitive' } },
      ]
    }

    // Ordenação
    let orderBy: any = { createdAt: 'desc' }
    if (ordenar === 'preco_asc') orderBy = { preco: 'asc' }
    else if (ordenar === 'preco_desc') orderBy = { preco: 'desc' }
    else if (ordenar === 'data_asc') orderBy = { createdAt: 'asc' }

    const skip = (pagina - 1) * porPagina

    const [imoveis, total] = await Promise.all([
      prisma.imovel.findMany({
        where,
        orderBy,
        skip,
        take: porPagina,
        include: {
          imagens: {
            orderBy: { ordem: 'asc' },
            take: 1,
          },
        },
      }),
      prisma.imovel.count({ where }),
    ])

    return NextResponse.json({
      imoveis,
      paginacao: {
        total,
        pagina,
        porPagina,
        totalPaginas: Math.ceil(total / porPagina),
      },
    })
  } catch (error) {
    console.error('Erro ao listar imóveis:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/imoveis - Criar novo imóvel (requer autenticação)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validacao = imovelSchema.safeParse(body)

    if (!validacao.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', detalhes: validacao.error.flatten() },
        { status: 400 }
      )
    }

    const dados = validacao.data

    // Gerar slug único
    let slug = dados.slug || gerarSlug(dados.titulo)
    const slugExistente = await prisma.imovel.findUnique({ where: { slug } })
    if (slugExistente) {
      slug = `${slug}-${Date.now()}`
    }

    const imovel = await prisma.imovel.create({
      data: {
        ...dados,
        slug,
        metragemTerreno: dados.metragemTerreno ?? null,
      },
      include: { imagens: true },
    })

    return NextResponse.json(imovel, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar imóvel:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
