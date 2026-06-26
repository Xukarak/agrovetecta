'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

const DEPARTAMENTOS_MUNICIPIOS = {
  'Cesar': ['Valledupar', 'Aguachica', 'Curumaní', 'Chimichagua', 'Tamalameque', 'Pailitas', 'La Paz', 'San Alberto'],
  'Magdalena': ['Santa Marta', 'Ciénaga', 'Fundación', 'El Banco', 'Plato'],
  'Bolívar': ['Cartagena', 'Magangué', 'Mompox', 'El Carmen de Bolívar'],
  'Córdoba': ['Montería', 'Sahagún', 'Lorica', 'Cereté', 'Montelíbano'],
  'Sucre': ['Sincelejo', 'Corozal', 'Sampués', 'San Marcos'],
}

export default function Registro() {
  const [paso, setPaso] = useState(1)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tipo, setTipo] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  async function handleRegistro() {
    if (!nombre || !email || !password || !tipo || !municipio) {
      setError('Por favor completa todos los campos')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setEnviando(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    })

    if (authError) {
      setError('Error al crear la cuenta. Intenta con otro email.')
      setEnviando(false)
      return
    }

    // Crear perfil en tabla perfiles
    if (data.user) {
      await supabase.from('perfiles').insert([{
        usuario_id: data.user.id,
        nombre,
        rol: 'agricultor',
        tipo,
        municipio,
        departamento,
        estado: 'pendiente'
      }])
    }

    setExito(true)
    setEnviando(false)
  }

  if (exito) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100 w-full max-w-md text-center">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-xl font-bold text-green-800 mb-2">¡Cuenta creada!</h2>
          <p className="text-gray-500 text-sm mb-2">
            Tu solicitud fue enviada al municipio de <strong>{municipio}</strong>.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Una vez que el administrador apruebe tu cuenta, tendrás acceso completo.
          </p>
          <Link
            href="/login"
            style={{ backgroundColor: '#2D6A4F' }}
            className="text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity inline-block"
          >
            Ir al login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center px-6 py-10">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🌱</p>
          <h1 className="text-2xl font-bold text-green-800">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Únete a AgroVetecta</p>
        </div>

        {/* Indicador de pasos */}
        {/* Indicador de pasos */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: paso >= n ? '#1B4332' : '#F3F4F6',
                  color: paso >= n ? 'white' : '#9CA3AF'
                }}
              >
                {paso > n ? '✓' : n}
              </div>
              {n < 3 && (
                <div
                  className="w-16 h-1 rounded"
                  style={{ backgroundColor: paso > n ? '#1B4332' : '#F3F4F6' }}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {/* PASO 1 — Datos personales */}
        {paso === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-gray-600 mb-2">Paso 1 — Tus datos</p>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Nombre completo</label>
              <input
                type="text"
                placeholder="Ej: Carlos Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
              />
            </div>

            <button
              onClick={() => {
                if (!nombre || !email || !password) {
                  setError('Completa todos los campos')
                  return
                }
                setError('')
                setPaso(2)
              }}
              style={{ backgroundColor: '#1B4332' }}
              className="text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity mt-2"
            >
              Continuar →
            </button>
          </div>
        )}

        {/* PASO 2 — Tipo de usuario */}
        {paso === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-gray-600 mb-2">Paso 2 — ¿A qué te dedicas?</p>

            {[
              { valor: 'agricultor', emoji: '🌾', titulo: 'Agricultor', desc: 'Me dedico a cultivos y producción agrícola' },
              { valor: 'ganadero', emoji: '🐄', titulo: 'Ganadero', desc: 'Me dedico a la cría y cuidado de animales' },
              { valor: 'ambos', emoji: '🌾🐄', titulo: 'Ambos', desc: 'Tengo tanto cultivos como animales' },
            ].map((op) => (
              <button
                key={op.valor}
                onClick={() => setTipo(op.valor)}
                className="flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: tipo === op.valor ? '#1B4332' : '#E5E7EB',
                  backgroundColor: tipo === op.valor ? '#F0FDF4' : 'white'
                }}
              >
                <span className="text-2xl">{op.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{op.titulo}</p>
                  <p className="text-xs text-gray-500">{op.desc}</p>
                </div>
                {tipo === op.valor && (
                  <span className="ml-auto text-green-700 font-bold">✓</span>
                )}
              </button>
            ))}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setPaso(1)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:border-gray-300 transition-colors"
              >
                ← Atrás
              </button>
              <button
                onClick={() => {
                  if (!tipo) {
                    setError('Selecciona tu tipo de actividad')
                    return
                  }
                  setError('')
                  setPaso(3)
                }}
                style={{ backgroundColor: '#1B4332' }}
                className="flex-1 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3 — Municipio */}
        {paso === 3 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-gray-600 mb-2">Paso 3 — Tu ubicación</p>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Departamento</label>
              <select
                value={departamento}
                onChange={(e) => {
                  setDepartamento(e.target.value)
                  setMunicipio('')
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:border-green-400 bg-white"
              >
                <option value="">Selecciona tu departamento</option>
                {Object.keys(DEPARTAMENTOS_MUNICIPIOS).map((dep) => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>

            {departamento && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Municipio</label>
                <select
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:border-green-400 bg-white"
                >
                  <option value="">Selecciona tu municipio</option>
                  {DEPARTAMENTOS_MUNICIPIOS[departamento].map((mun) => (
                    <option key={mun} value={mun}>{mun}</option>
                  ))}
                </select>
              </div>
            )}

            {municipio && (
              <div
                className="rounded-xl p-4 text-sm"
                style={{ backgroundColor: '#F0FDF4', border: '1px solid #A7F3D0' }}
              >
                <p className="font-semibold text-green-800 mb-1">📍 {municipio}, {departamento}</p>
                <p className="text-green-700 text-xs">
                  Tu solicitud será enviada al administrador de este municipio para aprobación.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setPaso(2)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:border-gray-300 transition-colors"
              >
                ← Atrás
              </button>
              <button
                onClick={handleRegistro}
                disabled={enviando || !municipio}
                style={{ backgroundColor: '#1B4332' }}
                className="flex-1 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {enviando ? 'Creando cuenta...' : 'Crear cuenta ✓'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: '#2D6A4F' }}>
            Inicia sesión
          </Link>
        </p>

      </div>
    </main>
  )
}