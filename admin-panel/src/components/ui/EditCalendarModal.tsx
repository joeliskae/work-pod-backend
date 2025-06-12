import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { ColorSelect } from './ColorSelect';

interface EditCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendar: { id: string; name: string; color?: string };
  onSave: (id: string, newAlias: string, newColor: string) => void;
}

export const EditCalendarModal: React.FC<EditCalendarModalProps> = ({
  isOpen,
  onClose,
  calendar,
  onSave,
}) => {
  const [alias, setAlias] = useState(calendar.name);
  const [color, setColor] = useState(calendar.color || 'blue');

  useEffect(() => {
    if (isOpen) {
      setAlias(calendar.name);
      setColor(calendar.color || 'blue');
    }
  }, [isOpen, calendar]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (alias.trim() === '') {
      alert('Alias ei voi olla tyhjä');
      return;
    }
    onSave(calendar.id, alias.trim(), color);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Muokkaa kalenteria</h2>
        <input
          className="w-full border border-gray-300 rounded p-2 mb-4"
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Kalenterin alias"
          autoFocus
        />
        <div className="mb-4">
          <label className="block font-medium text-gray-700 mb-2">Väri:</label>
          <ColorSelect value={color} onChange={setColor} />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>
            Peruuta
          </Button>
          <Button onClick={handleSave}>Tallenna</Button>
        </div>
      </div>
    </div>
  );
};