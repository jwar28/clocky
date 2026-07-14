"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SiteRoleCombobox } from "@/components/staff/SiteRoleCombobox";
import { useStaffStore } from "@/store/staff-store";
import { useSitesStore, useRolesStore } from "@/store/taxonomy-store";
import type { Staff } from "@/lib/types";

const schema = z.object({
  fullName: z.string().min(2, "Nombre requerido").max(120),
  defaultSite: z.string().max(80),
  role: z.string().min(2, "Rol requerido").max(60),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: Staff | null;
}

export function StaffDialog({ open, onOpenChange, staff }: StaffDialogProps) {
  const isEdit = Boolean(staff);
  const createStaff = useStaffStore((s) => s.createStaff);
  const updateStaff = useStaffStore((s) => s.updateStaff);
  const removeStaff = useStaffStore((s) => s.removeStaff);

  // Taxonomy
  const sites = useSitesStore((s) => s.items);
  const sitesFetched = useSitesStore((s) => s.fetched);
  const sitesFetch = useSitesStore((s) => s.fetch);
  const sitesCreate = useSitesStore((s) => s.create);

  const roles = useRolesStore((s) => s.items);
  const rolesFetched = useRolesStore((s) => s.fetched);
  const rolesFetch = useRolesStore((s) => s.fetch);
  const rolesCreate = useRolesStore((s) => s.create);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      defaultSite: "",
      role: "Operador",
      active: true,
    },
  });

  // Lazy-fetch taxonomy when dialog opens
  useEffect(() => {
    if (!open) return;
    if (!sitesFetched) void sitesFetch();
    if (!rolesFetched) void rolesFetch();
  }, [open, sitesFetched, sitesFetch, rolesFetched, rolesFetch]);

  useEffect(() => {
    if (open) {
      reset({
        fullName: staff?.fullName ?? "",
        defaultSite: staff?.defaultSite ?? "",
        role: staff?.role ?? "",
        active: staff?.active ?? true,
      });
    }
  }, [open, staff, reset]);

  const siteValue = watch("defaultSite");
  const roleValue = watch("role");

  async function onSubmit(values: FormValues) {
    try {
      if (staff) {
        await updateStaff(staff.id, values);
        toast.success("Empleado actualizado");
      } else {
        await createStaff(values);
        toast.success("Empleado creado");
      }
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar empleado");
    }
  }

  async function onDelete() {
    if (!staff) return;
    if (!window.confirm(`¿Eliminar a ${staff.fullName}? Esta acción no se puede deshacer.`)) return;
    try {
      await removeStaff(staff.id);
      toast.success("Empleado eliminado");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar empleado" : "Nuevo empleado"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos del empleado. Los cambios se guardan al hacer clic en Guardar."
              : "Registra un nuevo empleado. Podrás asignarle turnos desde la malla horaria."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input id="fullName" placeholder="Ej. Simón Amaya" {...register("fullName")} />
            {errors.fullName && <p className="text-body-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="defaultSite">Sede</Label>
              <SiteRoleCombobox
                id="defaultSite"
                kind="site"
                value={siteValue || ""}
                onChange={(v) => setValue("defaultSite", v)}
                items={sites}
                loading={!sitesFetched}
                onCreate={sitesCreate}
                placeholder="Selecciona una sede"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Rol</Label>
              <SiteRoleCombobox
                id="role"
                kind="role"
                value={roleValue || ""}
                onChange={(v) => setValue("role", v)}
                items={roles}
                loading={!rolesFetched}
                onCreate={rolesCreate}
                placeholder="Selecciona un rol"
              />
              {errors.role && <p className="text-body-sm text-destructive">{errors.role.message}</p>}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {isEdit ? (
              <Button type="button" variant="ghost" onClick={onDelete} className="text-destructive">
                Eliminar
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}