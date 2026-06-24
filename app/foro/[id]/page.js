import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default async function DetallePublicacion({ params }) {
  const { id } = await params

  const { data: pub, error } = await supabase
    .from('publicaciones')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !pub) {
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
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-green-800 mb-4">
            {pub.titulo}
          </h1>
          <p className="text-gray-600 leading-relaxed">
            {pub.contenido}
          </p>

        </div>

        {/* Sección de respuestas — próximamente */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
          <h2 className="text-lg font-bold text-green-800 mb-2">
            💬 Respuestas
          </h2>
          <p className="text-gray-400 text-sm">
            Las respuestas de profesionales estarán disponibles pronto.
          </p>
        </div>

      </div>
    </main>
  )
}