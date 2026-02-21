import { useState } from "react";
import { createProduct, updateProduct } from "./productService";

export default function ProductFormModal({ product, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    price: product?.price || "",
    unit: product?.unit || ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (product) {
      await updateProduct(product.id, form);
    } else {
      await createProduct(form);
    }

    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">
          {product ? "Modifier" : "Ajouter"} produit
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Nom"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full border rounded-xl px-3 py-2"
          />

          <input
            placeholder="Prix"
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
            className="w-full border rounded-xl px-3 py-2"
          />

          <input
            placeholder="Unité (ex: film, heure)"
            value={form.unit}
            onChange={(e) =>
              setForm({ ...form, unit: e.target.value })
            }
            className="w-full border rounded-xl px-3 py-2"
          />

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-xl"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}