import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Package, Plus, RefreshCcw, X } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../api/api";

const normalizeStockLabel = (name = "") => name.replace(/^Achat\s+/i, "").trim();

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
  const [stockableCategories, setStockableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRestock, setShowRestock] = useState(false);
  const [restockForm, setRestockForm] = useState({
    stock_item_id: "",
    quantity: "",
    note: "",
  });

  const loadStock = async () => {
    try {
      setLoading(true);
      const [stockResponse, categoriesResponse] = await Promise.all([
        api.get("/stock/summary"),
        api.get("/expense-categories"),
      ]);
      const categories = categoriesResponse.data || [];
      const filteredCategories = categories.filter((category) => category.is_stockable === true);
      const dropdownCategories = filteredCategories
        .map((category) => ({
          ...category,
          label: normalizeStockLabel(category.name),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'fr-FR'));

      console.log("categories récupérées API", categories);
      console.log("categories filtrées (is_stockable=true)", filteredCategories);
      console.log("dropdown final (normalisé + trié)", dropdownCategories);

      setItems(stockResponse.data?.items || []);
      setStockableCategories(dropdownCategories);
    } catch (error) {
      console.error("Erreur chargement stock:", error);
      Swal.fire({
        title: "Erreur chargement stock",
        text: "Impossible de charger le resume du stock.",
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
    const syncStock = () => loadStock();

    window.addEventListener("focus", syncStock);
    window.addEventListener("stockable-categories:updated", syncStock);

    return () => {
      window.removeEventListener("focus", syncStock);
      window.removeEventListener("stockable-categories:updated", syncStock);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRestock = async (event) => {
    event.preventDefault();

    if (!restockForm.stock_item_id) {
      Swal.fire({
        title: "Produit requis",
        text: "Aucun produit stockable n'a ete selectionne.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      await api.post("/stock/restock", {
        stock_item_id: restockForm.stock_item_id,
        quantity: Number(restockForm.quantity),
        note: restockForm.note || "Reapprovisionnement manuel",
      });

      setShowRestock(false);
      setRestockForm({
        stock_item_id: "",
        quantity: "",
        note: "",
      });
      await loadStock();

      Swal.fire({
        title: "Stock mis a jour",
        text: "Le reapprovisionnement manuel a ete enregistre.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Erreur reapprovisionnement:", error);
      Swal.fire({
        title: "Erreur",
        text: "Impossible d'enregistrer le reapprovisionnement.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const stockDisplayName = (item) => {
    const category = stockableCategories.find((option) => option.stock_item_id === item.id);
    return category?.label || normalizeStockLabel(item.name);
  };

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
            <p className="text-gray-600">Suivi automatique base sur les ventes, depenses et reapprovisionnements.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowRestock(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Reapprovisionner manuel
            </button>
            <button
              onClick={loadStock}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        {showRestock && (
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Reapprovisionnement manuel</h2>
              <button
                onClick={() => setShowRestock(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestock} className="grid grid-cols-1 md:grid-cols-[1fr_180px_1fr_auto] gap-3">
              <select
                value={restockForm.stock_item_id}
                onChange={(e) => setRestockForm((prev) => ({ ...prev, stock_item_id: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-2"
                required
                disabled={stockableCategories.length === 0}
              >
                <option value="">
                  {stockableCategories.length === 0 ? "Aucun produit stockable configuré" : "Produit stock"}
                </option>
                {stockableCategories.map((category) => (
                  <option key={category.id} value={category.stock_item_id || category.id}>{category.label}</option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={restockForm.quantity}
                onChange={(e) => setRestockForm((prev) => ({ ...prev, quantity: e.target.value }))}
                placeholder="Quantite"
                className="border border-gray-300 rounded px-3 py-2"
                required
                disabled={stockableCategories.length === 0}
              />

              <input
                type="text"
                value={restockForm.note}
                onChange={(e) => setRestockForm((prev) => ({ ...prev, note: e.target.value }))}
                placeholder="Note"
                className="border border-gray-300 rounded px-3 py-2"
                disabled={stockableCategories.length === 0}
              />

              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover"
                disabled={stockableCategories.length === 0}
              >
                Ajouter
              </button>
            </form>
            {stockableCategories.length === 0 && (
              <p className="mt-3 text-sm text-orange-600">Aucun produit stockable configuré</p>
            )}
          </div>
        )}

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => {
              const status = statusConfig[item.status] || statusConfig.ok;
              const StatusIcon = status.icon;
              const remaining = Number(item.remaining || 0);
              const initial = Number(item.initial || 0);
              const added = Number(item.added || 0);
              const available = Number(item.available || initial);
              const used = Number(item.used || 0);
              const percent = available > 0 ? Math.min(100, Math.round((remaining / available) * 100)) : 0;

              return (
                <div key={item.name} className={`border rounded-lg shadow-sm p-5 ${status.cardClass}`}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-gray-800 truncate">{stockDisplayName(item)}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {remaining.toLocaleString("fr-FR")} / {available.toLocaleString("fr-FR")} feuilles
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
                      <span className="text-gray-600">Ajoute</span>
                      <span className="font-semibold text-gray-800">{added.toLocaleString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Utilise</span>
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
