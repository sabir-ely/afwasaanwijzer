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

function ResultContent() {
  const { data: session, status } = useSession();
  const [dishwashers, setDishwashers] = useState<Eater[]>([]);
  const [cookers, setCookers] = useState<Eater[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const dishwasherIdsParam = searchParams.get("dishwashers");
    const cookerIdsParam = searchParams.get("cookers");

    if (dishwasherIdsParam && cookerIdsParam) {
      const dishwasherIds = JSON.parse(dishwasherIdsParam);
      const cookerIds = JSON.parse(cookerIdsParam);

      fetch("/api/eaters")
        .then((res) => res.json())
        .then((eaters: Eater[]) => {
          const selectedDishwashers = eaters.filter((e) =>
            dishwasherIds.includes(e.id)
          );
          setDishwashers(selectedDishwashers);

          const cookers = eaters.filter((e) => cookerIds.includes(e.id));
          setCookers(cookers);
        });
    }
  }, [searchParams]);

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
