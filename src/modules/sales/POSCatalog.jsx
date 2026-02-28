import React, { useEffect, useState } from "react";
import useGroupedProducts from "./useGroupedProducts";

const POSCatalog = ({ onPick }) => {
  const { categories, loading } = useGroupedProducts();
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    if (categories.length && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  if (loading) return <p>Chargement...</p>;
  if (!categories.length) return <p>Aucun produit disponible.</p>;

  const currentCategory =
    categories.find(c => c.id === activeCategory);

    return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mt-6">

        {/* Catégories */}
        <div className="xl:col-span-1 bg-gray-50 rounded-xl p-3 shadow-sm">
        <h3 className="text-sm font-semibold mb-3 text-gray-600 uppercase">
            Catégories
        </h3>

        <div className="space-y-2">
            {categories.map(cat => (
            <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full px-3 py-2 rounded-lg text-left transition font-medium ${
                activeCategory === cat.id
                    ? "text-white shadow-md scale-[1.02]"
                    : "bg-white hover:bg-gray-100"
                }`}
                style={{
                backgroundColor:
                    activeCategory === cat.id ? cat.color : undefined
                }}
            >
                {cat.name}
            </button>
            ))}
        </div>
        </div>

        {/* Produits */}
        <div className="xl:col-span-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-600 uppercase">
            Produits
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {currentCategory?.products?.map(p => (
            <button
                key={p.id}
                onClick={() =>
                onPick({
                    product_id: p.id,
                    product_name: p.name,
                    unit_price: p.price
                })
                }
                className="cursor-pointer bg-white border rounded-lg p-3 hover:shadow-md hover:border-primary transition"
            >
                <div className="font-semibold text-gray-800 mb-1">
                {p.name}
                </div>
                <div className="text-sm text-gray-500">
                {Number(p.price).toLocaleString("fr-FR")} Ar
                </div>
            </button>
            ))}
        </div>
        </div>

    </div>
    );
};

export default POSCatalog;