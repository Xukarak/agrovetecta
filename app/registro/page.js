'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Registro() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  async function handleRegistro(e) {
    e.preventDefault()
    if (!nombre || !email || !password) return
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setEnviando(true)
    setError('')

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre }
      }
    })

    if (authError) {
      setError('Error al crear la cuenta. Intenta con otro email.')
    } else {
      setExito(true)
    }
    setEnviando(false)
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100 w-full max-w-md">

        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🌱</p>
          <h1 className="text-2xl font-bold text-green-800">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Únete a AgroVetecta</p>
        </div>

        {exito ? (
          <div className="text-center">
            <p className="text-4xl mb-4">✅</p>
            <p className="font-semibold text-green-800 mb-2">¡Cuenta creada!</p>
            <p className="text-gray-500 text-sm mb-6">
              Revisa tu correo para confirmar tu cuenta.
            </p>
            <Link
              href="/login"
              className="bg-green-700 text-white font-semibold py-2 px-6 rounded-xl hover:bg-green-800 transition-colors"
            >
              Ir al login
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Nombre completo
              </label>
              <input
                type="text"
                placeholder="Ej: Carlos Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
              />
            </div>

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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
              />
            </div>

            <button
              onClick={handleRegistro}
              disabled={enviando}
              className="bg-green-700 text-white font-semibold py-3 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50 mt-2"
            >
              {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <p className="text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-green-700 font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>

          </div>
        )}

      </div>
    </main>
  )
}