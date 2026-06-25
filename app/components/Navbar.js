'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [usuario, setUsuario] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null)
    })

    // Escuchar cambios de sesión
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

  return (
    <nav className="bg-green-800 text-white px-6 py-4 flex items-center justify-between">

      <Link href="/" className="text-xl font-bold tracking-wide">
        🌱 AgroVetecta
      </Link>

      <div className="flex items-center gap-6 text-sm font-medium">
        <Link href="/foro" className="hover:text-green-300 transition-colors">
          📸 Foro
        </Link>
        <Link href="/agenda" className="hover:text-green-300 transition-colors">
          📅 Agenda
        </Link>
        <Link href="/chat" className="hover:text-green-300 transition-colors">
          💬 Chat
        </Link>

        {usuario ? (
          <div className="flex items-center gap-4">
            <Link href="/perfil" className="flex items-center gap-2 hover:text-green-300 transition-colors">
              <div className="bg-green-600 rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">
                {usuario.user_metadata?.nombre?.charAt(0).toUpperCase() || '👤'}
              </div>
              <span>{usuario.user_metadata?.nombre || usuario.email}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-green-700 hover:bg-green-600 px-3 py-1 rounded-lg text-xs transition-colors"
            >
              Salir
            </button>
          </div>
        ) : (
          <Link href="/login" className="bg-white text-green-800 font-bold px-4 py-1 rounded-lg hover:bg-green-100 transition-colors">
            Ingresar
          </Link>
        )}
      </div>

    </nav>
  )
}