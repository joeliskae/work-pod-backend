import React, { useState } from 'react';
import { Tablet as TabletIcon } from 'lucide-react';
import type { Tablet } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

export const TabletSettings: React.FC = () => {
  const [tablets] = useState<Tablet[]>([
    { id: '1', name: 'C238-1', location: 'C238', status: 'online', lastSeen: '2 min sitten' },
    { id: '2', name: 'C238-2', location: 'C238', status: 'online', lastSeen: '5 min sitten' },
    { id: '3', name: 'C238-3', location: 'C238', status: 'online', lastSeen: '2 tuntia sitten' },
    { id: '4', name: 'C203-1', location: 'C203', status: 'online', lastSeen: '1 tuntia sitten' },
    { id: '5', name: 'C203-2', location: 'C203', status: 'online', lastSeen: '3 tuntia sitten' },
  ]);

//   const onlineCount = tablets.filter(t => t.status === 'online').length;
//  const offlineCount = tablets.filter(t => t.status === 'offline').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tablettien asetukset</h1>
        <Button>Lisää tabletti</Button>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Rekisteröidyt tabletit</h3>
        <div className="space-y-4">
          {tablets.map((tablet) => (
            <div key={tablet.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <TabletIcon className="w-8 h-8 text-gray-600" />
                <div>
                  <h4 className="font-medium">{tablet.name}</h4>
                  <p className="text-sm text-gray-500">{tablet.location}</p>
                  <p className="text-xs text-gray-400">Viimeksi nähty: {tablet.lastSeen}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <StatusBadge status={tablet.status}>
                  {tablet.status}
                </StatusBadge>
                <Button variant="secondary" size="sm">Asetukset</Button>
                <Button variant="secondary" size="sm">Uudelleenkäynnistä</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* <Card>
          <h3 className="text-lg font-semibold mb-4">Yleiset asetukset</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Automaattinen päivitys</span>
              <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Etätuki</span>
              <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Seuranta</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Online:</span>
              <span className="text-sm font-medium text-green-600">{onlineCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Offline:</span>
              <span className="text-sm font-medium text-red-600">{offlineCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Yhteensä:</span>
              <span className="text-sm font-medium">{tablets.length}</span>
            </div>
          </div>
        </Card> */}

      </div>
    </div>
  );
};