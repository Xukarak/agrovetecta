import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default async function Perfil() {
  const { data: publicaciones } = await supabase
    .from('publicaciones')
    .select('*')
    .order('created_at', { ascending: false })

  const autores = [...new Set(publicaciones?.map(p => p.autor) || [])]

  return (
    <main className="min-h-screen bg-green-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">
        
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          👤 Comunidad AgroVetecta
        </h1>
        <p className="text-gray-500 mb-8">
          Miembros que han participado en el foro
        </p>

        <div className="flex flex-col gap-3">
          {autores.map((autor) => {
            const total = publicaciones.filter(p => p.autor === autor).length
            return (
              <div
                key={autor}
                className="bg-white rounded-2xl p-5 shadow-sm border border-green-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 text-green-800 font-bold text-xl rounded-full w-12 h-12 flex items-center justify-center">
                    {autor.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">{autor}</p>
                    <p className="text-xs text-gray-400">{total} publicación{total !== 1 ? 'es' : ''}</p>
                  </div>
                </div>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                  Agricultor
                </span>
              </div>
            )
          })}
        </div>

      </div>
    </main>
  )
}