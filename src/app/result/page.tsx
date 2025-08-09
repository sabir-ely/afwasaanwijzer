"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eater } from "@/lib/types";

const getFullPrice = (
  total: number,
  halfPricers: number,
  fullPricers: number
) => {
  return total / (0.5 * halfPricers + fullPricers);
};

const formatPrice = (price: number) => {
  return price.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
  });
};

const roundTo20Cents = (amount: number) => {
  return Math.ceil(amount / 0.2) * 0.2;
};

function ResultContent() {
  const { data: session, status } = useSession();
  const [dishwashers, setDishwashers] = useState<Eater[]>([]);
  const [cookers, setCookers] = useState<Eater[]>([]);
  const [presentEaters, setPresentEaters] = useState<Eater[]>([]);
  const [fullPrice, setFullPrice] = useState<number>(0);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [euros, setEuros] = useState("");
  const [cents, setCents] = useState("");
  const dinnerCost = parseFloat(euros || "0") + parseFloat(cents || "0") / 100;

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const dishwasherIdsParam = searchParams.get("dishwashers");
    const cookerIdsParam = searchParams.get("cookers");
    const presentIdsParam = searchParams.get("present");

    if (dishwasherIdsParam && cookerIdsParam && presentIdsParam) {
      const dishwasherIds: number[] = JSON.parse(dishwasherIdsParam);
      const cookerIds: number[] = JSON.parse(cookerIdsParam);
      const presentIds: number[] = JSON.parse(presentIdsParam);

      fetch("/api/eaters")
        .then((res) => res.json())
        .then((eaters: Eater[]) => {
          const selectedDishwashers = eaters.filter((e) =>
            dishwasherIds.includes(e.id)
          );
          setDishwashers(selectedDishwashers);

          const cookers = eaters.filter((e) => cookerIds.includes(e.id));
          setCookers(cookers);

          const present = eaters.filter(
            (e) => presentIds.includes(e.id) && !dishwasherIds.includes(e.id)
          );
          setPresentEaters(present);
        });
    }
  }, [searchParams]);

  useEffect(() => {
    if (dinnerCost > 0 && dishwashers.length > 0) {
      setFullPrice(
        getFullPrice(
          dinnerCost,
          dishwashers.length + cookers.length,
          presentEaters.length
        )
      );
    }
  }, [dinnerCost, dishwashers.length, cookers.length, presentEaters.length]);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") return <div>Laden...</div>;
  if (!session) return null;

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">🧽 Afwassers Gekozen! 🧽</h1>
        <p className="text-gray-600">De volgende personen gaan afwassen:</p>
      </div>

      <div className="max-w-md mx-auto space-y-4 mb-8">
        {dishwashers.map((dishwasher) => (
          <div
            key={dishwasher.id}
            className="p-4 bg-blue-100 border-2 border-blue-300 rounded-lg text-center"
          >
            <div className="text-xl font-bold">{dishwasher.name}</div>
          </div>
        ))}
      </div>

      <div className="max-w-md mx-auto mb-8">
        <div className="text-center mb-6">
          <label className="block text-sm font-medium mb-2">
            Kosten avondeten
          </label>
          <div className="flex items-center justify-center gap-1">
            <span className="text-lg">€</span>
            <input
              type="number"
              placeholder="0"
              value={euros}
              onChange={(e) => setEuros(e.target.value)}
              className="p-2 border rounded text-center w-16"
            />
            <input
              type="number"
              min="0"
              max="99"
              placeholder="00"
              value={cents}
              onChange={(e) => setCents(e.target.value)}
              className="p-2 border rounded text-center w-16"
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4 text-center">
          Betaling Checklist
        </h2>
        <div className="space-y-2">
          {[...cookers, ...dishwashers, ...presentEaters].map((eater) => {
            const isCookerOrDishwasher =
              cookers.some((c) => c.id === eater.id) ||
              dishwashers.some((d) => d.id === eater.id);
            const rawAmount = isCookerOrDishwasher
              ? fullPrice * 0.5
              : fullPrice;
            console.log(rawAmount);
            const amount = roundTo20Cents(rawAmount);
            const isChecked = checkedItems.has(eater.id);

            return (
              <div
                key={eater.id}
                className={`flex items-center justify-between p-2 border rounded ${
                  isChecked ? "bg-green-100 line-through" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      const newChecked = new Set(checkedItems);
                      if (isChecked) {
                        newChecked.delete(eater.id);
                      } else {
                        newChecked.add(eater.id);
                      }
                      setCheckedItems(newChecked);
                    }}
                    className="w-4 h-4"
                  />
                  <span>{eater.name}</span>
                </div>
                <span className="font-bold">{formatPrice(amount)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => router.push("/")}
          className="p-3 bg-green-500 text-white rounded-lg"
        >
          Terug naar Home
        </button>
      </div>
    </div>
  );
}

export default function Result() {
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <ResultContent />
    </Suspense>
  );
}
