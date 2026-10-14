import { activityStatuses } from "./activity-status";
import { ActivityDetails } from "./ActivityDetails";
import type { PositionedActivity } from "../../lib/day-layout";

interface TimedActivityBlocksProps {
  activities: PositionedActivity[];
  detailPrefix: string;
  startHour: number;
  endHour: number;
}

export function TimedActivityBlocks({ activities, startHour, endHour }: TimedActivityBlocksProps) {
  return activities.map(({ item, start, visualEnd, column, columns }) => {
    const visibleStart = Math.max(start, startHour * 60);
    const visibleEnd = Math.min(visualEnd, endHour * 60);
    const actualEnd = item.endTime ? Number(item.endTime.slice(0, 2)) * 60 + Number(item.endTime.slice(3)) : start + 1;
    if (start >= endHour * 60 || actualEnd <= startHour * 60) return null;
    return (
    <li key={item.calendarKey} className="absolute px-1" style={{ top: visibleStart - startHour * 60, height: visibleEnd - visibleStart, left: `${column * 100 / columns}%`, width: `${100 / columns}%` }}>
      <ActivityDetails item={item} className={`pointer-events-auto block h-full w-full text-left overflow-hidden rounded-control border border-current px-2 py-1 text-xs ${activityStatuses[item.status].className} transition-[filter,box-shadow] hover:brightness-95 hover:shadow-sm hover:ring-1 hover:ring-current motion-reduce:transition-none`}>
        <span className="block font-semibold tabular-nums">{item.startTime}{item.endTime ? ` – ${item.endTime}` : " · Sem fim"}</span>
        <span className="mt-1 block truncate wrap-anywhere font-semibold">{item.title}</span>
      </ActivityDetails>
    </li>
  );
  });
}
