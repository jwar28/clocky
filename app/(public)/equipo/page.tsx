import { createClient } from "@insforge/sdk";
import { getWeekStart, todayInBogota } from "@/lib/utils/date";
import { PublicScheduleHydrator, type PublicScheduleInitialData } from "@/components/schedule/PublicScheduleHydrator";
import type { Staff, WeekDays, WeeklySchedule } from "@/lib/types";

export const metadata = {
  title: "Malla Horaria · Equipo",
  description: "Consulta la malla horaria semanal del equipo de operaciones.",
};

export const dynamic = "force-dynamic";

type StaffRow = {
  id: string;
  full_name: string;
  default_site: string | null;
  role: string;
  active: boolean;
  created_at?: string;
};

type SiteRow = { id: string; name: string };

type ScheduleRow = {
  id: string;
  staff_id: string;
  week_start: string;
  days: WeekDays;
  created_at?: string;
};

function mapStaff(row: StaffRow): Staff {
  return {
    id: row.id,
    fullName: row.full_name,
    defaultSite: row.default_site ?? "",
    role: row.role,
    active: row.active,
    createdAt: row.created_at,
  };
}

function mapSchedule(row: ScheduleRow): WeeklySchedule {
  return {
    id: row.id,
    staffId: row.staff_id,
    weekStart: typeof row.week_start === "string" ? row.week_start.slice(0, 10) : String(row.week_start),
    days: row.days,
    createdAt: row.created_at,
  };
}

/**
 * Server Component for /equipo.
 *
 * Fetches staff, sites, and the current week's schedules with the public
 * anon key (RLS allows anon SELECT), then hands the data to the
 * PublicScheduleHydrator client component which populates the Zustand
 * stores on mount. The Server Component itself does NOT touch the
 * Zustand stores because they are "use client" modules and calling their
 * methods server-side throws at runtime.
 */
export default async function EquipoPage() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  const weekStart = getWeekStart(todayInBogota());

  const empty: PublicScheduleInitialData = { weekStart, staff: [], sites: [], schedules: [] };

  if (!baseUrl || !anonKey) {
    return <PublicScheduleHydrator data={empty} />;
  }

  const insforge = createClient({ baseUrl, anonKey });

  const [staffRes, sitesRes, schedulesRes] = await Promise.all([
    insforge.database
      .from("staff")
      .select("id, full_name, default_site, role, active, created_at")
      .order("full_name", { ascending: true }),
    insforge.database.from("sites").select("id, name").order("name", { ascending: true }),
    insforge.database
      .from("schedules")
      .select("id, staff_id, week_start, days, created_at")
      .eq("week_start", weekStart),
  ]);

  if (staffRes.error || sitesRes.error || schedulesRes.error) {
    console.error("[/equipo] SSR fetch error", {
      staff: staffRes.error?.message,
      sites: sitesRes.error?.message,
      schedules: schedulesRes.error?.message,
    });
    return <PublicScheduleHydrator data={empty} />;
  }

  const data: PublicScheduleInitialData = {
    weekStart,
    staff: (staffRes.data ?? []).map((r) => mapStaff(r as unknown as StaffRow)),
    sites: (sitesRes.data ?? []).map((r) => ({
      id: (r as unknown as SiteRow).id,
      name: (r as unknown as SiteRow).name,
    })),
    schedules: (schedulesRes.data ?? []).map((r) => mapSchedule(r as unknown as ScheduleRow)),
  };

  return <PublicScheduleHydrator data={data} />;
}