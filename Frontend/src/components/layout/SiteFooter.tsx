type FooterLink = {
  label: string
  href: string
}

type SiteFooterProps = {
  brand?: string
  copy?: string
  links?: FooterLink[]
  className?: string
}

const defaultLinks: FooterLink[] = [
  { label: 'Aviso legal', href: '#' },
  { label: 'Privacidad', href: '#' },
  { label: 'Terminos de servicio', href: '#' },
  { label: 'Contacto', href: '#' },
]

function SiteFooter({
  brand = 'TestaLink',
  copy =
    '2026 TestaLink. Los documentos generados son borradores legales y no sustituyen la asesoria profesional de un notario colegiado.',
  links = defaultLinks,
  className = '',
}: SiteFooterProps) {
  const footerClassName = ['site-footer', className].filter(Boolean).join(' ')

  return (
    <footer className={footerClassName}>
      <div>
        <p className="footer-brand">{brand}</p>
        <p className="footer-copy">{copy}</p>
      </div>
      <div className="footer-links">
        {links.map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  )
}

export default SiteFooter
