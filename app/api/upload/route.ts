import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function garantirDiretorio() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const arquivo = formData.get('arquivo') as File
    const imovelId = formData.get('imovelId') as string
    const principal = formData.get('principal') === 'true'
    const alt = ((formData.get('alt') as string) || '').trim()

    if (!arquivo) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (!imovelId) {
      return NextResponse.json({ error: 'ID do imóvel é obrigatório' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(arquivo.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.' },
        { status: 400 }
      )
    }

    if (arquivo.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      )
    }

    const imovel = await prisma.imovel.findUnique({
      where: { id: imovelId },
    })

    if (!imovel) {
      return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 })
    }

    garantirDiretorio()

    const extensao = arquivo.name.split('.').pop()?.toLowerCase() || 'jpg'
    const nomeArquivo = `${uuidv4()}.${extensao}`
    const caminhoArquivo = path.join(UPLOAD_DIR, nomeArquivo)
    const urlArquivo = `/api/uploads/${nomeArquivo}`

    const buffer = Buffer.from(await arquivo.arrayBuffer())
    fs.writeFileSync(caminhoArquivo, buffer)

    if (principal) {
      await prisma.imagemImovel.updateMany({
        where: { imovelId },
        data: { principal: false },
      })
    }

    const totalImagens = await prisma.imagemImovel.count({
      where: { imovelId },
    })

    const imagem = await prisma.imagemImovel.create({
      data: {
        imovelId,
        url: urlArquivo,
        alt: alt || imovel.titulo,
        ordem: totalImagens,
        principal: principal || totalImagens === 0,
      },
    })

    return NextResponse.json(imagem, { status: 201 })
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const imagemId = searchParams.get('imagemId')

    if (!imagemId) {
      return NextResponse.json({ error: 'ID da imagem é obrigatório' }, { status: 400 })
    }

    const imagem = await prisma.imagemImovel.findUnique({
      where: { id: imagemId },
    })

    if (!imagem) {
      return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 })
    }

    if (imagem.url.startsWith('/api/uploads/')) {
      const nomeArquivo = imagem.url.replace('/api/uploads/', '')
      const filePath = path.join(UPLOAD_DIR, nomeArquivo)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    await prisma.imagemImovel.delete({
      where: { id: imagemId },
    })

    if (imagem.principal) {
      const proximaImagem = await prisma.imagemImovel.findFirst({
        where: { imovelId: imagem.imovelId },
        orderBy: { ordem: 'asc' },
      })

      if (proximaImagem) {
        await prisma.imagemImovel.update({
          where: { id: proximaImagem.id },
          data: { principal: true },
        })
      }
    }

    return NextResponse.json({ message: 'Imagem removida com sucesso' })
  } catch (error) {
    console.error('Erro ao remover imagem:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}