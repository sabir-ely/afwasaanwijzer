"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { Eater } from "@/lib/types";

export default function Selection() {
  const { data: session, status } = useSession();
  const [eaters, setEaters] = useState<Eater[]>([]);
  const [present, setPresent] = useState<number[]>([]);
  const [hasCooked, setHasCooked] = useState<number[]>([]);
  const [showDishwasherModal, setShowDishwasherModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetch("/api/eaters")
      .then((res) => res.json())
      .then(setEaters);

    const savedPresent = localStorage.getItem("selection-present");
    const savedHasCooked = localStorage.getItem("selection-hasCooked");

    if (savedPresent) setPresent(JSON.parse(savedPresent));
    if (savedHasCooked) setHasCooked(JSON.parse(savedHasCooked));
  }, []);

  if (status === "loading") return <div>Laden...</div>;
  if (!session) return null;

  const handleConfirm = async () => {
    // Subtract points from has cooked
    for (const id of hasCooked) {
      await fetch("/api/eaters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, scoreChange: -1 }),
      });
    }

    // Get present eaters with updated scores
    const response = await fetch("/api/eaters");
    const allEaters: Eater[] = await response.json();
    const presentEaters = allEaters.filter((e: Eater) =>
      present.includes(e.id)
    );

    // Sort by score (highest first) and handle ties randomly
    const sortedPresent: Eater[] = presentEaters.sort((a: Eater, b: Eater) => {
      if (b.score === a.score) return Math.random() - 0.5;
      return b.score - a.score;
    });

    const dishwashers = sortedPresent.slice(0, 2);
    const nonDishwashers = sortedPresent.slice(2);

    // Update scores: dishwashers -1, non-dishwashers +1
    for (const dishwasher of dishwashers) {
      await fetch("/api/eaters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dishwasher.id, scoreChange: -1 }),
      });
    }

    for (const nonDishwasher of nonDishwashers) {
      await fetch("/api/eaters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: nonDishwasher.id, scoreChange: 1 }),
      });
    }

    // Log to history
    const dishwasherNames = dishwashers.map((d) => d.name);
    const presentNames = allEaters
      .filter((e: Eater) => present.includes(e.id))
      .map((e: Eater) => e.name);
    const hasCookedNames = allEaters
      .filter((e: Eater) => hasCooked.includes(e.id))
      .map((e: Eater) => e.name);

    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dishwashers: dishwasherNames,
        present: presentNames,
        hasCooked: hasCookedNames,
        price: 0,
      }),
    });

    // Clear selection state
    localStorage.removeItem("selection-present");
    localStorage.removeItem("selection-hasCooked");

    // Navigate to result page
    const dishwasherIds = dishwashers.map((x) => x.id);
    const cookerIds = hasCookedEaters.map((x) => x.id);
    const presentIds = presentEaters.map((x) => x.id);
    router.push(
      `/result?dishwashers=${JSON.stringify(
        dishwasherIds
      )}&cookers=${JSON.stringify(cookerIds)}&present=${JSON.stringify(
        presentIds
      )}`
    );
  };

  const moveToPresent = (id: number) => {
    const newPresent = [...present, id];
    const newHasCooked = hasCooked.filter((i) => i !== id);
    setPresent(newPresent);
    setHasCooked(newHasCooked);
    setSearchTerm("");
    localStorage.setItem("selection-present", JSON.stringify(newPresent));
    localStorage.setItem("selection-hasCooked", JSON.stringify(newHasCooked));
  };

  const moveToHasCooked = (id: number) => {
    const newHasCooked = [...hasCooked, id];
    const newPresent = present.filter((i) => i !== id);
    setHasCooked(newHasCooked);
    setPresent(newPresent);
    setSearchTerm("");
    localStorage.setItem("selection-hasCooked", JSON.stringify(newHasCooked));
    localStorage.setItem("selection-present", JSON.stringify(newPresent));
  };

  const moveToUnselected = (id: number) => {
    const newPresent = present.filter((i) => i !== id);
    const newHasCooked = hasCooked.filter((i) => i !== id);
    setPresent(newPresent);
    setHasCooked(newHasCooked);
    localStorage.setItem("selection-present", JSON.stringify(newPresent));
    localStorage.setItem("selection-hasCooked", JSON.stringify(newHasCooked));
  };

  const unselectedEaters = eaters.filter(
    (e) =>
      !present.includes(e.id) &&
      !hasCooked.includes(e.id) &&
      e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const presentEaters = eaters.filter((e) => present.includes(e.id));
  const hasCookedEaters = eaters.filter((e) => hasCooked.includes(e.id));

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Selectie</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => router.push("/history")}
            className="p-2 bg-blue-500 text-white rounded text-sm"
          >
            Geschiedenis
          </button>
          <button
            onClick={() => router.push("/")}
            className="p-2 bg-gray-500 text-white rounded text-sm"
          >
            Terug naar Home
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Zoek naam..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded text-base"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:order-2 flex flex-col lg:flex-row gap-4 lg:flex-1">
          <div className="border-2 border-green-300 rounded p-2 sm:p-4 min-h-24 flex-1">
            <h3 className="font-bold mb-4 text-center text-green-600 text-sm sm:text-base">
              Heeft Gekookt
            </h3>
            <div className="space-y-2">
              {hasCookedEaters.map((eater) => (
                <div
                  key={eater.id}
                  className="p-2 bg-green-100 rounded cursor-pointer"
                >
                  <div className="font-medium text-base">{eater.name}</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => moveToUnselected(eater.id)}
                      className="text-xs p-1 bg-gray-500 text-white rounded"
                    >
                      Verwijderen
                    </button>
                    <button
                      onClick={() => moveToPresent(eater.id)}
                      className="text-xs p-1 bg-blue-500 text-white rounded"
                    >
                      Aanwezig
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-2 border-blue-300 rounded p-2 sm:p-4 min-h-24 flex-1">
            <h3 className="font-bold mb-4 text-center text-blue-600 text-sm sm:text-base">
              Aanwezig
            </h3>
            <div className="space-y-2">
              {presentEaters.map((eater) => (
                <div
                  key={eater.id}
                  className="p-2 bg-blue-100 rounded cursor-pointer"
                >
                  <div className="font-medium text-base">{eater.name}</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => moveToUnselected(eater.id)}
                      className="text-xs p-1 bg-gray-500 text-white rounded"
                    >
                      Verwijderen
                    </button>
                    <button
                      onClick={() => moveToHasCooked(eater.id)}
                      className="text-xs p-1 bg-green-500 text-white rounded"
                    >
                      Heeft Gekookt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:order-1 border-2 border-gray-300 rounded p-2 sm:p-4 min-h-48 lg:min-h-96 w-full lg:w-120">
          <h3 className="font-bold mb-2 text-center text-sm sm:text-base">
            Niet Geselecteerd
          </h3>
          <div className="space-y-2">
            {unselectedEaters.map((eater) => (
              <div
                key={eater.id}
                className="p-2 bg-gray-100 rounded cursor-pointer"
              >
                <div className="font-medium text-base">{eater.name}</div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => moveToPresent(eater.id)}
                    className="text-xs py-3 px-2 bg-blue-500 text-white rounded flex-1"
                  >
                    Aanwezig
                  </button>
                  <button
                    onClick={() => moveToHasCooked(eater.id)}
                    className="text-xs py-3 px-2 bg-green-500 text-white rounded flex-1"
                  >
                    Heeft Gekookt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => setShowDishwasherModal(true)}
          className="p-3 bg-purple-500 text-white rounded-lg text-sm sm:text-lg w-full sm:w-auto"
        >
          Afwassers Kiezen
        </button>
      </div>

      <Modal
        isOpen={showDishwasherModal}
        onClose={() => setShowDishwasherModal(false)}
      >
        <h2 className="text-xl font-bold mb-4">Afwassers Kiezen</h2>

        <div className="mb-4">
          <h3 className="font-bold text-green-600 mb-2">
            Heeft Gekookt ({hasCookedEaters.length})
          </h3>
          <div className="space-y-1">
            {hasCookedEaters.map((eater) => (
              <div key={eater.id} className="p-2 bg-green-100 rounded text-sm">
                {eater.name}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-blue-600 mb-2">
            Aanwezig ({presentEaters.length})
          </h3>
          <div className="space-y-1">
            {presentEaters.map((eater) => (
              <div key={eater.id} className="p-2 bg-blue-100 rounded text-sm">
                {eater.name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="p-2 bg-green-500 text-white rounded flex-1"
          >
            Bevestigen
          </button>
          <button
            onClick={() => setShowDishwasherModal(false)}
            className="p-2 bg-gray-300 rounded flex-1"
          >
            Annuleren
          </button>
        </div>
      </Modal>
    </div>
  );
}
