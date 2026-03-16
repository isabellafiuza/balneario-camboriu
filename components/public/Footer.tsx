import Link from 'next/link'
import { Home, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Imóveis Premium'
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contato@exemplo.com'
  const telefone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '(11) 99999-9999'
  const anoAtual = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sobre */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <Home className="w-6 h-6 text-primary-400" />
              <span>{siteName}</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Especialistas em imóveis residenciais e comerciais. Encontre o imóvel perfeito para você e sua família.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link href="/imoveis" className="hover:text-white transition-colors">
                  Todos os Imóveis
                </Link>
              </li>
              <li>
                <Link href="/imoveis?tipoTransacao=VENDA" className="hover:text-white transition-colors">
                  Imóveis à Venda
                </Link>
              </li>
              <li>
                <Link href="/imoveis?tipoTransacao=ALUGUEL" className="hover:text-white transition-colors">
                  Imóveis para Alugar
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Área da Corretora
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>{telefone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span>{email}</span>
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>São Paulo, SP - Brasil</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {anoAtual} {siteName}. Todos os direitos reservados.</p>
          <p>CRECI: XXXXX-F</p>
        </div>
      </div>
    </footer>
  )
}
