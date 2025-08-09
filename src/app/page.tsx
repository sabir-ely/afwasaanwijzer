"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { Eater, SessionUser } from "@/lib/types";

export default function Home() {
  const { data: session, status } = useSession();
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [eaters, setEaters] = useState<Eater[]>([]);
  const [newEaterName, setNewEaterName] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  const sessionUser: SessionUser = session?.user as SessionUser;
  const sessionUserRole = sessionUser?.role;

  useEffect(() => {
    fetch("/api/setup")
      .then((res) => res.json())
      .then((data) => {
        setSetupComplete(data.setupComplete);
        if (!data.setupComplete) {
          router.push("/setup");
        }
      });
  }, [router]);

  useEffect(() => {
    if (session) {
      fetchEaters();
    }
  }, [session]);

  const fetchEaters = () => {
    fetch("/api/eaters")
      .then((res) => res.json())
      .then(setEaters);
  };

  const addEater = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEaterName.trim()) return;

    const response = await fetch("/api/eaters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newEaterName }),
    });

    if (response.ok) {
      setNewEaterName("");
      fetchEaters();
    } else {
      const error = await response.json();
      alert(error.error);
    }
  };

  const handleLogout = () => {
    signOut();
    setShowLogoutModal(false);
  };

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading" || setupComplete === null)
    return <div>Laden...</div>;
  if (!session) return null;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1>Welkom, {session.user?.name}!</h1>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="p-2 bg-red-500 text-white rounded"
        >
          Uitloggen
        </button>
      </div>

      <form onSubmit={addEater} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Naam van eter"
            value={newEaterName}
            onChange={(e) => setNewEaterName(e.target.value)}
            className="p-2 border rounded flex-1"
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">
            Eter Toevoegen
          </button>
        </div>
      </form>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => router.push("/selection")}
          className="p-2 bg-green-500 text-white rounded"
        >
          Naar Selectie
        </button>
        <button
          onClick={() => router.push("/history")}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Geschiedenis
        </button>
        {sessionUserRole === "admin" && (
          <button
            onClick={() => router.push("/admin")}
            className="p-2 bg-red-500 text-white rounded"
          >
            Admin
          </button>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Eters</h2>
        {eaters.length === 0 ? (
          <p>Nog geen eters</p>
        ) : (
          <div className="space-y-2">
            {eaters.map((eater) => (
              <div
                key={eater.id}
                className="flex justify-between p-2 border rounded max-w-64"
              >
                <span>{eater.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <p className="mb-4">Weet je zeker dat je wilt uitloggen?</p>
        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="p-2 bg-red-500 text-white rounded"
          >
            Ja, Uitloggen
          </button>
          <button
            onClick={() => setShowLogoutModal(false)}
            className="p-2 bg-gray-300 rounded"
          >
            Annuleren
          </button>
        </div>
      </Modal>
    </div>
  );
}
