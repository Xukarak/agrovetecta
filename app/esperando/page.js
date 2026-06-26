import Link from 'next/link'

export default function Esperando() {
  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-10 shadow-sm border border-green-100 w-full max-w-md text-center">
        
        <p className="text-5xl mb-4">⏳</p>
        <h1 className="text-2xl font-bold text-green-800 mb-3">
          Solicitud en revisión
        </h1>
        <p className="text-gray-500 text-sm mb-2 leading-relaxed">
          Tu cuenta está siendo revisada por el administrador de tu municipio.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Recibirás acceso completo una vez que sea aprobada.
        </p>

        <div
          className="rounded-xl p-4 mb-6 text-sm"
          style={{ backgroundColor: '#F0FDF4', border: '1px solid #A7F3D0' }}
        >
          <p className="text-green-700 font-medium">¿Qué puedes hacer mientras?</p>
          <p className="text-green-600 text-xs mt-1">
            Explorar el foro general de la comunidad
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/foro"
            style={{ backgroundColor: '#1B4332' }}
            className="text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Ver foro general
          </Link>
          <Link
            href="/login"
            className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            Cerrar sesión
          </Link>
        </div>

      </div>
    </main>
  )
}