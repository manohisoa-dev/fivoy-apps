import { useState } from "react";
import useProducts from "./useProducts";
import ProductFormModal from "./ProductFormModal";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { products, loading, reload } = useProducts(search);

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

      <input
        type="text"
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-xl px-4 py-2 mb-4"
      />

      {loading && <p>Chargement...</p>}

      <div className="grid gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-gray-500">
                {product.price} Ar {product.unit && ` / ${product.unit}`}
              </p>
            </div>

            <button
              onClick={() => {
                setEditing(product);
                setOpen(true);
              }}
              className="text-sm text-blue-600"
            >
              Modifier
            </button>
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