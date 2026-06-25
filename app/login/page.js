'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) return

    setEnviando(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      setError('Email o contraseña incorrectos')
      setEnviando(false)
    } else {
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100 w-full max-w-md">

        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🌱</p>
          <h1 className="text-2xl font-bold text-green-800">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mt-1">Bienvenido de vuelta</p>
        </div>

        <div className="flex flex-col gap-4">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={enviando}
            className="bg-green-700 text-white font-semibold py-3 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50 mt-2"
          >
            {enviando ? 'Entrando...' : 'Iniciar sesión'}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-green-700 font-semibold hover:underline">
              Regístrate
            </Link>
          </p>

        </div>
      </div>
    </main>
  )
}