'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const [usuario, setUsuario] = useState(null)
  const [pendientes, setPendientes] = useState([])
  const [citas, setCitas] = useState([])
  const [stats, setStats] = useState({ usuarios: 0, citas: 0, publicaciones: 0 })
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('pendientes')
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: perfil } = await supabase
        .from('perfiles')
        .select('*')
        .eq('usuario_id', session.user.id)
        .single()

      if (!perfil || perfil.rol !== 'admin') {
        router.push('/')
        return
      }

      setUsuario(perfil)
      await cargarDatos()
      setCargando(false)
    }
    init()
  }, [])

  async function cargarDatos() {
    const { data: pends } = await supabase
      .from('perfiles')
      .select('*')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false })

    const { data: citasData } = await supabase
      .from('citas')
      .select('*')
      .order('created_at', { ascending: false })

    const { count: totalUsuarios } = await supabase
      .from('perfiles')
      .select('*', { count: 'exact', head: true })

    const { count: totalPublicaciones } = await supabase
      .from('publicaciones')
      .select('*', { count: 'exact', head: true })

    setPendientes(pends || [])
    setCitas(citasData || [])
    setStats({
      usuarios: totalUsuarios || 0,
      citas: citasData?.length || 0,
      publicaciones: totalPublicaciones || 0
    })
  }

  async function aprobarUsuario(id) {
    await supabase
      .from('perfiles')
      .update({ estado: 'activo' })
      .eq('id', id)
    await cargarDatos()
  }

  async function rechazarUsuario(id) {
    await supabase
      .from('perfiles')
      .update({ estado: 'inactivo' })
      .eq('id', id)
    await cargarDatos()
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando panel...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-green-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-1">
            🏛️ Panel de Administración
          </h1>
          <p className="text-gray-500 text-sm">
            Bienvenido, {usuario?.nombre} — {usuario?.municipio}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Usuarios totales', valor: stats.usuarios, emoji: '👥' },
            { label: 'Citas agendadas', valor: stats.citas, emoji: '📅' },
            { label: 'Publicaciones', valor: stats.publicaciones, emoji: '📸' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 text-center">
              <p className="text-3xl mb-1">{stat.emoji}</p>
              <p className="text-3xl font-bold text-green-800">{stat.valor}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {[
            { id: 'pendientes', label: `⏳ Pendientes (${pendientes.length})` },
            { id: 'citas', label: `📅 Citas (${citas.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === t.id ? '#1B4332' : 'white',
                color: tab === t.id ? 'white' : '#6B7280',
                border: tab === t.id ? 'none' : '1px solid #E5E7EB'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Pendientes */}
        {tab === 'pendientes' && (
          <div className="flex flex-col gap-3">
            {pendientes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-green-100 text-center">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-gray-400 text-sm">No hay usuarios pendientes de aprobación</p>
              </div>
            ) : (
              pendientes.map((perfil) => (
                <div key={perfil.id} className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg"
                        style={{ backgroundColor: '#2D6A4F' }}
                      >
                        {perfil.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-green-800">{perfil.nombre}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium capitalize">
                            {perfil.tipo === 'ambos' ? '🌾🐄 Agricultor y Ganadero' :
                             perfil.tipo === 'agricultor' ? '🌾 Agricultor' : '🐄 Ganadero'}
                          </span>
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            📍 {perfil.municipio}, {perfil.departamento}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => aprobarUsuario(perfil.id)}
                        className="text-xs font-bold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: '#2D6A4F' }}
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        onClick={() => rechazarUsuario(perfil.id)}
                        className="text-xs font-bold px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        🚫 Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Citas */}
        {tab === 'citas' && (
          <div className="flex flex-col gap-3">
            {citas.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-green-100 text-center">
                <p className="text-2xl mb-2">📅</p>
                <p className="text-gray-400 text-sm">No hay citas agendadas aún</p>
              </div>
            ) : (
              citas.map((cita) => (
                <div key={cita.id} className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-800">{cita.nombre}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {cita.tipo === 'virtual' ? '💻 Virtual' : '🚜 Visita'}
                        </span>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          📆 {new Date(cita.fecha).toLocaleDateString('es-CO', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </span>
                        <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                          {cita.jornada === 'mañana' ? '🌅 Mañana' : '🌇 Tarde'}
                        </span>
                      </div>
                      {cita.notas && (
                        <p className="text-xs text-gray-500 mt-2">📝 {cita.notas}</p>
                      )}
                    </div>
                    <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full font-semibold">
                      ⏳ Pendiente
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </main>
  )
}