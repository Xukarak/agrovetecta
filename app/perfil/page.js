'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Perfil() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [publicaciones, setPublicaciones] = useState([])
  const [citas, setCitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cambiandoTipo, setCambiandoTipo] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function cargarDatos() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const user = session.user
      setUsuario(user)

      const { data: perfilData } = await supabase
        .from('perfiles')
        .select('*')
        .eq('usuario_id', user.id)
        .single()

      if (perfilData) {
        setPerfil(perfilData)

        const nombre = perfilData.nombre || user.email

        const { data: pubs } = await supabase
          .from('publicaciones')
          .select('*')
          .eq('autor', nombre)
          .order('created_at', { ascending: false })

        const { data: citasData } = await supabase
          .from('citas')
          .select('*')
          .eq('nombre', nombre)
          .order('created_at', { ascending: false })

        setPublicaciones(pubs || [])
        setCitas(citasData || [])
      }

      setCargando(false)
    }

    cargarDatos()
  }, [])

  async function cambiarEspecialidad(nuevaEspecialidad) {
    setCambiandoTipo(true)
    await supabase
      .from('perfiles')
      .update({ especialidad_activa: nuevaEspecialidad })
      .eq('id', perfil.id)

    setPerfil({ ...perfil, especialidad_activa: nuevaEspecialidad })
    setCambiandoTipo(false)
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-green-200 border-t-green-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Cargando perfil...</p>
        </div>
      </main>
    )
  }

  const nombre = perfil?.nombre || usuario?.email
  const tipo = perfil?.tipo || 'agricultor'

  const badgeTipo = {
    agricultor: '🌾 Agricultor',
    ganadero: '🐄 Ganadero',
    ambos: '🌾🐄 Agricultor y Ganadero',
  }

  return (
    <main className="min-h-screen bg-green-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Tarjeta de perfil */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100 mb-6">
          <div className="flex items-center gap-5 mb-6">
            <div
              style={{ backgroundColor: '#1B4332' }}
              className="text-white font-bold text-3xl rounded-full w-20 h-20 flex items-center justify-center"
            >
              {nombre?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-800">{nombre}</h1>
              <p className="text-gray-400 text-sm">{usuario?.email}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                  {badgeTipo[tipo]}
                </span>
                <span className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: perfil?.estado === 'activo' ? '#D1FAE5' : '#FEF3C7',
                    color: perfil?.estado === 'activo' ? '#065F46' : '#92400E'
                  }}
                >
                  {perfil?.estado === 'activo' ? '✅ Activo' : '⏳ Pendiente'}
                </span>
              </div>
            </div>
          </div>

          {/* Selector de especialidad para usuarios "ambos" */}
          {tipo === 'ambos' && (
            <div className="border border-green-100 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-green-800 mb-3">
                🎯 Especialidad activa en el chat
              </p>
              <div className="flex gap-3">
                {[
                  { valor: 'agricultura', label: '🌾 Agricultura', desc: 'Ver canal de cultivos' },
                  { valor: 'ganaderia', label: '🐄 Ganadería', desc: 'Ver canal de animales' },
                ].map((op) => (
                  <button
                    key={op.valor}
                    onClick={() => cambiarEspecialidad(op.valor)}
                    disabled={cambiandoTipo}
                    className="flex-1 p-3 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: perfil?.especialidad_activa === op.valor ? '#1B4332' : '#E5E7EB',
                      backgroundColor: perfil?.especialidad_activa === op.valor ? '#F0FDF4' : 'white'
                    }}
                  >
                    <p className="font-semibold text-sm text-gray-800">{op.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{op.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Cambia qué canal ves cuando entras al chat.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-800">{publicaciones.length}</p>
              <p className="text-xs text-gray-500 mt-1">Publicaciones</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-800">{citas.length}</p>
              <p className="text-xs text-gray-500 mt-1">Citas</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-800">
                {perfil?.municipio?.split(' ')[0] || '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Municipio</p>
            </div>
          </div>
        </div>

        {/* Publicaciones */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-green-800 mb-4">📸 Mis publicaciones</h2>
          {publicaciones.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-green-100 text-center">
              <p className="text-gray-400 text-sm">Aún no has publicado nada en el foro.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {publicaciones.map((pub) => (
                <div key={pub.id} className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
                  <h3 className="font-semibold text-green-800 mb-1">{pub.titulo}</h3>
                  <p className="text-gray-500 text-sm">{pub.contenido}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(pub.created_at).toLocaleDateString('es-CO', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Citas */}
        <div>
          <h2 className="text-lg font-bold text-green-800 mb-4">📅 Mis citas</h2>
          {citas.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-green-100 text-center">
              <p className="text-gray-400 text-sm">No tienes citas agendadas aún.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {citas.map((cita) => (
                <div key={cita.id} className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-green-800">
                      {cita.tipo === 'virtual' ? '💻 Cita virtual' : '🚜 Visita a finca'}
                    </span>
                    <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                      {cita.jornada === 'mañana' ? '🌅 Mañana' : '🌇 Tarde'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    📆 {new Date(cita.fecha).toLocaleDateString('es-CO', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                  {cita.direccion && (
                    <p className="text-sm text-gray-500 mt-1">📍 {cita.direccion}</p>
                  )}
                  {cita.notas && (
                    <p className="text-sm text-gray-500 mt-1">📝 {cita.notas}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}