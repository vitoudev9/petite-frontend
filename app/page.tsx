"use client";

import { useState } from "react";
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useAppointments, useDeleteAppointment, useUpdateAppointment } from "@/hooks/useApi";
import DayView from "@/components/calendar/DayView";
import WeekView from "@/components/calendar/WeekView";
import AppointmentForm from "@/components/forms/AppointmentForm";
import { Modal, Badge, Button, PageHeader, StatCard, Spinner } from "@/components/ui";
import type { Appointment } from "@/types";

type View = "day" | "week";

export default function CalendarPage() {
  const [view, setView]           = useState<View>("day");
  const [currentDate, setDate]    = useState(new Date());
  const [showForm, setShowForm]   = useState(false);
  const [selected, setSelected]   = useState<Appointment | null>(null);

  const dateStr  = format(currentDate, "yyyy-MM-dd");
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  const { data: appts = [], isLoading } = useAppointments(
    view === "day" ? { date: dateStr } : {}
  );

  const deleteAppt = useDeleteAppointment();
  const updateAppt = useUpdateAppointment();

  function navigate(dir: 1 | -1) {
    setDate((d) =>
      view === "day"
        ? dir === 1 ? addDays(d, 1) : subDays(d, 1)
        : dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1)
    );
  }

  const weekAppts = view === "week"
    ? appts.filter((a) => {
        const d = new Date(a.date);
        const end = addDays(weekStart, 6);
        return d >= weekStart && d <= end;
      })
    : appts;

  const todayStats = {
    total:     appts.length,
    confirmed: appts.filter((a) => a.status === "confirmed").length,
    completed: appts.filter((a) => a.status === "completed").length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title={
          view === "day"
            ? format(currentDate, "EEEE, d MMMM yyyy")
            : `Week of ${format(weekStart, "d MMM")} – ${format(addDays(weekStart, 6), "d MMM yyyy")}`
        }
        actions={
          <>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(["day", "week"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-[12px] font-medium transition-colors capitalize ${
                    view === v ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ChevronLeft size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDate(new Date())}>Today</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate(1)}>
                <ChevronRight size={14} />
              </Button>
            </div>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              <Plus size={14} /> New booking
            </Button>
          </>
        }
      />

      {/* Stats row */}
      {view === "day" && (
        <div className="grid grid-cols-3 gap-3 px-6 py-3 border-b border-gray-100 bg-white shrink-0">
          <StatCard label="Total bookings" value={todayStats.total} />
          <StatCard label="Confirmed" value={todayStats.confirmed} />
          <StatCard label="Completed" value={todayStats.completed} />
        </div>
      )}

      {/* Calendar body */}
      <div className="flex-1 overflow-auto px-6 py-4 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        ) : view === "day" ? (
          <DayView appointments={appts} onClickAppt={setSelected} />
        ) : (
          <WeekView weekStart={weekStart} appointments={weekAppts} onClickAppt={setSelected} />
        )}
      </div>

      {/* New booking modal */}
      {showForm && (
        <Modal title="New booking" onClose={() => setShowForm(false)}>
          <AppointmentForm
            initial={{ date: dateStr }}
            onDone={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      {/* Appointment detail modal */}
      {selected && (
        <Modal title="Appointment" onClose={() => setSelected(null)}>
          <div className="space-y-3">
            <div>
              <p className="text-[15px] font-semibold">{selected.client?.name}</p>
              <p className="text-[13px] text-gray-500">
                {selected.service?.name} · {selected.time} · {selected.duration} min
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-[11px]">Staff</p>
                <p className="font-medium">{selected.staff_member?.name}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-[11px]">Price</p>
                <p className="font-medium">${selected.service?.price}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge label={selected.status} variant={selected.status} />
              {selected.paid && <Badge label="Paid" variant="completed" />}
            </div>
            {selected.notes && (
              <p className="text-[13px] text-gray-500 bg-gray-50 rounded-lg p-3">{selected.notes}</p>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  updateAppt.mutate({ id: selected.id, data: { status: "completed", paid: true } });
                  setSelected(null);
                }}
              >
                Mark complete & paid
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  deleteAppt.mutate(selected.id);
                  setSelected(null);
                }}
              >
                Cancel booking
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
