# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Admin / coordinator (Área de Calidad):** builds and maintains the weekly schedule on desktop. Assigns shifts, marks rest/available/night-carryover days, writes per-day observations, locks days against bulk edits, exports to Excel.
- **Team members (operators):** consult the published schedule at `/equipo`, often from a phone, to find their own shift.

## Product Purpose

Clocky replaces the logistics team's spreadsheet "malla horaria" with a live weekly schedule (Sunday → Saturday) backed by InsForge. Success: the admin can build a week quickly and anyone can answer "what shift does this person have this week / today?" at a glance.

## Positioning

A schedule shaped around the team's real operating vocabulary (sedes, roles, "Descanso", "Disponible", "Amanece turno noche", observations, locked days) rather than a generic calendar.

## Operating Context

- Weeks run Sunday → Saturday; one schedule row per staff member per week.
- Shifts cross midnight (e.g. 22:00–05:00); the next day can be "Amanece turno noche".
- Staff belong to a sede (site, e.g. Fontibón, Funza, Logika, Sibate, Madrid) and a role; the grid can be filtered by sede.
- Excel export is part of the workflow (the schedule is shared outside the app).

## Capabilities and Constraints

- Routes: `/login`, `/schedule` (admin grid), `/staff` (CRUD), `/settings` (sedes/roles taxonomy), `/equipo` (public read-only).
- Shift types: `time` (start/end), `rest` (Descanso), `available` (Disponible), `nightIn` (Amanece turno noche). Each day may carry a note and a lock.
- Stack: Next.js 15, React 19, Tailwind CSS 3.4 (locked, no v4), shadcn/ui (Radix), Zustand, InsForge SDK, date-fns, lucide-react.
- UI language: Spanish (es-CO).
- Primary question the schedule must answer fastest: **one person's shift** (this week / today). Daily coverage is secondary.

## Brand Commitments

- Name: Clocky. Area label: "Área de Calidad".
- Institutional green `#009B4D` must be kept. Everything else visual is open.

## Evidence on Hand

- Seed data: 9 staff with realistic weekly patterns in `scripts/01-schema-and-seed.sql`.
- No testimonials, metrics, or customer claims exist; do not fabricate them.

## Product Principles

1. A person's week must be readable in one glance; finding "my shift" beats every other view.
2. Use the team's own vocabulary and states exactly; never genericize them.
3. Editing is fast for the admin, reading is effortless for everyone else.
4. Overnight shifts and their carryover days must never be ambiguous.
