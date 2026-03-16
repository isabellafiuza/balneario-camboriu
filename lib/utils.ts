import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import slugify from 'slugify'

// Combina classes Tailwind de forma segura
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Gera slug a partir de um texto
export function gerarSlug(texto: string): string {
  return slugify(texto, {
    lower: true,
    strict: true,
    locale: 'pt',
    trim: true,
  })
}

// Formata preço em BRL
export function formatarPreco(valor: number, tipo?: string): string {
  if (tipo === 'ALUGUEL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor) + '/mês'
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

// Formata metragem
export function formatarMetragem(valor: number): string {
  return `${valor.toLocaleString('pt-BR')} m²`
}

// Gera mensagem WhatsApp
export function gerarMensagemWhatsApp(titulo: string, slug: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const mensagemBase = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Olá! Tenho interesse no imóvel:'
  const url = `${siteUrl}/imoveis/${slug}`
  return encodeURIComponent(`${mensagemBase} *${titulo}*\n${url}`)
}

// Gera URL do WhatsApp
export function gerarUrlWhatsApp(titulo: string, slug: string): string {
  const numero = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'
  const mensagem = gerarMensagemWhatsApp(titulo, slug)
  return `https://wa.me/${numero}?text=${mensagem}`
}

// Traduz tipo de imóvel
export function traduzirTipo(tipo: string): string {
  const tipos: Record<string, string> = {
    APARTAMENTO: 'Apartamento',
    CASA: 'Casa',
    TERRENO: 'Terreno',
    COMERCIAL: 'Comercial',
    COBERTURA: 'Cobertura',
    STUDIO: 'Studio',
  }
  return tipos[tipo] || tipo
}

// Traduz status do imóvel
export function traduzirStatus(status: string): string {
  const statuses: Record<string, string> = {
    DISPONIVEL: 'Disponível',
    VENDIDO: 'Vendido',
    ALUGADO: 'Alugado',
    RESERVADO: 'Reservado',
  }
  return statuses[status] || status
}

// Traduz tipo de transação
export function traduzirTransacao(tipo: string): string {
  const tipos: Record<string, string> = {
    VENDA: 'Venda',
    ALUGUEL: 'Aluguel',
    VENDA_ALUGUEL: 'Venda ou Aluguel',
  }
  return tipos[tipo] || tipo
}

// Cor do badge de status
export function corStatus(status: string): string {
  const cores: Record<string, string> = {
    DISPONIVEL: 'bg-green-100 text-green-800',
    VENDIDO: 'bg-red-100 text-red-800',
    ALUGADO: 'bg-blue-100 text-blue-800',
    RESERVADO: 'bg-yellow-100 text-yellow-800',
  }
  return cores[status] || 'bg-gray-100 text-gray-800'
}

// Trunca texto
export function truncar(texto: string, limite: number): string {
  if (texto.length <= limite) return texto
  return texto.slice(0, limite).trim() + '...'
}
