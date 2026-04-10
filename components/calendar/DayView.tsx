"use client";

import { useMemo } from "react";
import type { Appointment } from "@/types";

const CAT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  hair:   { bg: "#E6F1FB", border: "#85B7EB", text: "#0C447C" },
  nails:  { bg: "#FBEAF0", border: "#ED93B1", text: "#72243E" },
  color:  { bg: "#EAF3DE", border: "#97C459", text: "#27500A" },
  facial: { bg: "#FAEEDA", border: "#EF9F27", text: "#633806" },
  wax:    { bg: "#E1F5EE", border: "#5DCAA5", text: "#085041" },
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am–7pm
const HOUR_H = 56; // px per hour
const LEFT_GUTTER = 56; // px reserved for hour labels
const RIGHT_PAD   = 8;  // px from right edge

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function timeToTop(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h - 8) * HOUR_H + (m / 60) * HOUR_H;
}

/**
 * Assign each appointment a column index and a total column count so that
 * overlapping appointments sit side-by-side instead of stacking.
 *
 * Algorithm:
 * 1. Sort by start time.
 * 2. Walk through appointments maintaining a list of "active columns"
 *    (the end-minute of the last appointment placed in each column).
 * 3. Place the appointment in the first column that has ended, or open a new one.
 * 4. After placement, compute totalCols = max simultaneous column count for
 *    each overlap group so every appointment in the group shares the same width.
 */
function computeLayout(appointments: Appointment[]) {
  const sorted = [...appointments].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
  );

  // Step 1: assign column indices
  const colEnd: number[] = []; // colEnd[i] = end minute of last appt in column i
  const layout: { appt: Appointment; col: number; endMin: number }[] = [];

  for (const appt of sorted) {
    const startMin = timeToMinutes(appt.time);
    const endMin   = startMin + appt.duration;

    // Find the first free column
    let col = colEnd.findIndex((end) => end <= startMin);
    if (col === -1) {
      col = colEnd.length; // open a new column
      colEnd.push(endMin);
    } else {
      colEnd[col] = endMin;
    }

    layout.push({ appt, col, endMin });
  }

  // Step 2: for each appointment, find how many columns its overlap group needs.
  // Two appointments overlap if their time ranges intersect.
  const totalCols = layout.map((item) => {
    const startMin = timeToMinutes(item.appt.time);
    // Count how many appointments overlap with this one (including itself)
    const overlapping = layout.filter(({ appt, endMin }) => {
      const s = timeToMinutes(appt.time);
      const e = endMin;
      return s < item.endMin && e > startMin;
    });
    return Math.max(...overlapping.map((o) => o.col + 1));
  });

  return layout.map((item, i) => ({ ...item, totalCols: totalCols[i] }));
}

interface Props {
  appointments: Appointment[];
  onClickAppt: (a: Appointment) => void;
}

export default function DayView({ appointments, onClickAppt }: Props) {
  const layout = useMemo(() => computeLayout(appointments), [appointments]);

  return (
    <div className="flex flex-col overflow-auto flex-1">
      <div className="relative" style={{ height: HOURS.length * HOUR_H }}>

        {/* Hour grid lines */}
        {HOURS.map((h) => (
          <div
            key={h}
            className="absolute left-0 right-0 border-t border-gray-100 flex items-start"
            style={{ top: (h - 8) * HOUR_H }}
          >
            <span className="text-[11px] text-gray-400 w-14 pl-2 pt-1 shrink-0">
              {h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`}
            </span>
          </div>
        ))}

        {/* Appointment blocks */}
        {layout.map(({ appt, col, totalCols }) => {
          const cancelled = appt.status === "cancelled";
          const cat    = appt.service?.category ?? "hair";
          const color  = CAT_COLORS[cat] ?? CAT_COLORS.hair;
          const top    = timeToTop(appt.time);
          const height = Math.max((appt.duration / 60) * HOUR_H - 4, 28);

          const availableWidth = `calc((100% - ${LEFT_GUTTER + RIGHT_PAD}px) / ${totalCols})`;
          const leftOffset     = `calc(${LEFT_GUTTER}px + (100% - ${LEFT_GUTTER + RIGHT_PAD}px) / ${totalCols} * ${col})`;

          return (
            <div
              key={appt.id}
              onClick={() => onClickAppt(appt)}
              className="absolute rounded-lg px-2.5 py-1.5 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden flex flex-col"
              style={{
                top,
                height,
                left:        leftOffset,
                width:       availableWidth,
                marginRight: totalCols > 1 ? 3 : 0,
                // Cancelled: flat gray, dashed border, muted
                background:  cancelled ? "#F3F4F6" : color.bg,
                borderLeft:  cancelled
                  ? "3px dashed #D1D5DB"
                  : `3px solid ${color.border}`,
                opacity: cancelled ? 0.7 : 1,
              }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <p
                  className="text-[12px] font-medium leading-tight truncate flex-1"
                  style={{
                    color:          cancelled ? "#9CA3AF" : color.text,
                    textDecoration: cancelled ? "line-through" : "none",
                  }}
                >
                  {appt.client?.name ?? "—"}
                </p>
                {cancelled && (
                  <span className="text-[10px] text-gray-400 shrink-0">Cancelled</span>
                )}
              </div>
              <p
                className="text-[11px] leading-tight truncate"
                style={{
                  color:          cancelled ? "#9CA3AF" : color.text,
                  opacity:        cancelled ? 1 : 0.75,
                  textDecoration: cancelled ? "line-through" : "none",
                }}
              >
                {appt.service?.name} · {appt.staff_member?.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}