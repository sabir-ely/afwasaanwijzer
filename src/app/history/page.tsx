"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type HistoryEntry = {
  id: number;
  dishwashers: string;
  present: string;
  hasCooked: string;
  timestamp: string;
};

type HistoryResponse = {
  history: HistoryEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function History() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/history?page=${currentPage}`)
      .then((res) => res.json())
      .then(setData);
  }, [currentPage]);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") return <div>Laden...</div>;
  if (!session) return null;

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("nl-NL");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Geschiedenis</h1>
        <button
          onClick={() => router.push("/")}
          className="p-2 bg-gray-500 text-white rounded"
        >
          Terug naar Home
        </button>
      </div>

      <div className="space-y-4">
        {!data || data.history.length === 0 ? (
          <p>Nog geen geschiedenis</p>
        ) : (
          data.history.map((entry) => (
            <div key={entry.id} className="border rounded p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">Afwassers Selectie</h3>
                <span className="text-sm text-gray-600">
                  {formatDate(entry.timestamp)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-purple-600 mb-2">
                    🧽 Afwassers
                  </h4>
                  <div className="space-y-1">
                    {JSON.parse(entry.dishwashers).map(
                      (name: string, idx: number) => (
                        <div
                          key={idx}
                          className="text-sm bg-purple-100 p-1 rounded"
                        >
                          {name}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">
                    👥 Aanwezig
                  </h4>
                  <div className="space-y-1">
                    {JSON.parse(entry.present).map(
                      (name: string, idx: number) => (
                        <div
                          key={idx}
                          className="text-sm bg-blue-100 p-1 rounded"
                        >
                          {name}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-600 mb-2">
                    👨‍🍳 Heeft Gekookt
                  </h4>
                  <div className="space-y-1">
                    {JSON.parse(entry.hasCooked).map(
                      (name: string, idx: number) => (
                        <div
                          key={idx}
                          className="text-sm bg-green-100 p-1 rounded"
                        >
                          {name}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Vorige
          </button>
          <span className="p-2">
            Pagina {currentPage} van {data.pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(data.pagination.totalPages, p + 1))
            }
            disabled={currentPage === data.pagination.totalPages}
            className="p-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Volgende
          </button>
        </div>
      )}
    </div>
  );
}
