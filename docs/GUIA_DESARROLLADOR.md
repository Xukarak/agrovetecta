# 🛠️ AgroVetecta — Guía del Desarrollador

Guía práctica para entender cómo funciona cada parte del proyecto, cómo modificar funciones existentes sin romper nada, y cómo agregar funciones nuevas correctamente.

---

## ⚡ Arrancar el proyecto

```bash
cd ~/Proyectos/agrovetecta
npm run dev
# Abrir http://localhost:3000
```

---

## 🗂️ Cómo está organizado el código

### La regla más importante de Next.js App Router
```
app/nombre-ruta/page.js → accesible en localhost:3000/nombre-ruta
```

Ejemplos:
```
app/page.js              → localhost:3000/
app/foro/page.js         → localhost:3000/foro
app/foro/[id]/page.js    → localhost:3000/foro/cualquier-numero
app/admin/page.js        → localhost:3000/admin
```

### Tipos de componentes
```
'use client'   → componente interactivo (useState, eventos, useEffect)
Sin directiva  → componente de servidor (puede ser async, carga datos directo)
```

---

## 🔌 Cómo conectar con Supabase

Siempre importar desde el cliente configurado:

```javascript
import { supabase } from '../lib/supabase'
// o desde subcarpetas:
import { supabase } from '../../lib/supabase'
```

### Operaciones básicas

**Leer datos:**
```javascript
const { data, error } = await supabase
  .from('nombre_tabla')
  .select('*')
  .eq('campo', valor)
  .order('created_at', { ascending: false })
```

**Insertar:**
```javascript
const { error } = await supabase
  .from('nombre_tabla')
  .insert([{ campo1: valor1, campo2: valor2 }])
```

**Actualizar:**
```javascript
const { error } = await supabase
  .from('nombre_tabla')
  .update({ campo: nuevo_valor })
  .eq('id', id_registro)
```

**Un solo registro:**
```javascript
const { data } = await supabase
  .from('nombre_tabla')
  .select('*')
  .eq('id', id)
  .single()  // devuelve objeto, no array
```

**Obtener sesión activa:**
```javascript
const { data: { session } } = await supabase.auth.getSession()
if (!session) { /* no hay usuario logueado */ }
const userId = session.user.id
const nombre = session.user.user_metadata?.nombre
```

---

## 🔐 Cómo funciona el control de acceso

### Verificación estándar en páginas protegidas

```javascript
useEffect(() => {
  async function verificarAcceso() {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      return
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('estado, rol')
      .eq('usuario_id', session.user.id)
      .single()

    if (!perfil || (perfil.estado === 'pendiente' && perfil.rol !== 'admin')) {
      router.push('/esperando')
      return
    }

    setVerificando(false)
  }
  verificarAcceso()
}, [])
```

### Patrón para evitar flash de contenido

```javascript
// Estado
const [verificando, setVerificando] = useState(true)

// Al inicio del return, ANTES del contenido principal:
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
```

> ⚠️ **Regla:** Toda página que requiera usuario activo debe tener este patrón. Si agregas una página nueva y no la incluyes, cualquier usuario pendiente podrá acceder.

---

## 📡 Cómo funciona el Chat Realtime

```javascript
// 1. Cargar mensajes iniciales
const { data } = await supabase
  .from('mensajes')
  .select('*')
  .eq('canal', canal)
  .order('created_at', { ascending: true })

// 2. Suscribirse a mensajes nuevos
const suscripcion = supabase
  .channel(`chat-${canal}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'mensajes',
    filter: `canal=eq.${canal}`
  }, (payload) => {
    setMensajes((prev) => [...prev, payload.new])
  })
  .subscribe()

// 3. Limpiar al desmontar
return () => supabase.removeChannel(suscripcion)
```

> ⚠️ La tabla `mensajes` debe tener Realtime activado en Supabase → Table Editor → Edit table → Enable Realtime.

---

## 🎨 Cómo usar los colores del sistema

AgroVetecta tiene una paleta definida. Siempre usar estos valores:

```javascript
// En style={{ }} cuando Tailwind no tiene la clase exacta:
style={{ backgroundColor: '#1B4332' }}  // Verde oscuro (navbar, botones primarios)
style={{ backgroundColor: '#2D6A4F' }}  // Verde medio (botones secundarios, chat propio)
style={{ backgroundColor: '#52B788' }}  // Verde claro (highlights, badges)
style={{ backgroundColor: '#F8FAF9' }}  // Fondo general

