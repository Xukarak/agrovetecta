'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Chat() {
  const [mensajes, setMensajes] = useState([])
  const [contenido, setContenido] = useState('')
  const [autor, setAutor] = useState('')
  const [canal, setCanal] = useState('agricultura')
  const [enviando, setEnviando] = useState(false)
  const [perfil, setPerfil] = useState(null)
  const [perfilCargado, setPerfilCargado] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const bottomRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    async function init() {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        const nombre = session.user.user_metadata?.nombre || session.user.email
        setAutor(nombre)

        const { data: perfilData } = await supabase
          .from('perfiles')
          .select('*')
          .eq('usuario_id', session.user.id)
          .single()

        if (perfilData) {
          // Verificar acceso
          if (perfilData.estado === 'pendiente' && perfilData.rol !== 'admin') {
            router.push('/esperando')
            return
          }
          setPerfil(perfilData)
          if (perfilData.tipo === 'ganadero') setCanal('ganaderia')
        }
        setPerfilCargado(true)
        setVerificando(false)
      }
    init()
  }, [])

  useEffect(() => {
    if (!canal) return
    async function cargarMensajes() {
    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .eq('canal', canal)
      .order('created_at', { ascending: true })
    setMensajes(data || [])
    }
    cargarMensajes()

    const suscripcion = supabase
      .channel(`chat-${canal}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `canal=eq.${canal}`
        },
        (payload) => {
          setMensajes((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(suscripcion)
    }
  }, [canal])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function handleEnviar(e) {
    e.preventDefault()
    if (!contenido.trim() || !autor.trim()) return

    setEnviando(true)
    await supabase
      .from('mensajes')
      .insert([{ contenido, autor, canal }])

    setContenido('')
    setEnviando(false)
  }

  const esAmbos = perfil?.tipo === 'ambos' || perfil?.rol === 'admin' || perfil?.rol === 'profesional'

  if (verificando) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-green-200 border-t-green-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Verificando acceso...</p>
        </div>
      </main>
    )
  }
  
  return (
    <div style={{ height: 'calc(100vh - 64px)' }} className="flex flex-col bg-green-50">

      {/* Header con selector de canal */}
      <div style={{ backgroundColor: '#1B4332' }} className="text-white px-6 py-4 shrink-0">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <h1 className="text-lg font-bold">💬 Chat AgroVetecta</h1>
            <p className="text-green-300 text-sm">
              {canal === 'agricultura' ? '🌾 Canal Agricultura' : '🐄 Canal Ganadería'}
            </p>
          </div>

          {/* Selector de canal — solo para usuarios tipo "ambos" o admin */}
          {esAmbos && perfilCargado && (
            <div className="flex gap-2">
              <button
                onClick={() => setCanal('agricultura')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: canal === 'agricultura' ? '#52B788' : 'rgba(255,255,255,0.1)',
                  color: 'white'
                }}
              >
                🌾 Agricultura
              </button>
              <button
                onClick={() => setCanal('ganaderia')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: canal === 'ganaderia' ? '#52B788' : 'rgba(255,255,255,0.1)',
                  color: 'white'
                }}
              >
                🐄 Ganadería
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-3">
        <div className="max-w-2xl w-full mx-auto flex flex-col gap-3">
          {mensajes.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <p className="text-4xl mb-3">
                {canal === 'agricultura' ? '🌾' : '🐄'}
              </p>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Canal de {canal === 'agricultura' ? 'Agricultura' : 'Ganadería'}
              </p>
              <p className="text-xs text-gray-400">
                No hay mensajes aún. ¡Sé el primero!
              </p>
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
                  className="px-4 py-2 rounded-2xl text-sm leading-relaxed"
                  style={
                    msg.autor === autor
                      ? { backgroundColor: '#2D6A4F', color: 'white', borderRadius: '16px 16px 4px 16px' }
                      : { backgroundColor: 'white', color: '#1A1A2E', border: '1px solid #D1FAE5', borderRadius: '16px 16px 16px 4px' }
                  }
                >
                  {msg.contenido}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
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
              placeholder={`Escribe en canal ${canal === 'agricultura' ? 'Agricultura' : 'Ganadería'}...`}
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