import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const SalesTable = ({
  sales,
  onEdit,
  onDelete,
  loading,
  page,
  setPage,
  pageSize,
  totalCount,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="text-left px-3 py-2">Date</th>
            <th className="text-left px-3 py-2">Client</th>
            <th className="text-left px-3 py-2">Articles</th>
            <th className="text-right px-3 py-2">Total</th>
            <th className="text-left px-3 py-2">Paiement</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="px-3 py-2">
                <div className="leading-tight">
                    {/* Date business: correspond au filtre */}
                    <div className="font-medium">
                    {s.date
                        ? new Date(`${s.date}T00:00:00`).toLocaleDateString("fr-FR", {
                            timeZone: "Indian/Antananarivo", // optionnel
                        })
                        : "—"}
                    </div>
                    {/* Heure de saisie réelle (facultatif mais utile) */}
                    {s.created_at && (
                    <div className="text-xs text-gray-500">
                        à{" "}
                        {new Date(s.created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Indian/Antananarivo", // optionnel
                        })}
                    </div>
                    )}
                </div>
              </td>
              <td className="px-3 py-2">
                {s.client || <span className="text-gray-400">—</span>}
              </td>
              <td className="px-3 py-2">
                <div
                  className="max-w-[420px] truncate"
                  title={(s.items || [])
                    .map((i) => {
                      const label = i.product_name || i.custom_name || i.name;
                      return `${label} x${i.quantity}`;
                    })
                    .join(" • ")}
                >
                  {(s.items || []).map((i) => {
                      const label = i.product_name || i.custom_name || i.name;
                      return `${label} x${i.quantity}`;
                    }).join(" • ")}
                </div>
              </td>
              <td className="px-3 py-2 text-right font-semibold">
                {Number(s.total || 0).toLocaleString("fr-FR")} Ar
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-col">
                  <span>{s.modePaiement}</span>
                  {s.notes && (
                    <span className="text-xs text-gray-500">
                      {s.notes}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2 justify-center">
                  <button
                    className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => onEdit(s)}
                    title="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    onClick={() => onDelete(s.id)}
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            disabled={loading || page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 border rounded-lg disabled:opacity-50"
          >
            ← Précédent
          </button>
          <span className="text-sm text-gray-600">
            Page <b>{page}</b> /{" "}
            <b>{Math.max(1, Math.ceil(totalCount / pageSize))}</b>
          </span>
          <button
            disabled={loading || page >= Math.ceil(totalCount / pageSize)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 border rounded-lg disabled:opacity-50"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
};

export default SalesTable;
