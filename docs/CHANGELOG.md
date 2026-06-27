# 📋 AgroVetecta — Changelog (Historial de versiones)

Registro completo de cambios por versión, incluyendo funciones nuevas, ajustes no planificados y deudas técnicas identificadas.

---

## v1.5.0 — Fotos en foro, likes y autor_id vinculado
**Fecha:** Junio 2026
**Rama:** `feature/mejoras-datos-foro`

### ✅ Funciones nuevas
- **Fotos en publicaciones del foro**
  - Los usuarios pueden adjuntar una foto al crear una publicación
  - Preview de la foto antes de publicar con opción de quitar
  - Las fotos se almacenan en Supabase Storage (bucket `fotos-foro`)
  - La URL pública se guarda en `publicaciones.foto_url`
  - Las fotos se muestran en el feed del foro y en el detalle de la publicación
  - Archivos: `app/foro/page.js`, `app/foro/[id]/page.js`

- **Sistema de likes**
  - Botón de like (🤍/❤️) en cada publicación del foro
  - Contador de likes visible en el feed y en el detalle
  - Un usuario solo puede dar like una vez por publicación
  - El like se puede quitar haciendo clic de nuevo
  - Funciona tanto en el feed como dentro del detalle de la publicación
  - Archivos: `app/foro/page.js`, `app/foro/[id]/page.js`

- **Vinculación de publicaciones a usuario real (`autor_id`)**
  - Al publicar, se guarda el `autor_id` (uuid del usuario en Supabase Auth)
  - El nombre del autor se obtiene automáticamente del perfil — campo de nombre no editable
  - El perfil ahora busca publicaciones por `autor_id` en lugar de por nombre de texto
  - Archivos: `app/foro/page.js`, `app/perfil/page.js`

- **Vinculación de respuestas a usuario real (`autor_id`)**
  - Al responder, se guarda el `autor_id`
  - El nombre del autor se obtiene automáticamente del perfil
  - Campo de nombre no editable cuando hay sesión activa
  - Archivo: `app/foro/[id]/page.js`

### 🔧 Cambios no planificados
- **Supabase Storage RLS requirió políticas SQL manuales**
  - Las políticas creadas desde la interfaz de Supabase no funcionaron correctamente
  - Se crearon mediante SQL Editor con `CREATE POLICY` directamente en `storage.objects`
  - Las políticas de interfaz pueden interferir — verificar desde SQL si hay problemas

- **Botón de like dentro de `<Link>` no funcionaba**
  - El componente `<Link>` de Next.js interceptaba el clic antes que el botón
  - Solución: separar la tarjeta en dos bloques — `<Link>` para el contenido y `<div>` separado para el like fuera del Link

- **Campo `foto_url` agregado a tabla `publicaciones`**
  - Tipo `text`, valor por defecto vacío
  - Almacena la URL pública de Supabase Storage

- **Campo `autor_id` agregado a tablas `publicaciones` y `respuestas`**
  - Tipo `uuid`, vinculado a `auth.users.id`
  - Las publicaciones anteriores tienen `autor_id = null` — no afecta el funcionamiento

### ⚠️ Deudas técnicas identificadas
- Las publicaciones antiguas (anteriores a v1.5.0) tienen `autor_id = null`
- No hay límite de tamaño para las fotos subidas
- No hay validación de tipo de archivo más allá de `accept="image/*"`
- El perfil aún busca citas por nombre de texto — pendiente vincular con `usuario_id`
- No hay forma de eliminar una publicación desde la app

---

## v1.4.0 — Perfil editable y selector de especialidad
**Fecha:** Junio 2026
**Rama:** `feature/mejoras-perfil-admin`

### ✅ Funciones nuevas
- **Edición de perfil con verificación de cédula**
  - El usuario puede editar nombre, tipo de actividad, municipio y departamento
  - Requiere ingresar número de cédula antes de editar
  - Si ya tiene cédula registrada, verifica que coincida
  - Si es la primera vez, la guarda para futuras verificaciones
  - Archivo: `app/perfil/page.js`

- **Selector de especialidad activa para usuarios "ambos"**
  - Usuarios con tipo `ambos` pueden elegir si entran al canal de agricultura o ganadería
  - La selección se guarda en `perfiles.especialidad_activa`
  - El chat usa este campo para determinar qué canal mostrar
  - Archivos: `app/perfil/page.js`, `app/chat/page.js`

