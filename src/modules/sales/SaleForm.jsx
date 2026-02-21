import React, { useEffect, useMemo, useState } from "react";
import { Plus, X, Calculator } from "lucide-react";
import ItemPicker from "./ItemPicker";

const emptyProductItem = {
  type: "catalog",
  product_id: "",
  product_name: "",
  quantity: 1,
  unit_price: 0,
};

const emptyCustomItem = {
  type: "custom",
  custom_name: "",
  custom_price: 0,
  quantity: 1,
};

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

  const subTotal = useMemo(() => {
    return items.reduce((sum, it) => {
      if (it.type === "catalog") {
        return sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0);
      }

      return sum + (Number(it.quantity) || 0) * (Number(it.custom_price) || 0);
    }, 0);
  }, [items]);
  const total = subTotal; // TVA/remise pourront être ajoutées plus tard

  const updateItem = (idx, patch) => {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };


  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanItems = items.map(i => {
      if (i.type === "catalog") {
        return {
          product_id: i.product_id,
          quantity: i.quantity
        };
      }

      return {
        product_id: null,
        custom_name: i.custom_name,
        custom_price: i.custom_price,
        quantity: i.quantity
      };
    });

    if (cleanItems.length === 0) {
      alert("Veuillez saisir au moins un article valide (nom + quantité + prix).");
      return;
    }

    const sale = {
      id: initialSale?.id,
      date,
      client: client.trim(),
      items: cleanItems,
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
            <div key={idx} className="grid grid-cols-12 gap-2 bg-gray-50 p-3 rounded-lg">

              {it.type === "catalog" ? (
                <>
                  <div className="col-span-6">
                    <div className="text-sm font-medium text-gray-800">
                      {it.product_name || "Choisir via catalogue"}
                    </div>
                  </div>

                  <input
                    type="number"
                    min="1"
                    className="col-span-2 px-2 py-2 border rounded-lg"
                    value={it.quantity}
                    onChange={(e) =>
                      updateItem(idx, { quantity: Number(e.target.value) })
                    }
                  />

                  <input
                    type="number"
                    className="col-span-3 px-2 py-2 border rounded-lg bg-gray-100"
                    value={it.unit_price}
                    readOnly
                  />
                </>
              ) : (
                <>
                  <input
                    className="col-span-6 px-2 py-2 border rounded-lg"
                    placeholder="Nom article"
                    value={it.custom_name}
                    onChange={(e) =>
                      updateItem(idx, { custom_name: e.target.value })
                    }
                  />

                  <input
                    type="number"
                    min="1"
                    className="col-span-2 px-2 py-2 border rounded-lg"
                    value={it.quantity}
                    onChange={(e) =>
                      updateItem(idx, { quantity: Number(e.target.value) })
                    }
                  />

                  <input
                    type="number"
                    min="0"
                    className="col-span-3 px-2 py-2 border rounded-lg"
                    value={it.custom_price}
                    onChange={(e) =>
                      updateItem(idx, { custom_price: Number(e.target.value) })
                    }
                  />
                </>
              )}

              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="col-span-1 text-red-600"
              >
                ✕
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-lg border border-dashed p-3 text-sm text-gray-600 bg-gray-50">
              Ajoute tes articles depuis le <b>catalogue</b> de ta boutique.
              Ou clique sur
              <em> “+ Article libre”</em> si c’est un cas spécial.
            </div>
          )}

          <div className="flex gap-2 mt-2">

            <button
              type="button"
              onClick={() =>
                setItems(prev => [...prev, { ...emptyCustomItem }])
              }
              className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition"
            >
              + Article libre
            </button>
          </div>

        </div>

         {/* Sélecteur rapide du catalogue */}
        <div className="mt-4">
          <ItemPicker
            onPick={(p) => {
              setItems(prev => [
                ...prev,
                {
                  type: "catalog",
                  product_id: p.product_id,
                  product_name: p.product_name,
                  quantity: 1,
                  unit_price: p.unit_price,
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
