"use client";

import { useEffect } from "react";
import { APP_NAME, AREA_LABEL } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaxonomyManager } from "@/components/settings/TaxonomyManager";
import { useSitesStore } from "@/store/taxonomy-store";
import { useRolesStore } from "@/store/taxonomy-store";
import { useStaffStore } from "@/store/staff-store";

export default function SettingsPage() {
  const sites = useSitesStore((s) => s.items);
  const sitesLoading = useSitesStore((s) => s.loading);
  const sitesError = useSitesStore((s) => s.error);
  const sitesFetched = useSitesStore((s) => s.fetched);
  const sitesFetch = useSitesStore((s) => s.fetch);
  const sitesCreate = useSitesStore((s) => s.create);
  const sitesUpdate = useSitesStore((s) => s.update);
  const sitesDelete = useSitesStore((s) => s.remove);
  const sitesUsage = useSitesStore((s) => s.usageByName);

  const roles = useRolesStore((s) => s.items);
  const rolesLoading = useRolesStore((s) => s.loading);
  const rolesError = useRolesStore((s) => s.error);
  const rolesFetched = useRolesStore((s) => s.fetched);
  const rolesFetch = useRolesStore((s) => s.fetch);
  const rolesCreate = useRolesStore((s) => s.create);
  const rolesUpdate = useRolesStore((s) => s.update);
  const rolesDelete = useRolesStore((s) => s.remove);
  const rolesUsage = useRolesStore((s) => s.usageByName);

  const staffFetched = useStaffStore((s) => s.fetched);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);

  useEffect(() => {
    if (!staffFetched) void fetchStaff();
  }, [staffFetched, fetchStaff]);

  useEffect(() => {
    if (!sitesFetched) void sitesFetch();
  }, [sitesFetched, sitesFetch]);

  useEffect(() => {
    if (!rolesFetched) void rolesFetch();
  }, [rolesFetched, rolesFetch]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 px-6 py-8">
        <h1 className="mb-4 font-display text-headline-xl text-foreground">Configuración</h1>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Acerca de</CardTitle>
              <CardDescription>Información de la aplicación.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-body-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Aplicación:</span> {APP_NAME}
              </p>
              <p>
                <span className="font-semibold text-foreground">Área:</span> {AREA_LABEL}
              </p>
              <p>
                <span className="font-semibold text-foreground">Backend:</span> InsForge
              </p>
              <p>
                <span className="font-semibold text-foreground">Semana tipo:</span> Domingo → Sábado
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="mt-8 mb-3 font-display text-headline-md text-foreground">Sedes y Roles</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <TaxonomyManager
            title="Sedes"
            description="Lista de sedes disponibles para asignar al personal."
            kind="site"
            items={sites}
            loading={sitesLoading}
            error={sitesError}
            usageByName={sitesUsage}
            onCreate={sitesCreate}
            onUpdate={sitesUpdate}
            onDelete={sitesDelete}
            onRefresh={sitesFetch}
            inputPlaceholder="Ej. Fontibón"
          />
          <TaxonomyManager
            title="Roles"
            description="Lista de roles o cargos disponibles para el personal."
            kind="role"
            items={roles}
            loading={rolesLoading}
            error={rolesError}
            usageByName={rolesUsage}
            onCreate={rolesCreate}
            onUpdate={rolesUpdate}
            onDelete={rolesDelete}
            onRefresh={rolesFetch}
            inputPlaceholder="Ej. Operador"
          />
        </div>
      </div>
    </div>
  );
}