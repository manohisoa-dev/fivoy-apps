import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Settings2, Trash2 } from "lucide-react"
import { loadCatalog, saveCatalog, suggestItems } from "./pricesCatalog";

const ItemPicker = ({ onPick }) => {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(null);

  useEffect(() => { setItems(suggestItems("")); }, []);

  useEffect(() => {
    const id = setTimeout(() => setItems(suggestItems(q)), 150);
    return () => clearTimeout(id);
  }, [q]);

  const addOrUpdate = () => {
    if (!draft?.name) return;
    const current = loadCatalog();
    const idx = current.findIndex(i => (i.id || i.name) === (draft.id || draft.name));
    const next = [...current];
    const payload = {
      id: draft.id || draft.name.toLowerCase().replace(/\s+/g, "_"),
      name: draft.name.trim(),
      unit: draft.unit || "pièce",
      price: Number(draft.price) || 0
    };
    if (idx >= 0) next[idx] = payload; else next.unshift(payload);
    saveCatalog(next);
    setItems(suggestItems(q));
    setDraft(null);
    setEditMode(false);
  };

  return (
    <div className="bg-white rounded-lg border p-3">
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Chercher dans le catalogue (film, série, connexion, photocopie...)"
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setEditMode(v => !v)}
          className="px-3 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          title="Ajouter/modifier un tarif"
        >
          <Settings2 className="w-4 h-4" /> Tarif
        </button>
      </div>

      {editMode && (
        <div className="bg-gray-50 p-3 rounded-lg mb-3">
          <div className="grid grid-cols-12 gap-2">
            <input
              className="col-span-6 px-3 py-2 border rounded-lg"
              placeholder="Nom (ex: Série (par épisode))"
              value={draft?.name || ""}
              onChange={(e) => setDraft({ ...(draft || {}), name: e.target.value })}
            />
            <input
              className="col-span-3 px-3 py-2 border rounded-lg"
              placeholder="Unité (ex: épisode)"
              value={draft?.unit || ""}
              onChange={(e) => setDraft({ ...(draft || {}), unit: e.target.value })}
            />
            <input
              type="number"
              className="col-span-3 px-3 py-2 border rounded-lg"
              placeholder="Prix"
              value={draft?.price ?? ""}
              onChange={(e) => setDraft({ ...(draft || {}), price: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => { setDraft(null); setEditMode(false); }}
              className="px-3 py-2 border rounded-lg hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={addOrUpdate}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Enregistrer le tarif
            </button>
          </div>
        </div>
      )}

      <div className="max-h-64 overflow-y-auto divide-y">
        {items.map(it => (
           <div key={it.id || it.name} className="flex items-center justify-between py-2">
            <div>
            <div className="font-medium text-gray-800">{it.name}</div>
            <div className="text-xs text-gray-500">
                {it.unit || "pièce"} • {Number(it.price).toLocaleString("fr-FR")} Ar
            </div>
            </div>
            <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => onPick(it)}
                className="px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                title="Ajouter à la vente"
            >
                <Plus className="w-4 h-4" /> Ajouter
            </button>
             <button
                type="button"
                onClick={async () => {
                const ask = async () => {
                    // Si SweetAlert existe (comme dans tes autres écrans), on l’utilise
                    if (window.Swal) {
                    const res = await window.Swal.fire({
                        title: "Supprimer ce tarif ?",
                        text: `« ${it.name} » sera retiré du catalogue.`,
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Oui, supprimer",
                        cancelButtonText: "Annuler",
                        confirmButtonColor: "#dc2626",
                    });
                    return res.isConfirmed;
                    }
                    // Sinon fallback classique
                    return window.confirm(`Supprimer le tarif « ${it.name} » ?`);
                };

                if (await ask()) {
                    const current = loadCatalog();
                    const next = current.filter(c => (c.id || c.name) !== (it.id || it.name));
                    saveCatalog(next);
                    setItems(suggestItems(q));
                    if (window.Swal) {
                    window.Swal.fire({ title: "Supprimé", icon: "success", timer: 900, showConfirmButton: false });
                    }
                }
                }}
                className="p-1 text-red-600 hover:text-red-800"
                title="Supprimer ce tarif"
            >
                <Trash2 className="w-5 h-5" />
            </button>
            </div>
        </div>
        ))}
        {items.length === 0 && (
          <div className="text-center text-gray-400 py-6">Aucun résultat</div>
        )}
      </div>
    </div>
  );
};

export default ItemPicker;
