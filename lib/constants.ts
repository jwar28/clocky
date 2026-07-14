/**
 * Static constants for the Clocky app.
 * Includes suggested values for free-text fields (sedes, roles).
 */

export const APP_NAME = "Clocky";
export const AREA_LABEL = "Área de Calidad";

/**
 * @deprecated Kept as initial seed only — actual sedes/roles are now
 * managed in the `sites` and `roles` tables (see store/taxonomy-store.ts).
 */
export const SEDES_SUGGESTIONS = [
  "Fontibón",
  "Fontibón-Congelagro",
  "Fontibón-OPL",
  "Fontibón-Noche",
  "Funza",
  "Logika",
  "Sibate",
  "Madrid",
] as const;

/**
 * @deprecated Kept as initial seed only — actual roles are now managed
 * in the `roles` table (see store/taxonomy-store.ts).
 */
export const ROLES_SUGGESTIONS = [
  "Operador Logístico",
  "Operador",
  "Coordinador",
  "Supervisor",
  "Auxiliar",
  "Conductor",
] as const;

/** Week layout — Sunday → Saturday. Index 0 = Domingo, index 6 = Sábado. */
export const WEEK_DAY_LABELS: ReadonlyArray<{ index: 0 | 1 | 2 | 3 | 4 | 5 | 6; short: string; long: string }> = [
  { index: 0, short: "Dom", long: "Domingo" },
  { index: 1, short: "Lun", long: "Lunes" },
  { index: 2, short: "Mar", long: "Martes" },
  { index: 3, short: "Mié", long: "Miércoles" },
  { index: 4, short: "Jue", long: "Jueves" },
  { index: 5, short: "Vie", long: "Viernes" },
  { index: 6, short: "Sáb", long: "Sábado" },
] as const;