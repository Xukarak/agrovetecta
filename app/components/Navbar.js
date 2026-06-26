'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const [usuario, setUsuario] = useState(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUsuario(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const links = [
    { href: '/foro', label: 'Foro', emoji: '📸' },
    { href: '/agenda', label: 'Agenda', emoji: '📅' },
    { href: '/chat', label: 'Chat', emoji: '💬' },
  ]

  return (
    <nav style={{ backgroundColor: '#1B4332' }} className="text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">

      <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
        <span className="text-2xl">🌱</span>
        <span>AgroVetecta</span>
      </Link>

      <div className="flex items-center gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname === link.href
                ? 'bg-white/20 text-white'
                : 'text-green-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {usuario ? (
          <>
            <Link
              href="/perfil"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
            >
              <div
                style={{ backgroundColor: '#52B788' }}
                className="rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs text-white"
              >
                {usuario.user_metadata?.nombre?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-sm font-medium text-green-100">
                {usuario.user_metadata?.nombre?.split(' ')[0] || usuario.email}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-green-300 hover:text-white border border-green-600 hover:border-green-400 px-3 py-1.5 rounded-lg transition-all"
            >
              Salir
            </button>
          </>
        ) : (
          <Link
            href="/login"
            style={{ backgroundColor: '#52B788' }}
            className="text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Ingresar
          </Link>
        )}
      </div>

    </nav>
  )
}