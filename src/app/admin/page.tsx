"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { SessionUser, Eater, User } from "@/lib/types";

export default function Admin() {
  const { data: session, status } = useSession();

  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [users, setUsers] = useState<User[]>([]);
  const [eaters, setEaters] = useState<Eater[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const router = useRouter();

  const sessionUser: SessionUser = session?.user as SessionUser;
  const sessionUserRole = sessionUser?.role;

  useEffect(() => {
    if (status === "loading") return;
    if (sessionUserRole !== "admin") {
      router.push("/");
      return;
    }
    fetchUsers();
    fetchEaters();
  }, [sessionUserRole, status, router]);

  const fetchUsers = async () => {
    const response = await fetch("/api/users");
    if (response.ok) {
      const data = await response.json();
      setUsers(data);
    }
  };

  const fetchEaters = async () => {
    const response = await fetch("/api/eaters");
    if (response.ok) {
      const data = await response.json();
      setEaters(data);
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.password.trim()) return;

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (response.ok) {
      setNewUser({ username: "", password: "" });
      fetchUsers();
    } else {
      const error = await response.json();
      alert(error.error);
    }
  };

  const resetAllScores = async () => {
    const response = await fetch("/api/eaters/reset", {
      method: "POST",
    });

    if (response.ok) {
      setShowResetModal(false);
      fetchEaters();
      alert("Alle scores zijn gereset naar 0");
    } else {
      alert("Fout bij het resetten van scores");
    }
  };

  const removeEater = async (id: number, name: string) => {
    if (!confirm(`Weet je zeker dat je ${name} wilt verwijderen?`)) return;

    const response = await fetch("/api/eaters", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      fetchEaters();
    } else {
      alert("Fout bij het verwijderen van eter");
    }
  };

  const resetEaterScore = async (id: number, name: string) => {
    if (
      !confirm(
        `Weet je zeker dat je de score van ${name} wilt resetten naar 0?`
      )
    )
      return;

    const response = await fetch("/api/eaters/reset-individual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      fetchEaters();
    } else {
      alert("Fout bij het resetten van score");
    }
  };

  const removeUser = async (id: number, username: string) => {
    if (
      !confirm(`Weet je zeker dat je gebruiker ${username} wilt verwijderen?`)
    )
      return;

    const response = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      fetchUsers();
    } else {
      alert("Fout bij het verwijderen van gebruiker");
    }
  };

  if (status === "loading") return <div>Laden...</div>;
  if (sessionUserRole !== "admin") return null;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <button
          onClick={() => router.push("/")}
          className="p-2 bg-gray-500 text-white rounded"
        >
          Terug naar Home
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Nieuwe Gebruiker Toevoegen</h2>
        <form onSubmit={addUser} className="space-y-4 max-w-md">
          <input
            type="text"
            placeholder="Gebruikersnaam"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Wachtwoord"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">
            Gebruiker Toevoegen
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Score Beheer</h2>
        <button
          onClick={() => setShowResetModal(true)}
          className="p-2 bg-orange-500 text-white rounded"
        >
          Alle Scores Resetten
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Eters Beheren</h2>
        <div className="space-y-2">
          {eaters.map((eater) => (
            <div
              key={eater.id}
              className="flex justify-between items-center p-2 border rounded"
            >
              <div>
                <span className="font-medium">{eater.name}</span>
                <span className="ml-2 text-sm text-gray-600">
                  Score: {eater.score}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => resetEaterScore(eater.id, eater.name)}
                  className="p-1 bg-orange-500 text-white rounded text-sm"
                >
                  Reset Score
                </button>
                <button
                  onClick={() => removeEater(eater.id, eater.name)}
                  className="p-1 bg-red-500 text-white rounded text-sm"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Gebruikers</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex justify-between items-center p-2 border rounded"
            >
              <div>
                <span>{user.username}</span>
                <span className="ml-2 text-sm text-gray-600">{user.role}</span>
              </div>
              {user.role !== "admin" && (
                <button
                  onClick={() => removeUser(user.id, user.username)}
                  className="p-1 bg-red-500 text-white rounded text-sm"
                >
                  Verwijderen
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)}>
        <h2 className="text-xl font-bold mb-4">Scores Resetten</h2>
        <p className="mb-4">
          Weet je zeker dat je alle scores wilt resetten naar 0?
        </p>
        <div className="flex gap-2">
          <button
            onClick={resetAllScores}
            className="p-2 bg-orange-500 text-white rounded flex-1"
          >
            Ja, Reset Alle Scores
          </button>
          <button
            onClick={() => setShowResetModal(false)}
            className="p-2 bg-gray-300 rounded flex-1"
          >
            Annuleren
          </button>
        </div>
      </Modal>
    </div>
  );
}
