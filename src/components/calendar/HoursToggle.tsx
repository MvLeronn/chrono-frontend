import { cookies } from "next/headers";

async function toggleHours(formData: FormData) {
  "use server";
  const full = formData.get("hours") === "full";
  (await cookies()).set("chrono-hours", full ? "full" : "reduced", {
    path: "/", httpOnly: true, sameSite: "lax", maxAge: 31536000,
  });
}

export function HoursToggle({ full }: { full: boolean }) {
  return <form action={toggleHours} className="flex flex-wrap items-center gap-2">
    <span className="text-xs text-text-secondary">{full ? "24 horas" : "08h–22h"}</span>
    <button name="hours" value={full ? "reduced" : "full"} type="submit" aria-pressed={full} className="inline-flex min-h-11 items-center rounded-control px-2 text-xs font-semibold text-primary hover:bg-primary-soft">{full ? "Usar visão reduzida" : "Mostrar 24 horas"}</button>
  </form>;
}
