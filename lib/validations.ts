import { z } from 'zod'

export const imovelSchema = z.object({
  titulo: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(200),
  descricao: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  preco: z.number().positive('Preço deve ser positivo'),

  condominio: z.coerce.number().optional().nullable(),
  iptu: z.coerce.number().optional().nullable(),

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