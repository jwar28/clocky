# Clocky — Malla Horaria Semanal

Frontend Next.js para gestión y control de la malla horaria semanal del equipo de operaciones logísticas. Implementa el sistema de diseño **Precision Logistics Grid** sobre **Tailwind CSS 3.4** + **shadcn/ui**, con **InsForge** como backend (PostgreSQL + Auth + Storage).

Replica la densidad visual y estructura de la planilla operativa logística: 2 filas de encabezado, columnas por día subdivididas en Inicio/Fin, zebra striping, tipografía monoespaciada para datos horarios.

---

## Stack

- **Next.js 15** (App Router, React 19)
- **TypeScript** estricto (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`)
- **Tailwind CSS 3.4** (locked, sin v4) con tokens del design system
- **shadcn/ui** (Radix) sobreescrito al verde institucional `#009B4D`
- **Zustand** para estado de sesión / staff / horarios (async-only, sin mocks)
- **InsForge SDK** (`@insforge/sdk`) — DB + Auth
- **date-fns** para math de semana (Domingo → Sábado)
- **lucide-react** para iconos

---

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Redirect a `/schedule` |
| `/login` | Login con email + password (InsForge Auth) |
| `/schedule` | Malla horaria semanal (vista principal) |
| `/staff` | Listado de personal con CRUD |
| `/settings` | Info de la app |

---

## Variables de entorno

`.env.example` provee la plantilla para nuevos entornos.

---

## Backend InsForge

### Tablas

- **`staff`** — empleados (`id, full_name, default_site, role, active, created_at, updated_at`)
- **`schedules`** — horarios semanales (`id, staff_id, week_start, days jsonb, ...`)

RLS habilitado: cualquier usuario autenticado puede CRUD; anon puede leer.

### Seed inicial

`scripts/01-schema-and-seed.sql` contiene:
- DDL de tablas + RLS
- 9 empleados (los del adjunto inicial)
- 9 horarios para la semana `2026-07-05` (Domingo 5 → Sábado 11 julio 2026)

Para re-seed (idempotente):

```sql
-- Pegar en consola SQL o vía MCP run-raw-sql
\i scripts/01-schema-and-seed.sql
```

---

## Crear el admin (1 sola vez)

El usuario admin se crea en el dashboard de InsForge, **no** desde esta app:

1. Entra al dashboard de InsForge.
2. **Authentication → Users → Create user**.
3. Email + password.
4. Inicia sesión en `/login` con esas credenciales.

---

## Comandos (todo en WSL con bun)

```bash
bun install        # instala dependencias
bun run dev        # dev server (http://localhost:3000)
bun run build      # build producción
bun run start      # servidor producción
bun run lint       # ESLint
bun run typecheck  # tsc --noEmit
```

> Todo se ejecuta dentro de WSL. Si clonas el proyecto en una máquina nueva:
> ```bash
> curl -fsSL https://bun.sh/install | bash   # instalar bun
> cd clocky && bun install
> bun run dev
> ```

---

## Estructura

```
clocky/
├── app/
│   ├── layout.tsx                       # fonts + toaster
│   ├── globals.css                      # tokens Precision Logistics Grid
│   ├── page.tsx                         # redirect /schedule
│   ├── (auth)/login/page.tsx            # login form
│   └── (dashboard)/
│       ├── layout.tsx                   # AuthGuard + Sidebar
│       ├── schedule/page.tsx            # The Grid
│       ├── staff/page.tsx               # CRUD personal
│       └── settings/page.tsx            # info
├── components/
│   ├── ui/                              # shadcn primitives
│   ├── auth/AuthGuard.tsx
│   ├── layout/{Sidebar,Brand,TopBar,SiteFilter}.tsx
│   ├── schedule/
│   │   ├── ScheduleGrid.tsx
│   │   ├── ScheduleGridHeader.tsx       # 2 filas: día | Inicio/Fin
│   │   ├── ScheduleGridRow.tsx
│   │   ├── ScheduleCell.tsx             # time / chip / amanece
│   │   ├── TimePair.tsx                 # JetBrains Mono, tabular-nums
│   │   ├── StatusChip.tsx               # pill Descanso / Disponible / Amanece
│   │   ├── WeekNavigator.tsx            # ◀ Semana N — Mes Año ▶
│   │   ├── ScheduleEditSheet.tsx        # shadcn Sheet right-side
│   │   ├── EmptyWeekState.tsx
│   │   ├── ScheduleGridSkeleton.tsx
│   │   └── MobileScheduleCards.tsx      # <md: cards expandibles
│   └── staff/StaffDialog.tsx
├── lib/
│   ├── insforge.ts                      # SDK singleton
│   ├── types.ts                         # Staff, DayShift, WeeklySchedule, …
│   ├── constants.ts                     # SEDES_SUGGESTIONS, ROLES_SUGGESTIONS
│   └── utils/{cn,date,format,shift}.ts
├── store/
│   ├── session-store.ts                 # signIn / signOut / hydrate
│   ├── staff-store.ts                   # async CRUD sobre staff
│   ├── schedule-store.ts                # async fetch/upsert por week
│   └── ui-store.ts                      # weekStart, siteFilter
├── scripts/01-schema-and-seed.sql        # DDL + seed
├── middleware.ts                        # InsForge refresh
└── tailwind.config.ts                   # tokens Precision Logistics Grid
```

---

## Sistema de diseño (Precision Logistics Grid)

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#009B4D` | Header día, botones primarios, marca |
| `secondary-container` | `#d9e6da` | Zebra striping |
| `tertiary` | `#805200` / `#f9a825` | "Disponible", turnos noche |
| `ink` | `#111d23` | Texto principal |
| `grid` | `#bdcabb` | Bordes 1px de la grilla |
| `surface` | `#f4faff` | Workspace |
| `Hanken Grotesk` | — | Display / headers de tabla |
| `Inter` | — | UI / labels |
| `JetBrains Mono` | — | Datos horarios / IDs |

Detalles completos en `DESIGN.md`.

---

## Estados visuales

| Estado | Render |
|---|---|
| Loading | `ScheduleGridSkeleton` con `animate-pulse` |
| Error | Banner ámbar + botón "Reintentar" |
| Empty (semana sin datos) | Filas de staff + celdas `—` + CTA "Asignar turnos para esta semana" |
| Auth ausente | Redirect `/login` |
| Sesión expirada | Toast `sonner` + redirect `/login` |

---

## Responsive

| Breakpoint | Comportamiento |
|---|---|
| `≥1280px` | Sidebar 280px fijo, grilla sin scroll horizontal |
| `768–1279px` | Sidebar 64px icon-rail, columnas Personal/Sede sticky, scroll horizontal fluido |
| `<768px` | Cards expandibles por empleado (`MobileScheduleCards`) |

---

## Validación

```bash
bun run lint       # ✓ No ESLint warnings or errors
bun run typecheck  # ✓ TSC_EXIT=0
bun run build      # ✓ Compiled successfully in 14.2s — 8 rutas
```
