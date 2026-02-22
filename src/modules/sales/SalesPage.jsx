import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Plus, Search, Trash2, Pencil, RotateCcw, Download } from "lucide-react";
import SaleForm from "./SaleForm";
import SalesTable from "./SalesTable";
import { loadFromStorage, saveToStorage, exportArrayToCSV } from "../../utils/storage";
import { fetchSales, createSale, updateSale, deleteSale as deleteSaleDb } from "./salesApi";
import { useLoadingStore } from '../../store/loading';
import DailyCash from "./DailyCash";

const STORAGE_KEY = "fivoy_sales_v1";

const SalesPage = () => {
  const { withLoading } = useLoadingStore.getState();
  const [sales, setSales] = useState([]);
  const [query, setQuery] = useState("");
  const [editingSale, setEditingSale] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); 
  const [totalCount, setTotalCount] = useState(0);
  const [totalJour, setTotalJour] = useState(0);
  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const loadPage = async () => {
    setLoading(true);
    try {
      const salesList = await fetchSales();

      const filtered = salesList.filter(s => s.date === selectedDate);

      setSales(filtered);
      setTotalCount(filtered.length);

      const total = filtered.reduce(
        (sum, s) => sum + Number(s.total || 0),
        0
      );

      setTotalJour(total);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  loadPage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedDate, page, pageSize, query]);

  // Sauvegarde automatique
  useEffect(() => {
    saveToStorage(STORAGE_KEY, sales);
  }, [sales]);

  const filtered = useMemo(() => {
    if (!query.trim()) return sales;
    const q = query.toLowerCase();
    return sales.filter((s) =>
      [s.client, s.notes, s.modePaiement, ...(s.items || []).map(i => i.name)]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [query, sales]);

  const handleCreate = () => {
    setEditingSale(null);
    setShowForm(true);
  };

 const handleSave = async (sale) => {
  if (saving) return;               // évite double-clic / double Enter
  setSaving(true);
  try {
    if (sale.id) {
      await updateSale(sale);       // update côté DB
      await loadPage();             // recharge depuis la DB
    } else {
      await createSale(sale);       // ⬅️ UN SEUL appel
      setPage(1);                   // revenir à la 1ère page si tu veux voir la dernière vente en haut
      await loadPage();             // recharge depuis la DB
    }
  } catch (e) {
    console.error("Erreur Supabase:", e);
    alert("Erreur de sauvegarde. Vérifie ta connexion.");
  } finally {
    setShowForm(false);
    setEditingSale(null);
    setSaving(false);
  }
};


  const handleEdit = (sale) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const ask = async () => {
      if (window.Swal) {
        const res = await window.Swal.fire({
          title: "Supprimer cette vente ?",
          text: "Cette action est irréversible.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Oui, supprimer",
          cancelButtonText: "Annuler",
          confirmButtonColor: "#dc2626",
        });
        return res.isConfirmed;
      }
      return window.confirm("Supprimer cette vente ?");
    };

    if (!(await ask())) return;
    try {
        await deleteSaleDb(id); // suppression en base
        // si la page devient vide après suppression (ex: dernière ligne de la dernière page),
        // on recule d'une page si possible
        const nextCount = totalCount - 1;
        const maxPage = Math.max(1, Math.ceil(nextCount / pageSize));
        setPage(p => Math.min(p, maxPage));
        await loadPage();
        if (window.Swal) {
        window.Swal.fire({ title: "Supprimé", icon: "success", timer: 900, showConfirmButton: false });
        }
    } catch (e) {
        console.error("Erreur lors de la suppression Supabase:", e);
        alert("Impossible de supprimer la vente sur Supabase.");
}
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert("Aucune vente à exporter.");
      return;
    }
    const flat = filtered.map(s => ({
      id: s.id,
      date: s.date,
      client: s.client || "",
      total: s.total,
      modePaiement: s.modePaiement,
      items: (s.items || []).map(i => `${i.name} x${i.qty} @ ${i.price}`).join(" | "),
      notes: s.notes || ""
    }));
    exportArrayToCSV(flat, `ventes-${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-8 h-8 text-violet-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Ventes</h1>
                <p className="text-gray-500 text-sm">Suivi des ventes — les données sont stockées et sécurisées en ligne.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCreate}
                className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nouvelle vente
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher (client, article, note, mode de paiement...)"
              className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Filtres date / taille de page */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Date :</span>
            <input
            type="date"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedDate}
            onChange={(e) => { setPage(1); setSelectedDate(e.target.value); }}
            />
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Par page :</span>
            <select
            className="px-2 py-2 border border-gray-300 rounded-lg"
            value={pageSize}
            onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}
            >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            </select>
        </div>
        <div className="ml-auto text-sm text-gray-700">
            <span className="mr-2">Résultats : <b>{totalCount}</b></span>
            <span className="mr-2">• Total du {selectedDate} : <b className="text-gray-900">{totalJour.toLocaleString("fr-FR")} Ar</b></span>
            <span>• Total (page) : <b className="text-gray-900">
            {sales.reduce((sum, s) => sum + Number(s.total || 0), 0).toLocaleString("fr-FR")} Ar
            </b></span>
        </div>
        </div>
        </div>

        {/* Liste + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            {/* Daily Cash */}
            <div className="mb-4">
              <DailyCash 
                selectedDate={selectedDate}
              />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
            <SalesTable
                sales={filtered}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
                page={page}
                setPage={setPage}
                pageSize={pageSize}
                totalCount={totalCount}
            />

              {filtered.length === 0 && (
                <p className="text-center text-gray-500 py-6">Aucune vente pour le moment.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingSale ? "Modifier la vente" : "Créer une vente"}
                </h2>
                {showForm && (
                  <button
                    onClick={() => { setShowForm(false); setEditingSale(null); }}
                    className="text-gray-600 hover:text-gray-800"
                    title="Fermer le formulaire"
                  >
                    <Trash2 className="w-5 h-5 rotate-45" />
                  </button>
                )}
              </div>

              {!showForm ? (
                <button
                  onClick={handleCreate}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
                >
                  + Ajouter une nouvelle vente
                </button>
              ) : (
                <SaleForm
                  key={editingSale?.id || "new"}
                  initialSale={editingSale}
                  onCancel={() => { setShowForm(false); setEditingSale(null); }}
                  onSave={handleSave}
                />
              )}
            </div>
          </div>
        </div>

        {/* Légende / aide rapide */}
        <div className="text-xs text-gray-500 mt-4">
          Les articles sont liés au catalogue de votre boutique. Les stocks et analyses avancées arrivent bientôt.
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