// En className con Tailwind (aproximaciones):
bg-green-900   // similar a #1B4332
bg-green-700   // similar a #2D6A4F
bg-green-500   // similar a #52B788
bg-green-50    // fondo claro
```

---

## 📦 Cómo agregar una nueva página

1. Crear carpeta en `app/`:
```
app/nueva-pagina/page.js
```

2. Estructura base con control de acceso:
```javascript
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function NuevaPagina() {
  const [verificando, setVerificando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function verificarAcceso() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: perfil } = await supabase
        .from('perfiles')
        .select('estado, rol')
        .eq('usuario_id', session.user.id)
        .single()

      if (!perfil || (perfil.estado === 'pendiente' && perfil.rol !== 'admin')) {
        router.push('/esperando')
        return
      }

      setVerificando(false)
    }
    verificarAcceso()
  }, [])

  if (verificando) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-green-200 border-t-green-700 animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-green-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Tu contenido aquí */}
      </div>
    </main>
  )
}
```

3. Agregar el link en la Navbar si es necesario (`app/components/Navbar.js`).

---

## 📊 Cómo agregar una columna a una tabla

1. Ir a Supabase → Table Editor → seleccionar tabla → clic en "+" para agregar columna
2. Definir nombre, tipo y valor por defecto
3. Actualizar el código que inserta en esa tabla para incluir el nuevo campo
4. Documentar el cambio en `CHANGELOG.md`

---

## 🔀 Flujo de trabajo con Git

```bash
# Crear rama para nueva funcionalidad
git checkout -b feature/nombre-descriptivo

# Trabajar, guardar avances frecuentemente
git add .
git commit -m "feat: descripción concisa"

# Cuando está lista y probada, fusionar a main
git checkout main
git merge feature/nombre-descriptivo
git push

# Etiquetar versión
git tag -a v1.x.x -m "descripción de la versión"
git push origin v1.x.x
```

### Convención de commits
```
feat:  nueva funcionalidad
fix:   corrección de bug
style: cambios visuales sin lógica
docs:  cambios en documentación
refactor: reorganización de código sin cambiar comportamiento
```

---

## 🐛 Problemas comunes y soluciones

### Estilos no se ven en producción (Vercel)
**Causa:** Cache viejo o incompatibilidad de Tailwind v4
**Solución:**
```bash
rm -rf .next
git commit --allow-empty -m "fix: forzar redeploy limpio"
git push
```
Verificar que `globals.css` empiece con `@import "tailwindcss"` (v4).

### La sesión no se encuentra en el servidor
**Causa:** El cliente de Supabase (`lib/supabase.js`) es para el navegador, no para middleware de servidor
**Solución:** Usar verificación de sesión directamente en componentes con `'use client'`, no en middleware.

### Realtime no actualiza mensajes
**Causa:** La tabla no tiene Realtime activado en Supabase
**Solución:** Supabase → Table Editor → Edit table `mensajes` → activar Realtime toggle.

### Error "Cannot access variable before it is declared"
**Causa:** Una función async se llama dentro de `useEffect` antes de ser declarada
**Solución:** Declarar la función async DENTRO del `useEffect`:
```javascript
useEffect(() => {
  async function miFuncion() { ... } // ← declarar adentro
  miFuncion()
}, [])
```

### Usuario ve página antes de ser redirigido (flash)
**Causa:** La verificación de acceso es async y tarda unos milisegundos
**Solución:** Usar estado `verificando` con spinner (ver patrón arriba).

---

## 📝 Checklist antes de hacer push a main

- [ ] Probé la funcionalidad en localhost
- [ ] Probé con usuario pendiente (no debe acceder a páginas protegidas)
- [ ] Probé con usuario activo (debe acceder normalmente)
- [ ] Probé con admin (debe acceder a todo incluyendo /admin)
- [ ] No hay errores en la consola del navegador
- [ ] El commit tiene un mensaje descriptivo
- [ ] Documenté el cambio en CHANGELOG.md si es significativo
