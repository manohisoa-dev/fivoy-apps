import React, { useState } from "react";
import useProducts from "../products/useActiveProducts";
import { Plus, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

const ItemPicker = ({ onPick }) => {
  const [search, setSearch] = useState("");
  const { products, loading } = useProducts(search);

  return (
    <div className="bg-white rounded-xl border p-4 shadow-sm">
      <input
        type="text"
        placeholder="Rechercher produit..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg mb-3"
      />

      <div className="flex items-center gap-2">
        <Link
          to="/products"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          title="Gérer le catalogue"
        >
          <Settings2 className="w-4 h-4" />
          <span className="text-sm font-medium">
            Gérer le catalogue
          </span>
        </Link>
      </div>

      {loading && <p className="text-sm text-gray-500">Chargement...</p>}

      <div className="max-h-60 overflow-y-auto space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
          >
            <div>
              <div className="font-medium text-gray-800">{p.name}</div>
              <div className="text-xs text-gray-500">
                {Number(p.price).toLocaleString("fr-FR")} Ar
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onPick({
                  product_id: p.id,
                  product_name: p.name,
                  unit_price: p.price,
                })
              }
              className="px-2 py-1 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        ))}

        {products.length === 0 && !loading && (
          <div className="text-sm text-gray-400 text-center py-4">
            Aucun produit trouvé
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemPicker;