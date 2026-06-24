'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Foro() {
  const [publicaciones, setPublicaciones] = useState([])
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [autor, setAutor] = useState('')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  // Cargar publicaciones al abrir la página
  useState(() => {
    cargarPublicaciones()
  })

  async function cargarPublicaciones() {
    const { data } = await supabase
      .from('publicaciones')
      .select('*')
      .order('created_at', { ascending: false })
    setPublicaciones(data || [])
    setCargando(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo || !contenido || !autor) return
    
    setEnviando(true)
    const { error } = await supabase
      .from('publicaciones')
      .insert([{ titulo, contenido, autor }])

    if (!error) {
      setTitulo('')
      setContenido('')
      setAutor('')
      await cargarPublicaciones()
    }
    setEnviando(false)
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
              onChange={(e) => setAutor(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
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
            <button
              onClick={handleSubmit}
              disabled={enviando}
              className="bg-green-700 text-white font-semibold py-2 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50"
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
              <Link
                href={`/foro/${pub.id}`}
                key={pub.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow block"
              >
                <h2 className="text-lg font-bold text-green-800 mb-2">
                  {pub.titulo}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  {pub.contenido}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>👤 {pub.autor}</span>
                  <span>{new Date(pub.created_at).toLocaleDateString('es-CO')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}