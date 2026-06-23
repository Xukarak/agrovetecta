import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-green-50">

      {/* Hero Section */}
      <section className="bg-green-800 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">
          🌱 AgroVetecta
        </h1>
        <p className="text-xl text-green-200 mb-8 max-w-2xl mx-auto">
          Conecta tu finca con profesionales del agro y la veterinaria. 
          Consultas, visitas y comunidad en un solo lugar.
        </p>
        <Link 
          href="/foro" 
          className="bg-white text-green-800 font-bold px-8 py-3 rounded-full hover:bg-green-100 transition-colors"
        >
          Explorar la comunidad →
        </Link>
      </section>

      {/* Módulos */}
      <section className="max-w-5xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link href="/foro" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-green-100">
          <div className="text-4xl mb-4">📸</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Foro</h2>
          <p className="text-gray-500 text-sm">
            Comparte fotos de tus cultivos o animales y recibe respuestas de la comunidad.
          </p>
        </Link>

        <Link href="/agenda" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-green-100">
          <div className="text-4xl mb-4">📅</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Agenda</h2>
          <p className="text-gray-500 text-sm">
            Solicita una cita virtual o programa una visita del profesional a tu finca.
          </p>
        </Link>

        <Link href="/chat" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-green-100">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Chat</h2>
          <p className="text-gray-500 text-sm">
            Habla en tiempo real con un profesional disponible en turno.
          </p>
        </Link>

      </section>

    </main>
  )
}