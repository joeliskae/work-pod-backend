import React, { useEffect, useState } from "react";
import { User as UserIcon } from "lucide-react";
import { type User } from "../../types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { ConfirmModal } from "../ui/ConfirmModal";

export const UserSettings: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/get`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Virhe haettaessa käyttäjiä:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
    });
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const newUser = await response.json();
      setUsers((prev) => [...prev, newUser]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Virhe lisättäessä käyttäjää:", error);
    }
  };

  const openEditModal = (user: User) => {
    setUserToEdit(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!userToEdit) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/edit/${userToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const updatedUser = await response.json();

      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setShowEditModal(false);
      setUserToEdit(null);
      resetForm();
    } catch (error) {
      console.error("Virhe päivitettäessä käyttäjää:", error);
    }
  };

  const confirmDeleteUser = (id: string) => {
    setUserToDelete(id);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!userToDelete) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/users/delete/${userToDelete}`, {
        method: "DELETE",
      });
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete));
    } catch (error) {
      console.error("Virhe poistettaessa käyttäjää:", error);
    } finally {
      setShowConfirmModal(false);
      setUserToDelete(null);
    }
  };

  const renderUserForm = () => (
    <div className="space-y-2">
      <div className="space-y-2">
        <Label htmlFor="name">Nimi</Label>
        <Input
          id="name"
          name="name"
          placeholder="Käyttäjän nimi"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Sähköposti</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="esim. etunimi.sukunimi@example.com"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Rooli</Label>
        <select
          id="role"
          name="role"
          className="w-full border rounded px-2 py-1"
          value={formData.role}
          onChange={handleInputChange}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Käyttäjien hallinta</h1>
        <Button onClick={() => setShowAddModal(true)}>Lisää käyttäjä</Button>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Rekisteröidyt käyttäjät</h3>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-start space-x-4">
                <UserIcon className={`w-16 h-16 ${user.role === "admin" ? "text-red-400" : "text-green-300"}  mt-1`} />
                <div className="space-y-1">
                  <h4 className="font-medium text-lg">{user.name}</h4>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <div className="flex space-x-2">
                  <Button
                    variant="settings"
                    size="sm"
                    onClick={() => openEditModal(user)}
                  >
                    Muokkaa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => confirmDeleteUser(user.id)}
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
          setUserToDelete(null);
        }}
        title="Poista käyttäjä"
        message="Haluatko varmasti poistaa tämän käyttäjän?"
        confirmText="Poista"
        cancelText="Peruuta"
      />

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Lisää uusi käyttäjä</h2>
          {renderUserForm()}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Peruuta
            </Button>
            <Button onClick={handleAddUser}>Tallenna</Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Muokkaa käyttäjää</h2>
          {renderUserForm()}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Peruuta
            </Button>
            <Button onClick={handleUpdateUser}>Tallenna muutokset</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
