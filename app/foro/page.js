'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Foro() {
  const [publicaciones, setPublicaciones] = useState([])
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [autor, setAutor] = useState('')
  const [autorId, setAutorId] = useState(null)
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [likes, setLikes] = useState({})
  const [misLikes, setMisLikes] = useState([])
  const fileRef = useRef(null)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('nombre')
          .eq('usuario_id', session.user.id)
          .single()

        if (perfil?.nombre) setAutor(perfil.nombre)
        setAutorId(session.user.id)

        const { data: misLikesData } = await supabase
          .from('likes')
          .select('publicacion_id')
          .eq('usuario_id', session.user.id)

        setMisLikes(misLikesData?.map(l => l.publicacion_id) || [])
      }

      await cargarPublicaciones()

      const { data: todosLikes } = await supabase
        .from('likes')
        .select('publicacion_id')

      const conteo = {}
      todosLikes?.forEach(l => {
        conteo[l.publicacion_id] = (conteo[l.publicacion_id] || 0) + 1
      })
      setLikes(conteo)
    }
    init()
  }, [])

  async function cargarPublicaciones() {
    const { data } = await supabase
      .from('publicaciones')
      .select('*')
      .order('created_at', { ascending: false })
    setPublicaciones(data || [])
    setCargando(false)
  }

  function handleFoto(e) {
    const archivo = e.target.files[0]
    if (!archivo) return
    setFoto(archivo)
    setFotoPreview(URL.createObjectURL(archivo))
  }

  function quitarFoto() {
    setFoto(null)
    setFotoPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo || !contenido || !autor) return

    setEnviando(true)

    let foto_url = null

    if (foto) {
      const extension = foto.name.split('.').pop()
      const nombreArchivo = `${autorId}-${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('fotos-foro')
        .upload(nombreArchivo, foto)

      if (uploadError) {
        console.error('Error subiendo foto:', uploadError)
      } else {
        const { data: urlData } = supabase.storage
          .from('fotos-foro')
          .getPublicUrl(nombreArchivo)

        foto_url = urlData?.publicUrl || null
      }
    }

    const { data: { session } } = await supabase.auth.getSession()

    await supabase
      .from('publicaciones')
      .insert([{
        titulo,
        contenido,
        autor,
        autor_id: session?.user?.id || null,
        foto_url
      }])

    setTitulo('')
    setContenido('')
    setFoto(null)
    setFotoPreview(null)
    if (fileRef.current) fileRef.current.value = ''
    await cargarPublicaciones()
    setEnviando(false)
  }

  async function handleLike(e, pubId) {
    e.preventDefault()
    e.stopPropagation()

    if (!autorId) return

    const yaLike = misLikes.includes(pubId)

    if (yaLike) {
      await supabase
        .from('likes')
        .delete()
        .eq('usuario_id', autorId)
        .eq('publicacion_id', pubId)

      setMisLikes(prev => prev.filter(id => id !== pubId))
      setLikes(prev => ({ ...prev, [pubId]: (prev[pubId] || 1) - 1 }))
    } else {
      await supabase
        .from('likes')
        .insert([{ usuario_id: autorId, publicacion_id: pubId }])

      setMisLikes(prev => [...prev, pubId])
      setLikes(prev => ({ ...prev, [pubId]: (prev[pubId] || 0) + 1 }))
    }
  }

  return (
    <main className="min-h-screen bg-green-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold text-green-800 mb-2">
          📸 Foro AgroVetecta
        </h1>
        <p className="text-gray-500 mb-8">
          Comparte fotos y preguntas con la comunidad
        </p>

        {/* Formulario nueva publicación */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 mb-8">
          <h2 className="text-lg font-bold text-green-800 mb-4">
            Nueva publicación
          </h2>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Tu nombre"
              value={autor}
              onChange={(e) => !autor && setAutor(e.target.value)}
              readOnly={!!autor}
              className={`border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400 ${autor ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            <input
              type="text"
              placeholder="Título de tu pregunta o publicación"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
            />
            <textarea
              placeholder="Describe tu pregunta o situación..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={3}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400 resize-none"
            />

            {/* Selector de foto */}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFoto}
                className="hidden"
                id="foto-input"
              />
              <label
                htmlFor="foto-input"
                className="flex items-center gap-2 text-sm font-medium cursor-pointer w-fit px-4 py-2 rounded-xl border border-dashed border-green-300 text-green-700 hover:bg-green-50 transition-colors"
              >
                📷 {foto ? 'Cambiar foto' : 'Agregar foto'}
              </label>
            </div>

            {/* Preview de la foto */}
            {fotoPreview && (
              <div className="relative">
                <img
                  src={fotoPreview}
                  alt="Preview"
                  className="w-full rounded-xl object-cover max-h-48"
                />
                <button
                  onClick={quitarFoto}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={enviando}
              style={{ backgroundColor: '#1B4332' }}
              className="text-white font-semibold py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {enviando ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>

        {/* Lista de publicaciones */}
        {cargando ? (
          <p className="text-center text-gray-400">Cargando publicaciones...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {publicaciones.map((pub) => (
              <div
                key={pub.id}
                className="bg-white rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-shadow overflow-hidden"
              >
                <Link href={`/foro/${pub.id}`} className="block">
                  {pub.foto_url && (
                    <img
                      src={pub.foto_url}
                      alt={pub.titulo}
                      className="w-full object-cover max-h-56"
                    />
                  )}
                  <div className="p-6 pb-3">
                    <h2 className="text-lg font-bold text-green-800 mb-2">
                      {pub.titulo}
                    </h2>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {pub.contenido}
                    </p>
                    <span className="text-xs text-gray-400">👤 {pub.autor}</span>
                  </div>
                </Link>

                {/* Like fuera del Link */}
                <div className="px-6 pb-4 flex items-center justify-between">
                  <button
                    onClick={(e) => handleLike(e, pub.id)}
                    className="flex items-center gap-1 text-xs transition-all hover:scale-110"
                    style={{ color: misLikes.includes(pub.id) ? '#2D6A4F' : '#9CA3AF' }}
                  >
                    <span className="text-base">
                      {misLikes.includes(pub.id) ? '❤️' : '🤍'}
                    </span>
                    <span className="font-medium">{likes[pub.id] || 0}</span>
                  </button>
                  <span className="text-xs text-gray-400">
                    {new Date(pub.created_at).toLocaleDateString('es-CO')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}