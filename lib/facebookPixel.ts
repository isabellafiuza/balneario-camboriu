declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export const FB_PIXEL_ID = '1348676193951546'

type EventOptions = Record<string, string | number | boolean | null | undefined>

export const event = (name: string, options?: EventOptions) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', name, options)
  }
}

export const trackLeadWhatsApp = (label?: string) => {
  event('Lead', {
    content_name: 'WhatsApp Click',
    content_category: 'Contato',
    source: 'website',
    button_name: label ?? 'Botao WhatsApp',
  })
}