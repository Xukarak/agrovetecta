'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Agenda() {
  const [tipo, setTipo] = useState('virtual')
  const [nombre, setNombre] = useState('')
  const [fecha, setFecha] = useState('')
  const [jornada, setJornada] = useState('mañana')
  const [direccion, setDireccion] = useState('')
  const [notas, setNotas] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nombre || !fecha) return

    setEnviando(true)
    const { error } = await supabase
      .from('citas')
      .insert([{ nombre, tipo, fecha, jornada, direccion, notas }])

    if (!error) {
      setNombre('')
      setFecha('')
      setDireccion('')
      setNotas('')
      setExito(true)
      setTimeout(() => setExito(false), 4000)
    }
    setEnviando(false)
  }

  return (
    <main className="min-h-screen bg-green-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold text-green-800 mb-2">
          📅 Agenda AgroVetecta
        </h1>
        <p className="text-gray-500 mb-8">
          Solicita una cita virtual o una visita a tu finca
        </p>

        {/* Selector de tipo */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setTipo('virtual')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
              tipo === 'virtual'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-green-400'
            }`}
          >
            💻 Cita Virtual
          </button>
          <button
            onClick={() => setTipo('visita')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
              tipo === 'visita'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-green-400'
            }`}
          >
            🚜 Visita a Finca
          </button>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">

          {exito && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              ✅ Tu solicitud fue enviada exitosamente. Pronto te contactaremos.
            </div>
          )}

          <h2 className="text-lg font-bold text-green-800 mb-6">
            {tipo === 'virtual' ? '💻 Solicitar cita virtual' : '🚜 Solicitar visita a finca'}
          </h2>

          <div className="flex flex-col gap-4">

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Tu nombre completo
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
                Fecha solicitada
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:border-green-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Jornada preferida
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setJornada('mañana')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    jornada === 'mañana'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-green-300'
                  }`}
                >
                  🌅 Mañana
                </button>
                <button
                  onClick={() => setJornada('tarde')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    jornada === 'tarde'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-green-300'
                  }`}
                >
                  🌇 Tarde
                </button>
              </div>
            </div>

            {tipo === 'visita' && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Dirección de la finca
                </label>
                <input
                  type="text"
                  placeholder="Ej: Vereda El Progreso, km 3 vía Curumaní"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Notas adicionales (opcional)
              </label>
              <textarea
                placeholder="Describe brevemente el motivo de tu consulta..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={enviando}
              className="bg-green-700 text-white font-semibold py-3 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50 mt-2"
            >
              {enviando ? 'Enviando solicitud...' : 'Enviar solicitud'}
            </button>

          </div>
        </div>

      </div>
    </main>
  )
}