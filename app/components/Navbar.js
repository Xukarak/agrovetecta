import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-green-800 text-white px-6 py-4 flex items-center justify-between">
      
      <Link href="/" className="text-xl font-bold tracking-wide">
        🌱 AgroVetecta
      </Link>

      <div className="flex gap-6 text-sm font-medium">
        <Link href="/foro" className="hover:text-green-300 transition-colors">
          📸 Foro
        </Link>
        <Link href="/agenda" className="hover:text-green-300 transition-colors">
          📅 Agenda
        </Link>
        <Link href="/chat" className="hover:text-green-300 transition-colors">
          💬 Chat
        </Link>
      </div>

    </nav>
  )
}