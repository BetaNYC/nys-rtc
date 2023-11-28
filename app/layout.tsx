import './globals.css'

import type { Metadata } from 'next'
import { Source_Sans_3 } from 'next/font/google'

const sourceSans = Source_Sans_3({subsets:['latin']})

export const metadata: Metadata = {
  title: 'RTC Map Tool',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body className={sourceSans.className} suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
