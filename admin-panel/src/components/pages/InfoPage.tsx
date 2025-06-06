import React from 'react';
import { Card } from '../ui/Card';

export const InfoPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tietoja</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Järjestelmätiedot</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Versio:</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Viimeisin päivitys:</span>
              <span className="text-sm font-medium">2025-06-06</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tietokanta:</span>
              <span className="text-sm font-medium">SQLite</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Palvelin:</span>
              <span className="text-sm font-medium">Node.js 22</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Tuki</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Jos tarvitset apua järjestelmän käytössä, olen pahoillani, tukitiimiä ei ole.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Sähköposti:</span>
                <span className="text-sm text-blue-600">eiole@lab.fi</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Dokumentaatio</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h4 className="font-medium mb-2">Käyttöohje</h4>
            <p className="text-sm text-gray-600">Perusohjeita järjestelmän käyttöön</p>
          </div>
          <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h4 className="font-medium mb-2">API-dokumentaatio</h4>
            <p className="text-sm text-gray-600">Tekninen dokumentaatio kehittäjille</p>
          </div>
          <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <h4 className="font-medium mb-2">FAQ</h4>
            <p className="text-sm text-gray-600">Usein kysytyt kysymykset</p>
          </div>
        </div>
      </Card>
    </div>
  );
};