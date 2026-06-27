'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function DetallePublicacion({ params }) {
  const [pub, setPub] = useState(null)
  const [respuestas, setRespuestas] = useState([])
  const [autor, setAutor] = useState('')
  const [contenido, setContenido] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [likesCount, setLikesCount] = useState(0)
  const [miLike, setMiLike] = useState(false)
  const [usuarioId, setUsuarioId] = useState(null)
  const [id, setId] = useState(null)

  useEffect(() => {
    async function init() {
      const { id: paramId } = await params
      setId(paramId)

      // Obtener nombre del usuario conectado
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('nombre')
          .eq('usuario_id', session.user.id)
          .single()

        setAutor(perfil?.nombre || session.user.user_metadata?.nombre || '')
      }

      await cargarDatos(paramId)
    }
    init()
  }, [])

  async function cargarDatos(paramId) {
    const { data: publicacion } = await supabase
      .from('publicaciones')
      .select('*')
      .eq('id', paramId)
      .single()

    const { data: resps } = await supabase
      .from('respuestas')
      .select('*')
      .eq('publicacion_id', paramId)
      .order('created_at', { ascending: true })

    setPub(publicacion)
    setRespuestas(resps || [])
    const { data: likesData } = await supabase
      .from('likes')
      .select('*')
      .eq('publicacion_id', paramId)

    setLikesCount(likesData?.length || 0)

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setUsuarioId(session.user.id)
      const miLikeData = likesData?.find(l => l.usuario_id === session.user.id)
      setMiLike(!!miLikeData)
    }
    setCargando(false)
  }

  async function handleLike() {
    if (!usuarioId) return

    if (miLike) {
      await supabase
        .from('likes')
        .delete()
        .eq('usuario_id', usuarioId)
        .eq('publicacion_id', id)

      setMiLike(false)
      setLikesCount(prev => prev - 1)
    } else {
      await supabase
        .from('likes')
        .insert([{ usuario_id: usuarioId, publicacion_id: id }])

      setMiLike(true)
      setLikesCount(prev => prev + 1)
    }
  }

  async function handleRespuesta(e) {
    e.preventDefault()
    if (!contenido || !autor) return

    setEnviando(true)
    const { data: { session } } = await supabase.auth.getSession()

    await supabase
      .from('respuestas')
      .insert([{
        contenido,
        autor,
        publicacion_id: id,
        autor_id: session?.user?.id || null
      }])

    setContenido('')
    setAutor('')
    await cargarDatos(id)
    setEnviando(false)
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </main>
    )
  }

  if (!pub) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">😕</p>
          <p className="text-gray-500 mb-4">Publicación no encontrada</p>
          <Link href="/foro" className="text-green-700 font-semibold hover:underline">
            ← Volver al foro
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-green-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">

        <Link href="/foro" className="text-green-700 text-sm font-medium hover:underline mb-6 block">
          ← Volver al foro
        </Link>

        {/* Publicación principal */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 text-green-800 font-bold text-xl rounded-full w-12 h-12 flex items-center justify-center">
              {pub.autor.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-green-800">{pub.autor}</p>
              <p className="text-xs text-gray-400">
                {new Date(pub.created_at).toLocaleDateString('es-CO', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-green-800 mb-4">{pub.titulo}</h1>

            {pub.foto_url && (
              <img
                src={pub.foto_url}
                alt={pub.titulo}
                className="w-full rounded-xl object-cover max-h-72 mb-4"
              />
            )}

<p className="text-gray-600 leading-relaxed">{pub.contenido}</p>
      <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{
            backgroundColor: miLike ? '#F0FDF4' : '#F9FAFB',
            color: miLike ? '#2D6A4F' : '#9CA3AF',
            border: miLike ? '1px solid #A7F3D0' : '1px solid #E5E7EB'
          }}
        >
          <span className="text-base">{miLike ? '❤️' : '🤍'}</span>
          <span>{likesCount} {likesCount === 1 ? 'Me gusta' : 'Me gusta'}</span>
        </button>
      </div>
        </div>

        {/* Respuestas */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-green-800 mb-4">
            💬 Respuestas ({respuestas.length})
          </h2>

          {respuestas.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-green-100 text-center">
              <p className="text-gray-400 text-sm">
                Aún no hay respuestas. ¡Sé el primero en responder!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {respuestas.map((resp) => (
                <div key={resp.id} className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-700 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
                      {resp.autor.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 text-sm">{resp.autor}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(resp.created_at).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{resp.contenido}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario de respuesta */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
          <h3 className="text-md font-bold text-green-800 mb-4">
            ✍️ Escribe una respuesta
          </h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Tu nombre"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              readOnly={!!autor}
              className={`border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400 ${autor ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            <textarea
              placeholder="Escribe tu respuesta..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={3}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400 resize-none"
            />
            <button
              onClick={handleRespuesta}
              disabled={enviando}
              className="bg-green-700 text-white font-semibold py-2 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Enviar respuesta'}
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}