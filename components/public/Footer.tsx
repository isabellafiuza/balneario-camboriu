import Link from 'next/link'
import { Home, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Isabella Fiuza'
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5547988419882'
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contato@isabellafiuza.com.br'
  const telefone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '(47) 98841-9882'
  const anoAtual = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-[#1F3D36] text-white">
      <div className="container-page py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Home className="h-5 w-5 text-secondary-400" />
              <span>{siteName}</span>
            </div>

            <p className="max-w-sm text-sm leading-7 text-white/80">
              Curadoria imobiliária em Balneário Camboriú e região, com atendimento
              próximo, leitura de mercado e orientação estratégica para cada momento da sua busca.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
              Navegação
            </h3>

            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/" className="transition-colors hover:text-secondary-400">
                  Página inicial
                </Link>
              </li>
              <li>
                <Link href="/imoveis" className="transition-colors hover:text-secondary-400">
                  Todos os imóveis
                </Link>
              </li>
              <li>
                <Link
                  href="/imoveis?tipoTransacao=VENDA"
                  className="transition-colors hover:text-secondary-400"
                >
                  Imóveis à venda
                </Link>
              </li>
              <li>
                <Link
                  href="/imoveis?tipoTransacao=ALUGUEL"
                  className="transition-colors hover:text-secondary-400"
                >
                  Imóveis para alugar
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-secondary-400">
                  Área da corretora
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
              Contato
            </h3>

            <ul className="space-y-4 text-sm text-white/70">
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-secondary-400"
                >
                  <Phone className="h-4 w-4 flex-shrink-0 text-secondary-400" />
                  <span>{telefone}</span>
                </a>
              </li>

              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 transition-colors hover:text-secondary-400"
                >
                  <Mail className="h-4 w-4 flex-shrink-0 text-secondary-400" />
                  <span>{email}</span>
                </a>
              </li>

              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 flex-shrink-0 text-secondary-400" />
                <span>Balneário Camboriú - SC</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {anoAtual} {siteName}. Todos os direitos reservados.</p>
          <p>CRECI 73623</p>
        </div>
      </div>
    </footer>
  )
}