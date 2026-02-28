import { useState } from "react";
import QuantityModal from "./QuantityModal";

export default function ProductGrid({ category, addToCart }) {

  const [selectedProduct, setSelectedProduct] = useState(null);

  if (!category) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Sélectionne une catégorie
      </div>
    );
  }

  const handleClick = (product) => {
    if (product.requires_quantity_input) {
      setSelectedProduct(product);
    } else {
      addToCart(product, 1);
    }
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto">

      <div className="grid grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3">

        {category.products?.map(product => (
          <button
            key={product.id}
            onClick={() => handleClick(product)}
            className="bg-white border rounded-lg p-3 text-left hover:shadow-md hover:border-indigo-500 transition"
          >
            <div className="font-semibold text-sm">
              {product.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Number(product.price).toLocaleString()} Ar
            </div>
          </button>
        ))}

      </div>

      {selectedProduct && (
        <QuantityModal
          product={selectedProduct}
          onConfirm={(qty) => {
            addToCart(selectedProduct, qty);
            setSelectedProduct(null);
          }}
          onClose={() => setSelectedProduct(null)}
        />
      )}

    </div>
  );
}