import React from 'react';
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { type StatCard } from '../../types';

export const AnalyticsDashboard: React.FC = () => {
  const stats: StatCard[] = [
    { title: 'Aktiiviset käyttäjät', value: '1,234', change: '+12%', icon: Users },
    { title: 'Tapahtumat tänään', value: '89', change: '+5%', icon: Calendar },
    { title: 'Tablettien käyttö', value: '94%', change: '+2%', icon: Activity },
    { title: 'Järjestelmän tila', value: 'Online', change: '99.9%', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytiikka</h1>
        <Button>Päivitä data</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
              <stat.icon className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Käyttäjäaktiivisuus</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Kaavio tulisi tähän (esim. Chart.js tai Recharts)
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-4">Viimeisimmät tapahtumat</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Tapahtuma #{i}</p>
                  <p className="text-xs text-gray-500">{i} minuuttia sitten</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
