import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"

export const metadata: Metadata = {
  title: "O(n) Club - For Founders, By Founders",
  description: "Application form for O(n) Club",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="preload" href={GeistSans.style.fontFamily} as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body className="antialiased text-rendering-optimized">{children}</body>
    </html>
  )
}
