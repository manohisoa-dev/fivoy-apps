import { useState } from "react";
import useProductsAdmin from "./useProductsAdmin";
import ProductFormModal from "./ProductFormModal";
import api from "../../api/api";
import Swal from "sweetalert2";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [filter, setFilter] = useState("1"); // 1 = actifs par défaut
  const { products, loading, reload } = useProductsAdmin(search, filter);

  const handleToggle = async (product) => {
    const action = product.is_active ? "désactiver" : "réactiver";

    const confirm = await Swal.fire({
      title: `Voulez-vous ${action} ce produit ?`,
      text: product.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler",
      confirmButtonColor: product.is_active ? "#dc2626" : "#16a34a"
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.patch(`/products/${product.id}/toggle`);
      reload();

      Swal.fire({
        icon: "success",
        title: "Statut mis à jour",
        timer: 900,
        showConfirmButton: false
      });

    } catch (err) {
      console.error(err);
    }
  };
  

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Produits</h1>

        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="bg-black text-white px-4 py-2 rounded-xl"
        >
          Ajouter produit
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-xl px-4 py-2"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-xl px-4 py-2"
        >
          <option value="1">Actifs</option>
          <option value="0">Inactifs</option>
          <option value="">Tous</option>
        </select>
      </div>

      {loading && <p>Chargement...</p>}

      <div className="grid gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium flex items-center gap-2">
                {product.name}

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    product.is_active
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {product.is_active ? "Actif" : "Inactif"}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                {product.price} Ar {product.unit && ` / ${product.unit}`}
              </p>
            </div>

            <div className="flex gap-4 items-center">
              <button
                onClick={() => {
                  setEditing(product);
                  setOpen(true);
                }}
                className="text-sm text-blue-600"
              >
                Modifier
              </button>

              <button
                onClick={() => handleToggle(product)}
                className={`text-sm ${
                  product.is_active ? "text-red-600" : "text-green-600"
                }`}
              >
                {product.is_active ? "Désactiver" : "Réactiver"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <ProductFormModal
          product={editing}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            reload();
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}