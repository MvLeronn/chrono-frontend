import { activityStatuses } from "./ActivityRow";
import type { PositionedActivity } from "../../lib/day-layout";

interface TimedActivityBlocksProps {
  activities: PositionedActivity[];
  detailPrefix: string;
  startHour: number;
  endHour: number;
}

export function TimedActivityBlocks({ activities, detailPrefix, startHour, endHour }: TimedActivityBlocksProps) {
  return activities.map(({ item, start, visualEnd, column, columns }, index) => {
    const visibleStart = Math.max(start, startHour * 60);
    const visibleEnd = Math.min(visualEnd, endHour * 60);
    const actualEnd = item.endTime ? Number(item.endTime.slice(0, 2)) * 60 + Number(item.endTime.slice(3)) : start + 1;
    if (start >= endHour * 60 || actualEnd <= startHour * 60) return null;
    return (
    <li key={item.calendarKey} className="absolute px-1" style={{ top: visibleStart - startHour * 60, height: visibleEnd - visibleStart, left: `${column * 100 / columns}%`, width: `${100 / columns}%` }}>
      <a href={`#${detailPrefix}-${index}`} aria-label={`${item.title}. ${item.startTime}${item.endTime ? ` até ${item.endTime}` : ", sem horário de fim"}. ${activityStatuses[item.status].label}. Ver conteúdo completo.`} className={`block h-full overflow-hidden rounded-control border border-current px-2 py-1 text-xs ${activityStatuses[item.status].className}`}>
        <p className="font-semibold tabular-nums">{item.startTime}{item.endTime ? ` – ${item.endTime}` : " · Sem fim"}</p>
        <p className="mt-1 truncate wrap-anywhere font-semibold">{item.title}</p>
      </a>
    </li>
  );
  });
}
