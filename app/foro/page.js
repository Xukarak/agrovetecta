import { supabase } from '../lib/supabase'

export default async function Foro() {
  const { data: publicaciones, error } = await supabase
    .from('publicaciones')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return <p>Error cargando publicaciones</p>
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

        <div className="flex flex-col gap-4">
          {publicaciones.map((pub) => (
            <div 
              key={pub.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-green-100"
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
            </div>
          ))}
        </div>
      </div>

    </main>
  )
}