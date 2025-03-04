import { Geist, Geist_Mono, Noto_Sans } from 'next/font/google'

export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin'],
})
