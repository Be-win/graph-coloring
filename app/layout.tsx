import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Graph Coloring',
  description: 'Simulator for graph coloring algorithms',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
