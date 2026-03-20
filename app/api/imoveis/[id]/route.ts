import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { imovelSchema } from '@/lib/validations'
import { gerarSlug } from '@/lib/utils'
import path from 'path'
import fs from 'fs'

// GET /api/imoveis/[id] - Buscar imóvel por ID ou slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Tenta buscar por ID primeiro, depois por slug
    const imovel = await prisma.imovel.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        imagens: {
          orderBy: { ordem: 'asc' },
        },
      },
    })

    if (!imovel) {
      return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 })
    }

    return NextResponse.json(imovel)
  } catch (error) {
    console.error('Erro ao buscar imóvel:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/imoveis/[id] - Atualizar imóvel (requer autenticação)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    const validacao = imovelSchema.partial().safeParse(body)
    if (!validacao.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', detalhes: validacao.error.flatten() },
        { status: 400 }
      )
    }

    const dados = validacao.data

    // Se o título mudou, atualizar o slug
    if (dados.titulo && !dados.slug) {
      const imovelAtual = await prisma.imovel.findUnique({ where: { id } })
      if (imovelAtual && imovelAtual.titulo !== dados.titulo) {
        let novoSlug = gerarSlug(dados.titulo)
        const slugExistente = await prisma.imovel.findFirst({
          where: { slug: novoSlug, NOT: { id } },
        })
        if (slugExistente) {
          novoSlug = `${novoSlug}-${Date.now()}`
        }
        dados.slug = novoSlug
      }
    }

    const imovel = await prisma.imovel.update({
      where: { id },
      data: {
        ...dados,
        metragemTerreno: dados.metragemTerreno ?? undefined,
        condominio: dados.condominio ?? undefined,
        iptu: dados.iptu ?? undefined,
      },
      include: { imagens: true },
    })

    return NextResponse.json(imovel)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 })
    }
    console.error('Erro ao atualizar imóvel:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/imoveis/[id] - Excluir imóvel (requer autenticação)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params

    // Buscar imagens para deletar arquivos locais
    const imagens = await prisma.imagemImovel.findMany({
      where: { imovelId: id },
    })

    // Deletar imóvel (cascade deleta imagens no banco)
    await prisma.imovel.delete({ where: { id } })

    // Deletar arquivos de imagem locais
    for (const imagem of imagens) {
      if (imagem.url.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', imagem.url)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }
    }

    return NextResponse.json({ message: 'Imóvel excluído com sucesso' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 })
    }
    console.error('Erro ao excluir imóvel:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
