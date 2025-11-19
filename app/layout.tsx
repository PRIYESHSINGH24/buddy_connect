import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import MessageBar from '@/components/messages/message-bar'
import { ThemeProvider } from '@/components/theme-provider'
import ThemeToggle from '@/components/ui/theme-toggle'
import BottomNav from '@/components/ui/bottom-nav'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: 'Buddy Connect',
  description: 'Connect with your buddies and build lasting relationships',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
          <ThemeProvider enableSystem attribute="class">
            <MessageBar />
            {children}
            <ThemeToggle />
            <BottomNav />
          </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
