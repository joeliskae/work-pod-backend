import React, { useState, useEffect } from "react";
import { type Calendar as CalendarType } from "../../types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { CreateCalendarModal } from "../ui/CreateCalendarModal";
import { ConfirmModal } from "../ui/ConfirmModal"; // importoi uusi modal

export const CalendarManagement: React.FC = () => {
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [calendarToDelete, setCalendarToDelete] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCalendars() {
      try {
        const res = await fetch("/api/v1/calendars");
        const data = await res.json();
        setCalendars(
          data.calendars.map((c: { alias: string }) => ({
            id: c.alias,
            name: c.alias,
            color: "blue",
            isActive: true,
          }))
        );
      } catch {
        // Virheenkäsittelyä voi lisätä
      }
    }
    fetchCalendars();
  }, []);

  const handleCreateCalendar = async (alias: string) => {
    try {
      const res = await fetch("/api/v1/createCalendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Virhe kalenterin luonnissa");
      }
      const updated = await (await fetch("/api/v1/calendars")).json();
      setCalendars(
        updated.calendars.map((c: { alias: string }) => ({
          id: c.alias,
          name: c.alias,
          color: "blue",
          isActive: true,
        }))
      );
      setModalOpen(false); // Suljetaan modal vasta kun päivitys on tehty
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Virhe kalenterin luonnissa"
      );
    }
  };

  const askDeleteCalendar = (alias: string) => {
    setCalendarToDelete(alias);
    setConfirmOpen(true);
  };

  const confirmDeleteCalendar = async () => {
    if (!calendarToDelete) return;
    setConfirmOpen(false);

    const res = await fetch(`/api/v1/deleteCalendar/${calendarToDelete}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Kalenterin poisto epäonnistui");
      return;
    }

    setCalendars(calendars.filter((cal) => cal.id !== calendarToDelete));
    setCalendarToDelete(null);
  };

  const cancelDeleteCalendar = () => {
    setConfirmOpen(false);
    setCalendarToDelete(null);
  };

  const toggleCalendar = (id: string) => {
    setCalendars(
      calendars.map((cal) =>
        cal.id === id ? { ...cal, isActive: !cal.isActive } : cal
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Hallitse kalentereita
        </h1>
        <Button onClick={() => setModalOpen(true)}>Lisää kalenteri</Button>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Kalenterit</h3>
        <div className="space-y-4">
          {calendars.map((calendar) => (
            <div
              key={calendar.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-4 h-4 rounded-full bg-${calendar.color}-500`}
                ></div>
                <div>
                  <h4 className="font-medium">{calendar.name}</h4>
                  <StatusBadge
                    status={calendar.isActive ? "active" : "inactive"}
                  >
                    {calendar.isActive ? "Aktiivinen" : "Ei aktiivinen"}
                  </StatusBadge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={calendar.isActive ? "success" : "secondary"}
                  size="sm"
                  onClick={() => toggleCalendar(calendar.id)}
                >
                  {calendar.isActive ? "Aktiivinen" : "Ei aktiivinen"}
                </Button>
                <Button variant="secondary" size="sm">
                  Muokkaa
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => askDeleteCalendar(calendar.id)}
                >
                  Poista
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <CreateCalendarModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateCalendar}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        onConfirm={confirmDeleteCalendar}
        onCancel={cancelDeleteCalendar}
        title="Poista kalenteri"
        message={`Haluatko varmasti poistaa kalenterin ${calendarToDelete}? Tämä toimenpide on peruuttamaton.`}
        confirmText="Poista"
        cancelText="Peruuta"
      />
    </div>
  );
};
