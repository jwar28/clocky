---
version: 1
slug: "app-dashboard-schedule-page-tsx"
primary_target: "app/(dashboard)/schedule/page.tsx"
related_targets: ["app/(public)/equipo/page.tsx"]
---

# Surface: Malla horaria (admin /schedule, public /equipo)

Mode: Operate. Audience: admin builds the week on desktop; team consults /equipo, often on phone. Primary job: find one person's shift this week / today. Layout pinned by user: Google Calendar shell (left sidebar with mini calendar + sede filters, top bar Hoy ◀ ▶ range + Día/Semana/Persona switch + search).

## Direction contract

THESIS: Each person's week is one continuous 168-hour lane; shifts are bars on that lane, so a 22:00–05:00 shift crosses midnight as one unbroken bar. Refuses the category default of per-day cells (and Google Calendar's vertical stacks of overlapping events).

OWN-WORLD: Marey train-graph discipline on white. Ink #0F1A14, muted #526158, hairlines #E3E8E5 / day dividers #CFD8D3, 6-hour subticks. Day shifts: pale green fill #DDF2E6 with a 3px #16794A base rule; night shifts: solid indigo #3A47B8 white text; Disponible: dashed amber #C9821A outline; Descanso: quiet text in lane. Brand green #009B4D only for primary action, today, and the "now" line. Overpass, tabular numerals.

STORY: The visitor scans names, follows one lane left to right, reads every shift's HH–HH label directly on its bar, and sees where "now" falls. Admin clicks a bar to edit in the side sheet.

FIRST VIEWPORT: 248px light sidebar (brand, Asignar turnos, mini month with current week band, sede list with counts, legend). 60px top bar. Sticky axis header: day label + date, 0/6/12/18 ticks. 200px name column + timeline; 66px rows; green vertical now-line with time chip; footer stats strip (turnos, nocturnos, horas, en turno ahora).

FORM: Gráfico de marcha (Marey timetable), position 1 on own list (Impeccable's pick, chosen by user over the dealt assignment). seed:bd2d574eef9dd96e

Signature interaction: hovering/focusing a bar highlights that person's lane and shows start–end, duration, sede, note; now-line advances live.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
