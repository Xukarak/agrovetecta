import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8FAF9' }}>

      {/* Hero */}
      <section
        style={{ backgroundColor: '#1B4332' }}
        className="relative overflow-hidden px-6 py-32 text-center text-white"
      >
        {/* Círculos decorativos de fondo */}
        <div
          style={{ backgroundColor: '#2D6A4F', opacity: 0.4 }}
          className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full"
        />
        <div
          style={{ backgroundColor: '#2D6A4F', opacity: 0.3 }}
          className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full"
        />

        <div className="relative max-w-3xl mx-auto">
          <span
            style={{ backgroundColor: '#52B788', color: '#1B4332' }}
            className="inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase"
          >
            Plataforma Municipal Agropecuaria
          </span>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            El campo conectado
            <br />
            <span style={{ color: '#52B788' }}>con los expertos</span>
          </h1>

          <p className="text-lg text-green-200 mb-10 max-w-xl mx-auto leading-relaxed">
            Consultas veterinarias, asesoría agrícola, visitas a tu finca y
            comunidad campesina — todo en un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registro"
              style={{ backgroundColor: '#52B788' }}
              className="text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              Crear cuenta gratis →
            </Link>
            <Link
              href="/foro"
              className="text-white font-semibold px-8 py-4 rounded-xl border border-green-600 hover:bg-white/10 transition-colors text-sm"
            >
              Explorar la comunidad
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { numero: '100%', label: 'Gratuito' },
            { numero: '24/7', label: 'Disponible' },
            { numero: '🌱', label: 'Para el campo' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
              <p style={{ color: '#1B4332' }} className="text-3xl font-bold mb-1">
                {stat.numero}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Módulos */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 style={{ color: '#1B4332' }} className="text-2xl font-bold mb-2">
          Todo lo que necesitas
        </h2>
        <p className="text-gray-500 mb-8 text-sm">
          Cuatro módulos diseñados para conectar el campo con los profesionales
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              href: '/foro',
              emoji: '📸',
              titulo: 'Foro comunitario',
              desc: 'Comparte fotos de tus cultivos o animales. Recibe respuestas de la comunidad y profesionales.',
              tag: 'Comunidad'
            },
            {
              href: '/agenda',
              emoji: '📅',
              titulo: 'Agenda de citas',
              desc: 'Solicita citas virtuales o visitas presenciales del agrónomo o veterinario a tu finca.',
              tag: 'Servicios'
            },
            {
              href: '/chat',
              emoji: '💬',
              titulo: 'Chat en vivo',
              desc: 'Habla en tiempo real con el profesional en turno. Respuestas rápidas a tus preguntas urgentes.',
              tag: 'Tiempo real'
            },
            {
              href: '/perfil',
              emoji: '👤',
              titulo: 'Tu perfil',
              desc: 'Gestiona tus publicaciones, citas agendadas y tu historial de consultas en un solo lugar.',
              tag: 'Personal'
            },
          ].map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md hover:border-green-300 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{mod.emoji}</span>
                <span
                  style={{ backgroundColor: '#F0FDF4', color: '#2D6A4F' }}
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                >
                  {mod.tag}
                </span>
              </div>
              <h3 style={{ color: '#1B4332' }} className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">
                {mod.titulo}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{mod.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section
        style={{ backgroundColor: '#1B4332' }}
        className="px-6 py-16 text-center text-white"
      >
        <h2 className="text-3xl font-bold mb-4">
          ¿Listo para conectar tu finca?
        </h2>
        <p className="text-green-300 mb-8 max-w-md mx-auto text-sm">
          Únete a la comunidad agropecuaria de tu municipio. Es gratis y solo toma un minuto.
        </p>
        <Link
          href="/registro"
          style={{ backgroundColor: '#52B788' }}
          className="text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity text-sm inline-block"
        >
          Comenzar ahora →
        </Link>
      </section>

    </main>
  )
}