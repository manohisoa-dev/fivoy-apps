import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Package, RefreshCcw } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../api/api";

const statusConfig = {
  ok: {
    label: "OK",
    cardClass: "border-green-100 bg-green-50",
    badgeClass: "bg-green-100 text-green-700",
    icon: CheckCircle2,
    message: "Stock suffisant",
  },
  low: {
    label: "Stock faible",
    cardClass: "border-orange-100 bg-orange-50",
    badgeClass: "bg-orange-100 text-orange-700",
    icon: AlertTriangle,
    message: "Stock faible",
  },
  critical: {
    label: "Critique",
    cardClass: "border-red-100 bg-red-50",
    badgeClass: "bg-red-100 text-red-700",
    icon: AlertTriangle,
    message: "Stock critique",
  },
};

const StockPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStock = async () => {
    try {
      setLoading(true);
      const response = await api.get("/stock/summary");
      setItems(response.data?.items || []);
    } catch (error) {
      console.error("Erreur chargement stock:", error);
      Swal.fire({
        title: "Erreur chargement stock",
        text: "Impossible de charger le résumé du stock.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Package className="w-8 h-8 text-primary" />
              Stock intelligent
            </h1>
            <p className="text-gray-600">Suivi automatique basé sur les ventes enregistrées.</p>
          </div>

          <button
            onClick={loadStock}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => {
              const status = statusConfig[item.status] || statusConfig.ok;
              const StatusIcon = status.icon;
              const remaining = Number(item.remaining || 0);
              const initial = Number(item.initial || 0);
              const used = Number(item.used || 0);
              const percent = initial > 0 ? Math.min(100, Math.round((remaining / initial) * 100)) : 0;

              return (
                <div key={item.name} className={`border rounded-lg shadow-sm p-5 ${status.cardClass}`}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-gray-800 truncate">{item.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {remaining.toLocaleString("fr-FR")} / {initial.toLocaleString("fr-FR")} feuilles
                      </p>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${status.badgeClass}`}>
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="h-3 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Stock restant</span>
                      <span className="font-semibold text-gray-800">{remaining.toLocaleString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Stock initial</span>
                      <span className="font-semibold text-gray-800">{initial.toLocaleString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Utilisé</span>
                      <span className="font-semibold text-gray-800">{used.toLocaleString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Statut</span>
                      <span className="font-semibold text-gray-800">{status.message}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucun stock disponible.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockPage;
