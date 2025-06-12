import React, { useState, useEffect } from "react";
import { type Calendar as CalendarType } from "../../types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { CreateCalendarModal } from "../ui/CreateCalendarModal";
import { EditCalendarModal } from "../ui/EditCalendarModal";
import { ConfirmModal } from "../ui/ConfirmModal";
import { Calendar as CalendarIcon } from "lucide-react";
import { getCalendarIconColor } from "../../utils/colorUtils";

export const CalendarManagement: React.FC = () => {
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<CalendarType | null>(
    null
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [calendarToDelete, setCalendarToDelete] = useState<CalendarType | null>(
    null
  );

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/calendars/admin`);
    const data = await res.json();
    setCalendars(
      data.calendars.map((c: { alias: string, isActive: boolean, color: string }) => ({
        id: c.alias,
        name: c.alias,
        color: c.color,
        isActive: c.isActive,
      }))
    );
  };

  const handleCreateCalendar = async (alias: string, color: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/createCalendar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alias, color }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Virhe kalenterin luonnissa");
      }
      await fetchCalendars();
      setModalOpen(false);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Virhe kalenterin luonnissa"
      );
    }
  };

  const confirmDelete = (calendar: CalendarType) => {
    setCalendarToDelete(calendar);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteCalendar = async () => {
    if (!calendarToDelete) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/deleteCalendar/${
          calendarToDelete.name
        }`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Virhe kalenterin poistossa");
      }
      await fetchCalendars();
      setConfirmDeleteOpen(false);
      setCalendarToDelete(null);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Virhe kalenterin poistossa"
      );
    }
  };

  const handleOpenEditModal = (calendar: CalendarType) => {
    setEditingCalendar(calendar);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (id: string, newAlias: string, newColor: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/editCalendar/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alias: newAlias, color: newColor }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Virhe kalenterin päivittämisessä");
      }
      await fetchCalendars();
      setEditModalOpen(false);
      setEditingCalendar(null);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Virhe kalenterin päivittämisessä"
      );
    }
  };

  const toggleCalendar = async (calendar: CalendarType) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/toggleActive/${calendar.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !calendar.isActive }),
        }
      );
      await fetchCalendars(); // Päivitä lista uudestaan
    } catch (err) {
      alert("Virhe kalenterin päivittämisessä");
    }
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
                <CalendarIcon className={`w-20 h-20 mt-1 ${getCalendarIconColor(calendar.color)}`} />
                {/* <div
                  className={`w-4 h-4 rounded-full ${getCalendarBadgeColor(calendar.color)}`}
                ></div> */}
                <div>
                  <h4 className="font-medium">{calendar.name}</h4>
                  {/* Tämä näyttää statuksen oikein */}
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
                  onClick={() => toggleCalendar(calendar)}
                >
                  {calendar.isActive ? "Aktiivinen" : "Ei aktiivinen"}
                </Button>
                <Button
                  variant="settings"
                  size="sm"
                  onClick={() => handleOpenEditModal(calendar)}
                >
                  Asetukset
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => confirmDelete(calendar)}
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
      {editingCalendar && (
        <EditCalendarModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          calendar={editingCalendar}
          onSave={handleSaveEdit}
        />
      )}
      {calendarToDelete && (
        <ConfirmModal
          isOpen={confirmDeleteOpen}
          title="Poista kalenteri"
          message={`Haluatko varmasti poistaa kalenterin ${calendarToDelete.name}?`}
          onCancel={() => {
            setConfirmDeleteOpen(false);
            setCalendarToDelete(null);
          }}
          onConfirm={handleDeleteCalendar}
        />
      )}
    </div>
  );
};