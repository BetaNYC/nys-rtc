import './globals.css'

import Script from 'next/script'

import type { Metadata } from 'next'
import { Source_Sans_3 } from 'next/font/google'

const sourceSans = Source_Sans_3({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Housing Courts Must Change! Map',
  icons: "/app/BetaNYC-favicon.svg",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-TGS7CMBMHE" />
        <Script>
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-TGS7CMBMHE');
          `}
        </Script>
        <link rel="icon" href="/app/BetaNYC-favicon.svg" type="image/svg" sizes="any" />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={sourceSans.className} suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
