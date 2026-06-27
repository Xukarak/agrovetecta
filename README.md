# 🌱 AgroVetecta — Documentación Técnica Principal

> Plataforma municipal agropecuaria que conecta agricultores y ganaderos con profesionales del agro y la veterinaria.

---

## 📋 Tabla de contenidos

1. [Visión del producto](#visión-del-producto)
2. [Stack tecnológico](#stack-tecnológico)
3. [Arquitectura del sistema](#arquitectura-del-sistema)
4. [Modelo de datos](#modelo-de-datos)
5. [Roles y permisos](#roles-y-permisos)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Variables de entorno](#variables-de-entorno)
8. [Flujo de despliegue](#flujo-de-despliegue)

---

## Visión del producto

AgroVetecta es una plataforma SaaS municipal que permite a alcaldías, UMATAs y entidades agropecuarias ofrecer servicios digitales a agricultores y ganaderos de su municipio.

### Modelo de negocio

```
Plan Gratuito (sin municipio)
├── Foro general (todos los municipios)
├── Agenda con veterinarias privadas
└── Chat con bot básico (IA) [proyectado v1.4+]

Plan Municipal (con licencia)
├── Todo el plan gratuito +
├── Foro del municipio por categoría (agricultura/ganadería)
├── Chat en tiempo real con profesional asignado
├── Visitas presenciales a finca
├── Profesionales asignados por municipio
└── Panel de administración completo
```

### Propuesta de valor
- Para el agricultor/ganadero: acceso directo a profesionales sin desplazarse
- Para el municipio: digitalización de servicios agropecuarios
- Para la UMATA: gestión centralizada de citas, consultas y seguimiento

---

## Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Frontend | Next.js | 16.x | Framework React con SSR y rutas |
| Estilos | Tailwind CSS | v4 | Utilidades CSS inline |
| Backend | Supabase | - | Base de datos, Auth, Realtime, Storage |
| Base de datos | PostgreSQL | - | Almacenamiento relacional |
| Deploy web | Vercel | - | CI/CD automático desde GitHub |
| Control de versiones | Git + GitHub | - | Repositorio y historial |

### Notas importantes de compatibilidad
- Tailwind v4 usa `@import "tailwindcss"` en globals.css — NO usar `@tailwind base`
- Supabase Auth usa claves **Legacy anon** (formato `eyJ...`) — las nuevas Publishable keys aún no son compatibles con `@supabase/supabase-js`
- Next.js App Router activo — todas las páginas van en `app/`

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────────────┐
│              NAVEGADOR (Cliente)                 │
│  Next.js 16 + Tailwind CSS v4                   │
│  app/ → páginas y componentes React             │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────┐
│              SUPABASE                            │
│  ├── Auth    → sesiones y usuarios              │
│  ├── REST API → CRUD de tablas                  │
│  ├── Realtime → mensajes de chat en vivo        │
│  └── Storage  → fotos y archivos [proyectado]   │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│           POSTGRESQL (Supabase)                  │
│  perfiles | publicaciones | respuestas          │
│  citas | mensajes | municipios [proyectado]     │
└─────────────────────────────────────────────────┘

Deploy:
GitHub (main) → Vercel → agrovetecta.vercel.app
```

---

## Modelo de datos

### Tabla: `perfiles`
Extiende la información de usuarios de Supabase Auth.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int8 | PK autoincremental |
| `usuario_id` | uuid | FK → auth.users.id |
| `nombre` | text | Nombre completo |
| `rol` | text | `agricultor` \| `profesional` \| `admin` |
| `tipo` | text | `agricultor` \| `ganadero` \| `ambos` |
| `especialidad_activa` | text | `agricultura` \| `ganaderia` (para tipo=ambos) |
| `municipio` | text | Municipio de residencia |
| `departamento` | text | Departamento de residencia |
| `estado` | text | `pendiente` \| `activo` \| `inactivo` |
| `cedula` | text | Número de cédula (para verificación de edición) |
| `created_at` | timestamp | Fecha de registro |

### Tabla: `publicaciones`
Posts del foro comunitario.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int8 | PK autoincremental |
| `titulo` | text | Título de la publicación |
| `contenido` | text | Cuerpo del post |
| `autor` | text | Nombre del autor (texto libre — pendiente vincular a usuario_id) |
| `created_at` | timestamp | Fecha de creación |

> ⚠️ **Deuda técnica:** El campo `autor` es texto libre. En v1.5+ se debe agregar `autor_id` (uuid → perfiles.usuario_id) para vincular publicaciones a usuarios reales.

### Tabla: `respuestas`
Respuestas a publicaciones del foro.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int8 | PK autoincremental |
| `contenido` | text | Texto de la respuesta |
| `autor` | text | Nombre del autor (texto libre) |
| `publicacion_id` | int8 | FK → publicaciones.id |
| `created_at` | timestamp | Fecha de creación |

### Tabla: `citas`
Solicitudes de citas virtuales y visitas a finca.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int8 | PK autoincremental |
| `nombre` | text | Nombre del solicitante |
| `tipo` | text | `virtual` \| `visita` |
| `fecha` | date | Fecha solicitada |
| `jornada` | text | `mañana` \| `tarde` |
| `direccion` | text | Dirección (solo para visitas) |
| `notas` | text | Notas adicionales |
| `created_at` | timestamp | Fecha de creación |

> ⚠️ **Deuda técnica:** Falta `usuario_id` y `profesional_id` para vincular citas a usuarios y profesionales reales. Estado de la cita (pendiente/confirmada/cancelada) también pendiente.

### Tabla: `mensajes`
Mensajes del chat en tiempo real.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int8 | PK autoincremental |
| `contenido` | text | Texto del mensaje |
| `autor` | text | Nombre del autor |
| `canal` | text | `agricultura` \| `ganaderia` |
| `created_at` | timestamp | Fecha de creación |

> ⚠️ **Deuda técnica:** Falta `autor_id` para vincular mensajes a usuarios reales.

---

## Roles y permisos

### Usuario común (agricultor/ganadero)
- Estado `pendiente`: acceso solo a `/foro` y `/esperando`
- Estado `activo`: acceso completo a foro, agenda, chat y perfil
- No puede acceder a `/admin`

### Profesional
- Acceso completo a foro, agenda, chat
- En el chat ve el canal de su especialidad
- Creado por el administrador (no se auto-registra)

### Administrador
- Acceso completo incluyendo `/admin`
- Puede aprobar/rechazar usuarios pendientes
- Puede ver todas las citas
- No es bloqueado por control de acceso

### Flujo de estados de cuenta
```
Registro → pendiente → (admin aprueba) → activo
                     → (admin rechaza) → inactivo
```

---

## Estructura del proyecto

```
agrovetecta/
├── app/
│   ├── components/
│   │   ├── Navbar.js          → Barra de navegación global con sesión
│   │   └── ScrollToTop.js     → Scroll al tope al cambiar de página
│   ├── lib/
│   │   └── supabase.js        → Cliente Supabase configurado
│   ├── admin/
│   │   └── page.js            → Panel de administración (solo admins)
│   ├── agenda/
│   │   └── page.js            → Formulario de citas y visitas
│   ├── chat/
│   │   └── page.js            → Chat en tiempo real por canal
│   ├── esperando/
│   │   └── page.js            → Pantalla para usuarios pendientes
│   ├── foro/
│   │   ├── page.js            → Lista de publicaciones
│   │   └── [id]/
│   │       └── page.js        → Detalle de publicación + respuestas
│   ├── login/
│   │   └── page.js            → Formulario de inicio de sesión
│   ├── perfil/
│   │   └── page.js            → Perfil del usuario con edición
│   ├── registro/
│   │   └── page.js            → Registro multi-paso (3 pasos)
│   ├── globals.css            → Estilos globales + import Tailwind v4
│   ├── layout.js              → Layout raíz con Navbar
│   └── page.js                → Landing page
├── .env.local                 → Variables de entorno (NO subir a Git)
├── .gitignore                 → Archivos excluidos de Git
├── next.config.mjs            → Configuración de Next.js
├── package.json               → Dependencias del proyecto
└── postcss.config.mjs         → Configuración PostCSS para Tailwind v4
```

---

## Variables de entorno

Archivo `.env.local` (local) y configuradas en Vercel (producción):

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (clave Legacy anon de Supabase)
```

> ⚠️ NUNCA subir `.env.local` a GitHub. Está en `.gitignore`.

---

## Flujo de despliegue

```
Desarrollo local (localhost:3000)
        ↓
git add . && git commit -m "descripción"
        ↓
git push (rama main o merge desde feature)
        ↓
Vercel detecta el push automáticamente
        ↓
Build y deploy en ~2 minutos
        ↓
agrovetecta.vercel.app actualizado
```

### Flujo de ramas (GitFlow simplificado)
```
main              → producción siempre estable
feature/nombre    → desarrollo de funcionalidades nuevas
fix/nombre        → corrección de bugs
```

### Etiquetas de versión
```bash
git tag -a v1.x.x -m "descripción"
git push origin v1.x.x
```
