import React, { useEffect, useState } from 'react';
import { type Calendar as CalendarType } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

const API_URL = import.meta.env.VITE_API_URL;

interface BackendCalendar {
  alias: string;
  status: string; // tällä hetkellä unused
}

export const CalendarManagement: React.FC = () => {
  const [calendars, setCalendars] = useState<CalendarType[]>([]);

  // Haetaan kalenterit backendistä
  const fetchCalendars = async () => {
    try {
      const res = await fetch(`${API_URL}/calendars`);
      if (!res.ok) throw new Error('Kalenterien hakeminen epäonnistui');
      const data: { calendars: BackendCalendar[] } = await res.json();

      // Muutetaan backendin data omaan muotoon ja laitetaan isActive true
      const mapped = data.calendars.map(cal => ({
        id: cal.alias,
        name: cal.alias,
        color: 'green', // oletusväri, halutessa voit laajentaa
        isActive: true,
      }));

      setCalendars(mapped);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  const createCalendar = async () => {
    const alias = prompt('Anna kalenterin alias (esim. C203-3):');
    if (!alias) return;

    try {
      const response = await fetch(`${API_URL}/createCalendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias }),
      });

      if (!response.ok) throw new Error('Kalenterin luonti epäonnistui');

      setCalendars(prev => [...prev, { id: alias, name: alias, color: 'green', isActive: true }]);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const deleteCalendarByAlias = async (alias: string) => {
    if (!confirm(`Haluatko varmasti poistaa kalenterin ${alias}?`)) return;

    try {
      const response = await fetch(`${API_URL}/deleteCalendar/${alias}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Kalenterin poisto epäonnistui');

      setCalendars(prev => prev.filter(cal => cal.name !== alias));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Hallitse kalentereita</h1>
        <Button onClick={createCalendar}>Lisää kalenteri</Button>
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
                  onClick={() => {}}
                >
                  {calendar.isActive ? 'Aktiivinen' : 'Ei aktiivinen'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => { /* muokkaus ei vielä */ }}>
                  Muokkaa
                </Button>
                <Button variant="danger" size="sm" onClick={() => deleteCalendarByAlias(calendar.name)}>
                  Poista
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
