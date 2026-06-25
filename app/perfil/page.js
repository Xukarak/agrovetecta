'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Perfil() {
  const [usuario, setUsuario] = useState(null)
  const [publicaciones, setPublicaciones] = useState([])
  const [citas, setCitas] = useState([])
  const [cargando, setCargando] = useState(true)
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

      const nombre = user.user_metadata?.nombre || user.email

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
      setCargando(false)
    }

    cargarDatos()
  }, [])

  if (cargando) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando perfil...</p>
      </main>
    )
  }

  const nombre = usuario?.user_metadata?.nombre || usuario?.email

  return (
    <main className="min-h-screen bg-green-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Tarjeta de perfil */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100 mb-8">
          <div className="flex items-center gap-5">
            <div className="bg-green-700 text-white font-bold text-3xl rounded-full w-20 h-20 flex items-center justify-center">
              {nombre?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-800">{nombre}</h1>
              <p className="text-gray-400 text-sm">{usuario?.email}</p>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full mt-2 inline-block">
                🌱 Agricultor
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-800">{publicaciones.length}</p>
              <p className="text-sm text-gray-500 mt-1">Publicaciones</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-800">{citas.length}</p>
              <p className="text-sm text-gray-500 mt-1">Citas agendadas</p>
            </div>
          </div>
        </div>

        {/* Publicaciones del usuario */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-green-800 mb-4">
            📸 Mis publicaciones
          </h2>
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

        {/* Citas del usuario */}
        <div>
          <h2 className="text-lg font-bold text-green-800 mb-4">
            📅 Mis citas
          </h2>
          {citas.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-green-100 text-center">
              <p className="text-gray-400 text-sm">No tienes citas agendadas aún.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {citas.map((cita) => (
                <div key={cita.id} className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-green-800 capitalize">
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