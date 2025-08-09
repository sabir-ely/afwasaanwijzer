"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eater } from "@/lib/types";

export default function Result() {
  const { data: session, status } = useSession();
  const [dishwashers, setDishwashers] = useState<Eater[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const dishwasherIds = searchParams.get("dishwashers");
    if (dishwasherIds) {
      const ids = JSON.parse(dishwasherIds);
      fetch("/api/eaters")
        .then((res) => res.json())
        .then((eaters: Eater[]) => {
          const selectedDishwashers = eaters.filter((e) => ids.includes(e.id));
          setDishwashers(selectedDishwashers);
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
