import type { ActivityStatus } from "../../models/calendar";

export const activityStatuses: Record<ActivityStatus, { label: string; className: string }> = {
  PENDING: { label: "Pendente", className: "bg-status-pending-soft text-status-pending" },
  IN_PROGRESS: { label: "Em andamento", className: "bg-status-in-progress-soft text-status-in-progress" },
  COMPLETED: { label: "Concluído", className: "bg-status-completed-soft text-status-completed" },
  CANCELED: { label: "Cancelado", className: "bg-status-canceled-soft text-status-canceled" },
};
