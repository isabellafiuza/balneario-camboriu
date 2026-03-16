import { z } from 'zod'

export const imovelSchema = z.object({
  titulo: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(200),
  descricao: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  preco: z.number().positive('Preço deve ser positivo'),
  tipo: z.enum(['APARTAMENTO', 'CASA', 'TERRENO', 'COMERCIAL', 'COBERTURA', 'STUDIO']),
  tipoTransacao: z.enum(['VENDA', 'ALUGUEL', 'VENDA_ALUGUEL']).default('VENDA'),
  status: z.enum(['DISPONIVEL', 'VENDIDO', 'ALUGADO', 'RESERVADO']).default('DISPONIVEL'),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 letras').default('SP'),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  quartos: z.number().int().min(0).default(0),
  banheiros: z.number().int().min(0).default(0),
  vagas: z.number().int().min(0).default(0),
  metragem: z.number().positive('Metragem deve ser positiva'),
  metragemTerreno: z.number().positive().optional(),
  suites: z.number().int().min(0).default(0),
  comodidades: z.array(z.string()).default([]),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  destaque: z.boolean().default(false),
  slug: z.string().optional(),
})

export type ImovelInput = z.infer<typeof imovelSchema>

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const filtroImoveisSchema = z.object({
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  tipo: z.enum(['APARTAMENTO', 'CASA', 'TERRENO', 'COMERCIAL', 'COBERTURA', 'STUDIO']).optional(),
  tipoTransacao: z.enum(['VENDA', 'ALUGUEL', 'VENDA_ALUGUEL']).optional(),
  precoMin: z.number().optional(),
  precoMax: z.number().optional(),
  quartosMin: z.number().int().optional(),
  status: z.enum(['DISPONIVEL', 'VENDIDO', 'ALUGADO', 'RESERVADO']).optional(),
  pagina: z.number().int().positive().default(1),
  porPagina: z.number().int().positive().max(50).default(12),
  ordenar: z.enum(['preco_asc', 'preco_desc', 'data_desc', 'data_asc']).default('data_desc'),
})

export type FiltroImoveis = z.infer<typeof filtroImoveisSchema>
