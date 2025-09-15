import { geistMono, geistSans, notoSans } from '@/lib/fonts'
import type { Metadata } from 'next'
import './globals.css'

const title = 'Torben Albert-Lindqvist - Full-Stack Developer & ML Engineer'
const description = 'Design-oriented developer with a passion for creating beautiful and functional applications. I specialize in full-stack development, data science, and machine learning.'
const keywords = ['full-stack developer', 'ML engineer', 'UI designer', 'data scientist', 'React', 'Next.js', 'TypeScript', 'Python', 'PyTorch']
const authors = [{ name: 'Torben Albert-Lindqvist' }]
const creator = 'Torben Albert-Lindqvist'
const url = 'https://torben.al'
const siteName = 'Torben Albert-Lindqvist\'s Portfolio'

export const metadata: Metadata = {
  title,
  description,
  keywords,
  authors,
  creator,
  openGraph: {
    title,
    description,
    url,
    siteName,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
