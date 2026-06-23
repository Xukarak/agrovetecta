import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title: 'AgroVetecta',
  description: 'Conectando el campo con los profesionales',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={geist.className}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}