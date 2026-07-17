import { createClient } from "@insforge/sdk";
import { getWeekStart, todayInBogota } from "@/lib/utils/date";
import { PublicScheduleView } from "@/components/schedule/PublicScheduleView";
import { useStaffStore } from "@/store/staff-store";
import { useScheduleStore } from "@/store/schedule-store";
import { useUiStore } from "@/store/ui-store";
import { useSitesStore } from "@/store/taxonomy-store";
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
 * anon key (RLS allows anon SELECT), then synchronously populates the
 * Zustand stores before rendering PublicScheduleView. This guarantees the
 * HTML response already contains the schedule grid — no client-side fetch
 * round-trip, no skeleton flash.
 */
export default async function EquipoPage() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  const weekStart = getWeekStart(todayInBogota());

  // Always set the weekStart so the client view starts on the right week.
  useUiStore.setState({ weekStart });

  if (!baseUrl || !anonKey) {
    // Env vars missing — render with empty stores; client will surface the error.
    return <PublicScheduleView />;
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
    return <PublicScheduleView />;
  }

  const staff = (staffRes.data ?? []).map((r) => mapStaff(r as unknown as StaffRow));
  const sites = (sitesRes.data ?? []).map((r) => ({ id: (r as unknown as SiteRow).id, name: (r as unknown as SiteRow).name }));
  const schedules = (schedulesRes.data ?? []).map((r) => mapSchedule(r as unknown as ScheduleRow));

  // Pre-populate the client stores so the initial SSR render already has the data.
  // Zustand stores are module-level singletons; this is safe because we set
  // fetched=true so subsequent client useEffects skip redundant fetches, and
  // any concurrent request overwrites with its own fresh fetch.
  useStaffStore.setState({ staff, fetched: true, loading: false, error: null });
  useSitesStore.setState({ items: sites, fetched: true, loading: false, error: null });
  useScheduleStore.setState((s) => ({
    byWeek: { ...s.byWeek, [weekStart]: schedules },
    fetchedWeeks: { ...s.fetchedWeeks, [weekStart]: true },
    loading: false,
    error: null,
  }));

  return <PublicScheduleView />;
}