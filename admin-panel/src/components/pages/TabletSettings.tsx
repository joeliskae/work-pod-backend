import React, { useEffect, useState } from "react";
import { Tablet as TabletIcon } from "lucide-react";
import type { Tablet } from "../../types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { ConfirmModal } from "../ui/ConfirmModal";
import { ColorSelect } from "../ui/ColorSelect";
import { getCalendarIconColor } from "../../utils/colorUtils";
import { useAuth } from "../../hooks/useAuth";

export const TabletSettings: React.FC = () => {
  const { authToken } = useAuth(); // Haetaan token useAuth hookista
  const [tablets, setTablets] = useState<Tablet[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [tabletToDelete, setTabletToDelete] = useState<string | null>(null);
  const [tabletToEdit, setTabletToEdit] = useState<Tablet | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    calendarId: "",
    ipAddress: "",
    color: "",
  });

  // Apufunktio headereiden luomiseen
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  });

  // --- Datahaku ---
  useEffect(() => {
    const fetchTablets = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/tablets/get`,
          {
            headers: getAuthHeaders(),
          }
        );
        const data = await response.json();
        setTablets(data);
      } catch (error) {
        console.error("Virhe haettaessa tabletteja:", error);
      }
    };

    // Haetaan data vain jos token on saatavilla
    if (authToken) {
      fetchTablets();
    }
  }, [authToken]);

  // --- Lomakkeen käsittely ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      calendarId: "",
      ipAddress: "",
      color: "",
    });
  };

  const handleAddTablet = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tablets/add`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        }
      );
      const newTablet = await response.json();
      setTablets((prev) => [...prev, newTablet]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Virhe tallennettaessa tablettia:", error);
    }
  };

  const openEditModal = (tablet: Tablet) => {
    setTabletToEdit(tablet);
    setFormData({
      name: tablet.name,
      location: tablet.location,
      calendarId: tablet.calendarId || "",
      ipAddress: tablet.ipAddress || "",
      color: tablet.color || "red",
    });
    setShowEditModal(true);
  };

  const handleUpdateTablet = async () => {
    if (!tabletToEdit) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tablets/edit/${tabletToEdit.id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        }
      );
      const updatedTablet = await response.json();

      setTablets((prev) =>
        prev.map((t) => (t.id === updatedTablet.id ? updatedTablet : t))
      );
      setShowEditModal(false);
      setTabletToEdit(null);
      resetForm();
    } catch (error) {
      console.error("Virhe päivitettäessä tablettia:", error);
    }
  };

  const confirmDeleteTablet = (id: string) => {
    setTabletToDelete(id);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!tabletToDelete) return;

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/tablets/delete/${tabletToDelete}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      setTablets((prev) =>
        prev.filter((tablet) => tablet.id !== tabletToDelete)
      );
    } catch (error) {
      console.error("Virhe poistettaessa tablettia:", error);
    } finally {
      setShowConfirmModal(false);
      setTabletToDelete(null);
    }
  };

  // --- Lomake UI (käytetään molemmissa modaleissa) ---
  const renderTabletForm = () => (
    <div className="space-y-2">
      <div className="space-y-2">
        <Label htmlFor="name">Nimi</Label>
        <Input
          id="name"
          name="name"
          placeholder="Esim. C238-1"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Lokaatio</Label>
        <Input
          id="location"
          name="location"
          placeholder="Tila esim. C238"
          value={formData.location}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="calendarId">Kalenterin nimi (alias)</Label>
        <Input
          id="calendarId"
          name="calendarId"
          placeholder="TÄRKEÄ! Kalenterin nimi, esim. C238-1"
          value={formData.calendarId}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ipAddress">IP-osoite</Label>
        <Input
          id="ipAddress"
          name="ipAddress"
          placeholder="Esim. 172.0.0.1"
          value={formData.ipAddress}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="color">Väri</Label>
        <ColorSelect
          value={formData.color}
          onChange={(color) => setFormData((prev) => ({ ...prev, color }))}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Tablettien asetukset
        </h1>
        <Button onClick={() => setShowAddModal(true)}>Lisää tabletti</Button>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Rekisteröidyt tabletit</h3>
        <div className="space-y-4">
          {tablets.map((tablet) => (
            <div
              key={tablet.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-start space-x-4">
                <TabletIcon className={`w-24 h-24 ${getCalendarIconColor(tablet.color)} mt-1`} />
                <div className="space-y-1">
                  <h4 className="font-medium text-lg">{tablet.name}</h4>
                  <p className="text-sm text-gray-500">
                    Lokaatio: {tablet.location}
                  </p>
                  <p className="text-sm text-gray-500">
                    Kalenteri Id: {tablet.calendarId || "-"}
                  </p>
                  <p className="text-sm text-gray-500">
                    IP: {tablet.ipAddress || "-"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <div className="flex space-x-2">
                  <Button
                    variant="settings"
                    size="sm"
                    onClick={() => openEditModal(tablet)}
                  >
                    Asetukset
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => confirmDeleteTablet(tablet.id)}
                  >
                    Poista
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => {
          setShowConfirmModal(false);
          setTabletToDelete(null);
        }}
        title="Poista tabletti"
        message="Haluatko varmasti poistaa tämän tabletin?"
        confirmText="Poista"
        cancelText="Peruuta"
      />

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Lisää uusi tabletti</h2>
          {renderTabletForm()}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Peruuta
            </Button>
            <Button onClick={handleAddTablet}>Tallenna</Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Muokkaa tablettia</h2>
          {renderTabletForm()}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Peruuta
            </Button>
            <Button onClick={handleUpdateTablet}>Tallenna muutokset</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};