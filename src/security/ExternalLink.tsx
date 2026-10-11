import type { AnchorHTMLAttributes, ReactNode } from 'react'

type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'target' | 'rel' | 'referrerPolicy'
> & {
  href: string
  children: ReactNode
}

export function ExternalLink({ href, children, ...rest }: ExternalLinkProps) {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    throw new Error('External link href must be an absolute URL')
  }

  if (url.protocol !== 'https:') {
    throw new Error('External links must use https')
  }

  return (
    <a
      {...rest}
      href={url.href}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
    >
      {children}
    </a>
  )
}