- **Fix: eliminación de flash de contenido en páginas protegidas**
  - Antes: el usuario veía brevemente el contenido de agenda/chat antes de ser redirigido
  - Ahora: se muestra un spinner de carga mientras se verifica el acceso
  - Archivos: `app/agenda/page.js`, `app/chat/page.js`

### 🔧 Cambios no planificados
- **Campo `especialidad_activa` agregado a tabla `perfiles`**
  - Surgió de la necesidad de que usuarios "ambos" pudieran cambiar de canal sin perder su tipo original
  - Valor por defecto: `agricultura`

- **Campo `cedula` agregado a tabla `perfiles`**
  - Surgió de la decisión de agregar verificación de identidad para edición de perfil

### ⚠️ Deudas técnicas identificadas
- El campo `cedula` no se pide en el registro — se agrega solo cuando el usuario edita por primera vez. Considerar agregarlo en el registro en v1.5+
- No hay validación de formato de cédula (solo texto libre)

---

## v1.3.0 — Chat por especialidad y control de acceso
**Fecha:** Junio 2026
**Rama:** `feature/chat-especialidad`

### ✅ Funciones nuevas
- **Chat separado por canal (agricultura / ganadería)**
  - Usuarios tipo `agricultor` entran automáticamente al canal de agricultura
  - Usuarios tipo `ganadero` entran al canal de ganadería
  - Usuarios tipo `ambos` y admins pueden cambiar entre canales
  - Realtime funciona por canal independiente
  - Archivos: `app/chat/page.js`

- **Control de acceso por estado de cuenta**
  - Usuarios con estado `pendiente` son redirigidos a `/esperando` cuando intentan acceder a agenda o chat
  - Página `/esperando` muestra mensaje explicativo y acceso al foro general
  - Archivos: `app/agenda/page.js`, `app/chat/page.js`, `app/esperando/page.js`

### 🔧 Cambios no planificados
- **Campo `canal` agregado a tabla `mensajes`**
  - Necesario para separar mensajes por especialidad
  - Valor por defecto: `agricultura`

- **Middleware descartado, control de acceso por página**
  - Se intentó implementar middleware con `@supabase/ssr` pero no encontraba la sesión correctamente por incompatibilidad con el cliente configurado
  - Se optó por verificación directa en cada página protegida
  - Deuda técnica: si se agrega una página nueva y se olvida la verificación, quedará desprotegida

- **Librería `@supabase/ssr` instalada pero no en uso activo**
  - Se instaló para el middleware pero no se usa. Se puede desinstalar si no se migra a SSR.

### ⚠️ Deudas técnicas identificadas
- Control de acceso no centralizado — cada página protegida verifica por su cuenta
- No hay indicador visual de qué profesional está en turno en el chat
- Los mensajes del chat no tienen `autor_id` — no se puede vincular a usuarios reales

---

## v1.2.0 — Panel de administración
**Fecha:** Junio 2026
**Rama:** `feature/panel-admin`

### ✅ Funciones nuevas
- **Panel de administración en `/admin`**
  - Solo accesible para usuarios con `rol = admin`
  - Dashboard con estadísticas: total de usuarios, citas, publicaciones
  - Tab "Pendientes": lista de usuarios esperando aprobación con botones Aprobar/Rechazar
  - Tab "Citas": lista de todas las citas agendadas
  - Archivos: `app/admin/page.js`

- **Protección de ruta `/admin`**
  - Si no hay sesión → redirige a `/login`
  - Si hay sesión pero no es admin → redirige a `/`

### 🔧 Cambios no planificados
- **Asignación manual de rol admin en Supabase**
  - No hay flujo de registro para admins — se asigna manualmente en Table Editor
  - Deuda técnica: crear flujo de invitación para admins

### ⚠️ Deudas técnicas identificadas
- Panel admin no muestra lista de usuarios activos (solo pendientes)
- No se puede cambiar el rol de un usuario desde el panel
- No hay paginación para listas largas de usuarios o citas

---

## v1.1.0 — Roles y registro multi-paso
**Fecha:** Junio 2026
**Rama:** `feature/roles-usuarios`

