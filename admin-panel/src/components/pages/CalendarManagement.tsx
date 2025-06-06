import React, { useState } from 'react';
import { type Calendar as CalendarType } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

export const CalendarManagement: React.FC = () => {
  const [calendars, setCalendars] = useState<CalendarType[]>([
    { id: '1', name: 'C238-1', color: 'blue', isActive: true },
    { id: '2', name: 'C238-2', color: 'green', isActive: true },
    { id: '3', name: 'C238-3', color: 'purple', isActive: true },
    { id: '4', name: 'C203-1', color: 'green', isActive: true },
    { id: '5', name: 'C203-2', color: 'green', isActive: true },
    { id: '6', name: 'C238-3', color: 'green', isActive: false },
  ]);

  const toggleCalendar = (id: string) => {
    setCalendars(calendars.map(cal => 
      cal.id === id ? { ...cal, isActive: !cal.isActive } : cal
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Hallitse kalentereita</h1>
        <Button>Lisää kalenteri</Button>
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
                <Button variant="secondary" size="sm">Muokkaa</Button>
                <Button variant="danger" size="sm">Poista</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};