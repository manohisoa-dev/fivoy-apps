import React, { useEffect, useMemo, useState } from "react";
import { Plus, X, Calculator } from "lucide-react";
import ItemPicker from "./ItemPicker";
import { findByName } from "./pricesCatalog";

const emptyItem = { name: "", qty: 1, price: 0 };

const SaleForm = ({ initialSale, onCancel, onSave }) => {
  const [date, setDate] = useState(() => {
    if (initialSale?.date) return initialSale.date;
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [client, setClient] = useState(initialSale?.client || "");
  const [modePaiement, setModePaiement] = useState(initialSale?.modePaiement || "Espèces");
  const [notes, setNotes] = useState(initialSale?.notes || "");
  const [items, setItems] = useState(initialSale?.items?.length ? initialSale.items : []);

  const subTotal = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0),
    [items]
  );
  const total = subTotal; // TVA/remise pourront être ajoutées plus tard

    useEffect(() => {
        // Normalisation uniquement si on a déjà des lignes
        setItems((prev) =>
        prev.length ? prev.map(i => ({ ...i, qty: Number(i.qty) || 1, price: Number(i.price) || 0 })) : prev
        );
    }, []);

  const updateItem = (idx, patch) => {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

   // Quand on termine de saisir un nom, on propose le prix par défaut du catalogue
    const applyCatalogIfMatch = (idx) => {
    const it = items[idx];
    const hit = findByName(it?.name || "");
    if (hit) {
        updateItem(idx, {
        price: Number(hit.price) || 0,
        // si l'utilisateur n'a pas modifié la quantité, on peut mettre 1 par défaut
        qty: Number(it.qty) || 1,
        unit: hit.unit, // stocké pour affichage (facultatif)
        });
    }
    };


  const addItem = () => setItems(prev => [...prev, { ...emptyItem }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanItems = items
      .map(i => ({ ...i, name: i.name.trim() }))
      .filter(i => i.name && (Number(i.qty) > 0) && (Number(i.price) >= 0));

    if (cleanItems.length === 0) {
      alert("Veuillez saisir au moins un article valide (nom + quantité + prix).");
      return;
    }

    const sale = {
      id: initialSale?.id,
      date,
      client: client.trim(),
      items: cleanItems,
      total: Number(total.toFixed(2)),
      modePaiement,
      notes: notes.trim()
    };

    onSave(sale);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Infos principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Date</label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Client (optionnel)</label>
          <input
            type="text"
            placeholder="Nom du client"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Mode de paiement</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={modePaiement}
            onChange={(e) => setModePaiement(e.target.value)}
          >
            <option>Espèces</option>
            <option>Mobile Money</option>
            <option>Carte</option>
            <option>Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Notes</label>
          <input
            type="text"
            placeholder="Référence, info complémentaire…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Lignes d'articles */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-800">Articles</h3>
        </div>

        <div className="space-y-2">
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2">
              <input
                className="col-span-6 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de l'article"
                value={it.name}
                onChange={(e) => updateItem(idx, { name: e.target.value })}
                onBlur={() => applyCatalogIfMatch(idx)}
                required
              />
              <input
                type="number"
                min="1"
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Qté"
                value={it.qty}
                onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })}
                required
              />
              <input
                type="number"
                min="0"
                step="0.01"
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Prix unitaire"
                value={it.price}
                onChange={(e) => updateItem(idx, { price: Number(e.target.value) })}
                required
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="col-span-1 flex items-center justify-center text-red-600 hover:text-red-800"
                title="Supprimer"
              >
                <X className="w-5 h-5" />
              </button>
              {it.unit && (
                <div className="col-span-12 -mt-1 text-xs text-gray-500">
                  Unité suggérée : {it.unit}
                </div>
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-lg border border-dashed p-3 text-sm text-gray-600 bg-gray-50">
              Ajoute tes articles depuis le <b>Catalogue</b> ci-dessous
              (film, série, connexion, photocopie…) ou clique sur
              <em> “+ Ajouter une ligne”</em> si c’est un cas spécial.
            </div>
          )}

          <button
            type="button"
            onClick={addItem}
            className="w-full mt-1 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            + Ajouter une ligne
          </button>
        </div>

         {/* Sélecteur rapide du catalogue */}
        <div className="mt-4">
          <ItemPicker
            onPick={(cat) => {
              // Ajoute une ligne pré-remplie depuis le catalogue
              setItems(prev => [
                ...prev,
                {
                  name: cat.name,
                  qty: 1,
                  price: Number(cat.price) || 0,
                  unit: cat.unit,
                }
              ]);
            }}
          />
        </div>
      </div>

      {/* Totaux + actions */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <div className="text-gray-700">
          <div>Sous-total : <b>{subTotal.toLocaleString("fr-FR")} Ar</b></div>
          <div>Total : <b className="text-gray-900">{total.toLocaleString("fr-FR")} Ar</b></div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {initialSale ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SaleForm;
