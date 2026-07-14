"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSessionStore } from "@/store/session-store";
import { APP_NAME, AREA_LABEL } from "@/lib/constants";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const signIn = useSessionStore((s) => s.signIn);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
      toast.success("Sesión iniciada");
      router.replace("/schedule");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo iniciar sesión";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border border-outline-variant bg-card p-8 shadow-elevated">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-display text-headline-xl tracking-tight text-primary">{APP_NAME}</h1>
          <p className="text-body-sm text-muted-foreground">{AREA_LABEL}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="admin@empresa.co" {...register("email")} />
            {errors.email && <p className="text-body-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <p className="text-body-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Ingresando…" : "Iniciar sesión"}
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-muted-foreground">
          El usuario admin se crea desde el dashboard de InsForge.
        </p>
      </div>
    </div>
  );
}