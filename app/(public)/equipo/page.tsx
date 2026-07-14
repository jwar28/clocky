import { PublicScheduleView } from "@/components/schedule/PublicScheduleView";

export const metadata = {
  title: "Malla Horaria · Equipo",
  description: "Consulta la malla horaria semanal del equipo de operaciones.",
};

export default function EquipoPage() {
  return <PublicScheduleView />;
}