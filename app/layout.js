import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AgroVetecta',
  description: 'Conectando el campo con los profesionales',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className} style={{ backgroundColor: '#F8FAF9' }}>
        <Navbar />
        <ScrollToTop />
        {children}
      </body>
    </html>
  )
}