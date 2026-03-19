'use client'

import { trackLeadWhatsApp } from '@/lib/facebookPixel'

type WhatsAppButtonProps = {
  phone: string
  message?: string
  label?: string
  className?: string
}

export default function WhatsAppButton({
  phone,
  message = 'Olá! Tenho interesse em um imóvel.',
  label = 'Falar no WhatsApp',
  className = '',
}: WhatsAppButtonProps) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    trackLeadWhatsApp(label)

    setTimeout(() => {
      window.open(href, '_blank', 'noopener,noreferrer')
    }, 300)
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
    >
      {label}
    </a>
  )
}