### ✅ Funciones nuevas
- **Registro multi-paso (3 pasos)**
  - Paso 1: datos personales (nombre, email, contraseña)
  - Paso 2: tipo de actividad (agricultor / ganadero / ambos)
  - Paso 3: ubicación (departamento + municipio)
  - Indicador visual de progreso con pasos numerados
  - Al completar: cierra sesión automática (usuario queda pendiente)
  - Archivos: `app/registro/page.js`

- **Tabla `perfiles` en Supabase**
  - Al registrarse se crea automáticamente un perfil con estado `pendiente`
  - Vinculado a Supabase Auth via `usuario_id`

- **Lista de departamentos y municipios**
  - Hardcodeada en el registro con 5 departamentos: Cesar, Magdalena, Bolívar, Córdoba, Sucre
  - Al cambiar departamento se resetea el municipio automáticamente

### 🔧 Cambios no planificados
- **Sesión automática después del registro**
  - Supabase inicia sesión automáticamente al confirmar email
  - Se agregó `supabase.auth.signOut()` al final del registro para evitarlo

- **Indicador de pasos centrado**
  - El indicador inicial usaba `flex-1` que lo expandía al ancho total
  - Se corrigió usando `w-16` fijo en los separadores y `justify-center` en el contenedor

### ⚠️ Deudas técnicas identificadas
- La lista de municipios es estática — no viene de una tabla en Supabase
- No hay validación de formato de email o contraseña más allá de longitud mínima
- No hay flujo para recuperar contraseña olvidada

---

## v1.0.0 — Base funcional
**Fecha:** Junio 2026
**Rama:** `main`

### ✅ Funciones incluidas

- **Landing page** — hero section, estadísticas, cards de módulos, CTA final
- **Foro comunitario**
  - Lista de publicaciones ordenadas por fecha (más reciente primero)
  - Formulario para crear publicaciones (nombre, título, contenido)
  - Página de detalle de publicación con respuestas
  - Formulario para responder publicaciones
  - Relación entre tablas: `publicaciones` → `respuestas` via `publicacion_id`
- **Agenda**
  - Formulario de cita virtual
  - Formulario de visita a finca (con campo de dirección condicional)
  - Selector de jornada (mañana/tarde)
  - Mensaje de éxito con timeout de 4 segundos
- **Chat en tiempo real**
  - Mensajes instantáneos con Supabase Realtime
  - Diferenciación visual entre mensajes propios y ajenos
  - Input fijo en la parte inferior
  - Auto-scroll al último mensaje
- **Autenticación**
  - Registro con email y contraseña
  - Login con redirección al inicio
  - Cierre de sesión
  - Navbar muestra nombre del usuario conectado
- **Perfil básico**
  - Muestra nombre, email y badge de rol
  - Estadísticas de publicaciones y citas
  - Lista de publicaciones propias
  - Lista de citas propias
- **Navbar global**
  - Logo con link al inicio
  - Links a Foro, Agenda, Chat
  - Estado de sesión (nombre del usuario o botón Ingresar)
  - Indicador de página activa
- **ScrollToTop** — al navegar entre páginas vuelve al tope automáticamente
- **Deploy en Vercel** — `agrovetecta.vercel.app`

### 🔧 Decisiones técnicas tomadas
- **Web primero, mobile después** — empezar con Next.js web para iterar rápido
- **Supabase como backend completo** — evitar configurar servidor propio
- **Tailwind CSS v4** — con `@import "tailwindcss"` en globals.css
- **Clave Legacy anon de Supabase** — las nuevas Publishable keys no son compatibles aún

---

## 📅 Próximas versiones planificadas

### v1.5.0 — Mejoras de datos y foro mejorado
- Vincular publicaciones y citas a `usuario_id` real
- Subir fotos en el foro (Supabase Storage)
- Categorías en el foro (agricultura / ganadería)
- Agregar cédula en el registro

### v1.6.0 — Panel admin completo
- Ver y gestionar usuarios activos
- Cambiar rol de usuarios (agricultor → profesional)
- Estados de citas (pendiente / confirmada / cancelada)
- Asignar citas a profesionales

### v1.7.0 — Profesionales y turnos
- Indicador de profesional en turno en el chat
- Perfil público del profesional
- Gestión de disponibilidad horaria

### v2.0.0 — Plataforma completa
- Sistema de municipios y licencias
- Plan gratuito vs plan municipal
- Bot básico con IA para plan gratuito
- App móvil con React Native
- Notificaciones push
- Panel de analytics para municipios
