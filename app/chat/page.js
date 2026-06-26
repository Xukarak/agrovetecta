'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Chat() {
  const [mensajes, setMensajes] = useState([])
  const [contenido, setContenido] = useState('')
  const [autor, setAutor] = useState('')
  const [enviando, setEnviando] = useState(false)
  const bottomRef = useRef(null)
  const mensajesRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const nombre = session.user.user_metadata?.nombre || session.user.email
        setAutor(nombre)
      }
    })

    cargarMensajes()

    const canal = supabase
      .channel('mensajes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes' },
        (payload) => {
          setMensajes((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function cargarMensajes() {
    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .order('created_at', { ascending: true })
    setMensajes(data || [])
  }

  async function handleEnviar(e) {
    e.preventDefault()
    if (!contenido.trim() || !autor.trim()) return

    setEnviando(true)
    await supabase
      .from('mensajes')
      .insert([{ contenido, autor }])

    setContenido('')
    setEnviando(false)
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)' }} className="flex flex-col bg-green-50">

      {/* Header */}
      <div style={{ backgroundColor: '#1B4332' }} className="text-white px-6 py-4 shrink-0">
        <h1 className="text-lg font-bold">💬 Chat AgroVetecta</h1>
        <p className="text-green-300 text-sm">Habla con un profesional en turno</p>
      </div>

      {/* Mensajes — área scrolleable */}
      <div
        ref={mensajesRef}
        className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-3"
      >
        <div className="max-w-2xl w-full mx-auto flex flex-col gap-3">
          {mensajes.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm">No hay mensajes aún. ¡Sé el primero!</p>
            </div>
          ) : (
            mensajes.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-xs ${
                  msg.autor === autor ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <span className="text-xs text-gray-400 mb-1 px-1">{msg.autor}</span>
                <div
                  className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.autor === autor
                      ? 'text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 border border-green-100 rounded-tl-sm'
                  }`}
                  style={msg.autor === autor ? { backgroundColor: '#2D6A4F' } : {}}
                >
                  {msg.contenido}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input — siempre visible abajo */}
      <div className="shrink-0 border-t border-green-100 bg-white px-6 py-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          {!autor && (
            <input
              type="text"
              placeholder="Tu nombre"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
            />
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEnviar(e)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
            />
            <button
              onClick={handleEnviar}
              disabled={enviando}
              style={{ backgroundColor: '#2D6A4F' }}
              className="text-white px-6 py-2 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {enviando ? '...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}