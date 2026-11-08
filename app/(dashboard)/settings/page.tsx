"use client";

import { useEffect } from "react";
import { AREA_LABEL } from "@/lib/constants";
import { TaxonomyManager } from "@/components/settings/TaxonomyManager";
import { useRolesStore, useSitesStore } from "@/store/taxonomy-store";
import { useStaffStore } from "@/store/staff-store";

export default function SettingsPage() {
  const sites = useSitesStore();
  const roles = useRolesStore();
  const staff = useStaffStore((s) => s.staff);
  const staffFetched = useStaffStore((s) => s.fetched);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);

  useEffect(() => {
    if (!staffFetched) void fetchStaff();
  }, [staffFetched, fetchStaff]);
  useEffect(() => {
    if (!sites.fetched) void sites.fetch();
  }, [sites.fetched, sites.fetch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!roles.fetched) void roles.fetch();
  }, [roles.fetched, roles.fetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col md:min-h-screen">
      <header className="flex h-[60px] shrink-0 items-center border-b border-border px-4 md:px-6">
        <h1 className="text-[21px] font-bold tracking-tight text-foreground">Configuración</h1>
      </header>

      <div className="flex-1 px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-2xl space-y-10">
          <TaxonomyManager
            id="sedes"
            title="Sedes"
            description="Dónde trabaja el equipo. Cada persona tiene una sede habitual y puede rotar a otra al asignar turnos."
            kind="site"
            items={sites.items}
            loading={sites.loading}
            error={sites.error}
            staff={staff}
            onCreate={sites.create}
            onUpdate={sites.update}
            onDelete={sites.remove}
            onRetry={sites.fetch}
            placeholder="Nueva sede"
          />

          <TaxonomyManager
            id="roles"
            title="Roles"
            description="Cargos del personal. Se eligen en la ficha de cada persona."
            kind="role"
            items={roles.items}
            loading={roles.loading}
            error={roles.error}
            staff={staff}
            onCreate={roles.create}
            onUpdate={roles.update}
            onDelete={roles.remove}
            onRetry={roles.fetch}
            placeholder="Nuevo rol"
          />

          <section aria-labelledby="about-title">
            <h2 id="about-title" className="mb-3 text-lg font-extrabold tracking-tight">
              Acerca de
            </h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 rounded-xl border border-border px-4 py-3 text-sm">
              <dt className="text-muted-foreground">Área</dt>
              <dd className="font-semibold">{AREA_LABEL}</dd>
              <dt className="text-muted-foreground">Semana</dt>
              <dd className="font-semibold">Domingo a sábado</dd>
              <dt className="text-muted-foreground">Horario de referencia</dt>
              <dd className="font-semibold">Colombia (Bogotá)</dd>
              <dt className="text-muted-foreground">Vista pública</dt>
              <dd className="font-semibold">
                <a href="/equipo" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4 hover:no-underline">
                  /equipo
                </a>
                <span className="ml-2 font-normal text-muted-foreground">para que el equipo consulte sus turnos</span>
              </dd>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
