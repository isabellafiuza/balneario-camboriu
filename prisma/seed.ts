import { PrismaClient, TipoImovel, StatusImovel, TipoTransacao } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@imoveis.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const adminName = process.env.ADMIN_NAME || 'Administrador'

  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log(`✅ Usuário admin criado: ${admin.email}`)

  // Criar imóveis de exemplo
  const imoveisExemplo = [
    {
      slug: 'apartamento-3-quartos-vila-madalena',
      titulo: 'Apartamento 3 Quartos - Vila Madalena',
      descricao: 'Lindo apartamento com 3 quartos, sendo 1 suíte, localizado no coração da Vila Madalena. Próximo a restaurantes, bares e transporte público. Acabamento de alto padrão com cozinha americana e varanda gourmet.',
      preco: 850000,
      tipo: TipoImovel.APARTAMENTO,
      tipoTransacao: TipoTransacao.VENDA,
      status: StatusImovel.DISPONIVEL,
      bairro: 'Vila Madalena',
      cidade: 'São Paulo',
      estado: 'SP',
      quartos: 3,
      banheiros: 2,
      vagas: 2,
      metragem: 95,
      suites: 1,
      destaque: true,
      comodidades: ['Piscina', 'Academia', 'Portaria 24h', 'Salão de Festas'],
    },
    {
      slug: 'casa-4-quartos-alphaville',
      titulo: 'Casa 4 Quartos - Alphaville',
      descricao: 'Espaçosa casa em condomínio fechado com 4 quartos, 3 suítes, piscina privativa e área gourmet. Condomínio com segurança 24 horas, clube completo e área verde.',
      preco: 1800000,
      tipo: TipoImovel.CASA,
      tipoTransacao: TipoTransacao.VENDA,
      status: StatusImovel.DISPONIVEL,
      bairro: 'Alphaville',
      cidade: 'Barueri',
      estado: 'SP',
      quartos: 4,
      banheiros: 4,
      vagas: 4,
      metragem: 280,
      metragemTerreno: 450,
      suites: 3,
      destaque: true,
      comodidades: ['Piscina', 'Churrasqueira', 'Área Gourmet', 'Segurança 24h', 'Jardim'],
    },
    {
      slug: 'terreno-condominio-granja-viana',
      titulo: 'Terreno em Condomínio - Granja Viana',
      descricao: 'Excelente terreno em condomínio fechado de alto padrão. Topografia plana, pronto para construir. Infraestrutura completa com água, luz e esgoto.',
      preco: 320000,
      tipo: TipoImovel.TERRENO,
      tipoTransacao: TipoTransacao.VENDA,
      status: StatusImovel.DISPONIVEL,
      bairro: 'Granja Viana',
      cidade: 'Cotia',
      estado: 'SP',
      quartos: 0,
      banheiros: 0,
      vagas: 0,
      metragem: 500,
      metragemTerreno: 500,
      destaque: false,
      comodidades: ['Segurança 24h', 'Área Verde'],
    },
    {
      slug: 'studio-moderno-pinheiros',
      titulo: 'Studio Moderno - Pinheiros',
      descricao: 'Studio moderno e funcional no bairro mais descolado de São Paulo. Ideal para jovens profissionais. Próximo ao metrô, restaurantes e vida noturna.',
      preco: 3500,
      tipo: TipoImovel.STUDIO,
      tipoTransacao: TipoTransacao.ALUGUEL,
      status: StatusImovel.DISPONIVEL,
      bairro: 'Pinheiros',
      cidade: 'São Paulo',
      estado: 'SP',
      quartos: 1,
      banheiros: 1,
      vagas: 1,
      metragem: 35,
      destaque: false,
      comodidades: ['Academia', 'Portaria 24h', 'Bicicletário'],
    },
  ]

  for (const imovel of imoveisExemplo) {
    const created = await prisma.imovel.upsert({
      where: { slug: imovel.slug },
      update: {},
      create: imovel,
    })
    console.log(`✅ Imóvel criado: ${created.titulo}`)
  }

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log(`\n📧 Login admin: ${adminEmail}`)
  console.log(`🔑 Senha admin: ${adminPassword}`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
