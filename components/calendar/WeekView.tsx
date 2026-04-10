"use client";

import { useMemo } from "react";
import { format, addDays } from "date-fns";
import type { Appointment } from "@/types";

const CAT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  hair:   { bg: "#E6F1FB", border: "#85B7EB", text: "#0C447C" },
  nails:  { bg: "#FBEAF0", border: "#ED93B1", text: "#72243E" },
  color:  { bg: "#EAF3DE", border: "#97C459", text: "#27500A" },
  facial: { bg: "#FAEEDA", border: "#EF9F27", text: "#633806" },
  wax:    { bg: "#E1F5EE", border: "#5DCAA5", text: "#085041" },
};

const HOURS  = Array.from({ length: 10 }, (_, i) => i + 8); // 8am–5pm
const CELL_H = 44; // px per hour row
const GAP    = 2;  // px gap between side-by-side blocks

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Given a list of appointments that all fall within the same day column,
 * assign each a `col` index and a `totalCols` count so overlapping ones
 * render side-by-side instead of stacked.
 */
function computeColumns(appts: Appointment[]): {
  appt: Appointment;
  col: number;
  totalCols: number;
}[] {
  const sorted = [...appts].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
  );

  // Track the end-minute of the last appointment placed in each column
  const colEnd: number[] = [];
  const layout: { appt: Appointment; col: number; endMin: number }[] = [];

  for (const appt of sorted) {
    const startMin = timeToMinutes(appt.time);
    const endMin   = startMin + appt.duration;

    let col = colEnd.findIndex((end) => end <= startMin);
    if (col === -1) {
      col = colEnd.length;
      colEnd.push(endMin);
    } else {
      colEnd[col] = endMin;
    }

    layout.push({ appt, col, endMin });
  }

  // For each appointment, find the max column index among all appointments
  // that overlap with it — that gives the total columns needed for the group.
  const result = layout.map((item) => {
    const startMin = timeToMinutes(item.appt.time);
    const overlapping = layout.filter(
      ({ appt, endMin }) =>
        timeToMinutes(appt.time) < item.endMin && endMin > startMin
    );
    const totalCols = Math.max(...overlapping.map((o) => o.col + 1));
    return { appt: item.appt, col: item.col, totalCols };
  });

  return result;
}

interface Props {
  weekStart: Date;
  appointments: Appointment[];
  onClickAppt: (a: Appointment) => void;
}

export default function WeekView({ weekStart, appointments, onClickAppt }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Group appointments by date, then compute column layout per day
  const layoutByDate = useMemo(() => {
    const byDate: Record<string, Appointment[]> = {};
    for (const a of appointments) {
      if (!byDate[a.date]) byDate[a.date] = [];
      byDate[a.date].push(a);
    }
    const result: Record<string, ReturnType<typeof computeColumns>> = {};
    for (const [date, appts] of Object.entries(byDate)) {
      result[date] = computeColumns(appts);
    }
    return result;
  }, [appointments]);

  return (
    <div className="overflow-auto flex-1">
      <div
        className="grid"
        style={{ gridTemplateColumns: `3rem repeat(7, 1fr)`, minWidth: 640 }}
      >
        {/* Header row */}
        <div className="h-10 border-b border-gray-200" />
        {days.map((d) => (
          <div
            key={d.toISOString()}
            className="h-10 border-b border-l border-gray-200 flex flex-col items-center justify-center"
          >
            <span className="text-[11px] text-gray-400">{format(d, "EEE")}</span>
            <span className="text-[13px] font-medium text-gray-700">{format(d, "d")}</span>
          </div>
        ))}

        {/* Time rows */}
        {HOURS.map((h) => (
          <>
            <div
              key={`label-${h}`}
              className="border-b border-gray-100 text-[11px] text-gray-400 flex items-start pt-1 pl-1"
              style={{ height: CELL_H }}
            >
              {h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`}
            </div>

            {days.map((d) => {
              const dateStr    = format(d, "yyyy-MM-dd");
              const dayLayout  = layoutByDate[dateStr] ?? [];

              // Only render appointments whose hour matches this row
              const cellItems = dayLayout.filter(
                ({ appt }) => parseInt(appt.time.split(":")[0]) === h
              );

              return (
                <div
                  key={`${dateStr}-${h}`}
                  className="border-b border-l border-gray-100 relative"
                  style={{ height: CELL_H }}
                >
                  {cellItems.map(({ appt, col, totalCols }) => {
                    const cancelled = appt.status === "cancelled";
                    const cat   = appt.service?.category ?? "hair";
                    const color = CAT_COLORS[cat] ?? CAT_COLORS.hair;

                    const widthPct = 100 / totalCols;
                    const leftPct  = widthPct * col;

                    return (
                      <div
                        key={appt.id}
                        onClick={() => onClickAppt(appt)}
                        className="absolute top-0.5 bottom-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity px-1 py-0.5 overflow-hidden"
                        style={{
                          left:       `calc(${leftPct}% + ${GAP}px)`,
                          width:      `calc(${widthPct}% - ${GAP * 2}px)`,
                          background: cancelled ? "#F3F4F6" : color.bg,
                          borderLeft: cancelled
                            ? "2px dashed #D1D5DB"
                            : `2px solid ${color.border}`,
                          opacity: cancelled ? 0.7 : 1,
                        }}
                      >
                        <p
                          className="text-[11px] truncate leading-tight font-medium"
                          style={{
                            color:          cancelled ? "#9CA3AF" : color.text,
                            textDecoration: cancelled ? "line-through" : "none",
                          }}
                        >
                          {appt.client?.name}
                        </p>
                        <p
                          className="text-[10px] truncate leading-tight"
                          style={{
                            color:          cancelled ? "#9CA3AF" : color.text,
                            opacity:        cancelled ? 1 : 0.7,
                            textDecoration: cancelled ? "line-through" : "none",
                          }}
                        >
                          {appt.service?.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}