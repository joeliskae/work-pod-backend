import React, { useState, useEffect } from 'react';
import { type Calendar as CalendarType } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { CreateCalendarModal } from '../ui/CreateCalendarModal';
import { EditCalendarModal } from '../ui/EditCalendarModal';

export const CalendarManagement: React.FC = () => {
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<CalendarType | null>(null);

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    const res = await fetch('/api/v1/calendars');
    const data = await res.json();
    setCalendars(
      data.calendars.map((c: { alias: string }) => ({
        id: c.alias,
        name: c.alias,
        color: 'blue',
        isActive: true,
      }))
    );
  };

  const handleCreateCalendar = async (alias: string) => {
    try {
      const res = await fetch('/api/v1/createCalendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Virhe kalenterin luonnissa');
      }
      await fetchCalendars();
      setModalOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Virhe kalenterin luonnissa');
    }
  };

  const handleDeleteCalendar = async (alias: string) => {
    if (!window.confirm(`Haluatko varmasti poistaa kalenterin ${alias}?`)) return;
    try {
      const res = await fetch(`/api/v1/deleteCalendar/${alias}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Virhe kalenterin poistossa');
      }
      await fetchCalendars();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Virhe kalenterin poistossa');
    }
  };

  const handleOpenEditModal = (calendar: CalendarType) => {
    setEditingCalendar(calendar);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (id: string, newAlias: string) => {
    try {
      const res = await fetch(`/editCalendar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: newAlias }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Virhe kalenterin päivittämisessä');
      }
      await fetchCalendars();
      setEditModalOpen(false);
      setEditingCalendar(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Virhe kalenterin päivittämisessä');
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Hallitse kalentereita</h1>
        <Button onClick={() => setModalOpen(true)}>Lisää kalenteri</Button>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Kalenterit</h3>
        <div className="space-y-4">
          {calendars.map((calendar) => (
            <div key={calendar.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full bg-${calendar.color}-500`}></div>
                <div>
                  <h4 className="font-medium">{calendar.name}</h4>
                  <StatusBadge status={calendar.isActive ? 'active' : 'inactive'}>
                    {calendar.isActive ? 'Aktiivinen' : 'Ei aktiivinen'}
                  </StatusBadge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={calendar.isActive ? 'success' : 'secondary'}
                  size="sm"
                  onClick={() => toggleCalendar(calendar.id)}
                >
                  {calendar.isActive ? 'Aktiivinen' : 'Ei aktiivinen'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(calendar)}>
                  Muokkaa
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDeleteCalendar(calendar.name)}>
                  Poista
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <CreateCalendarModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreateCalendar} />
      {editingCalendar && (
        <EditCalendarModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          calendar={editingCalendar}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

