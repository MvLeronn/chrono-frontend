import { activityStatuses } from "./ActivityRow";
import type { PositionedActivity } from "../../lib/day-layout";

interface TimedActivityBlocksProps {
  activities: PositionedActivity[];
  detailPrefix: string;
}

export function TimedActivityBlocks({ activities, detailPrefix }: TimedActivityBlocksProps) {
  return activities.map(({ item, start, visualEnd, column, columns }, index) => (
    <li key={item.calendarKey} className="absolute px-1" style={{ top: start * 2, height: (visualEnd - start) * 2, left: `${column * 100 / columns}%`, width: `${100 / columns}%` }}>
      <a href={`#${detailPrefix}-${index}`} aria-label={`${item.title}. ${item.startTime}${item.endTime ? ` até ${item.endTime}` : ", sem horário de fim"}. ${activityStatuses[item.status].label}. Ver conteúdo completo.`} className={`block h-full overflow-hidden rounded-control border border-current p-2 text-xs ${activityStatuses[item.status].className}`}>
        <p className="font-semibold tabular-nums">{item.startTime}{item.endTime ? ` – ${item.endTime}` : " · Sem fim"}</p>
        <p className="mt-1 line-clamp-2 wrap-anywhere font-semibold">{item.title}</p>
        <p className="mt-1">{activityStatuses[item.status].label}</p>
      </a>
    </li>
  ));
}
