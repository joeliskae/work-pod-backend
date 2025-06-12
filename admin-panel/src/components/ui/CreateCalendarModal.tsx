import React, { useState } from "react";
import { ColorSelect } from "./ColorSelect";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (alias: string) => Promise<void>;
};

export const CreateCalendarModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [alias, setAlias] = useState("");
  const [color, setColor] = useState("gray");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!alias.trim()) {
      setError("Alias ei voi olla tyhjä");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onCreate(alias.trim());
      setAlias("");
      setColor("gray");
      onClose();
    } catch (e: any) {
      setError(e.message || "Kalenterin luonti epäonnistui");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        aria-label="Sulje modal"
      />
      <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Luo uusi kalenteri</h2>

        <input
          type="text"
          placeholder="Kalenterin alias (esim. C238-3)"
          className="w-full border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:ring"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          disabled={loading}
        />

        <div className="mb-4">
          <label className="block font-medium text-gray-700 mb-2">
            Kalenterin väri:
          </label>
          <ColorSelect value={color} onChange={setColor} />
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            onClick={onClose}
            disabled={loading}
          >
            Peruuta
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Luodaan..." : "Luo"}
          </button>
        </div>
      </div>
    </>
  );
};