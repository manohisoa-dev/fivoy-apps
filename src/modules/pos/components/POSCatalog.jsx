import { useState } from "react";
import QuantityModal from "./QuantityModal";

export default function POSCatalog({ categories, addToCart }) {

  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.id
  );

  const [selectedProduct, setSelectedProduct] = useState(null);

  const currentCategory = categories.find(
    c => c.id === activeCategory
  );

  const handleClick = (product) => {

    if (product.requires_quantity_input) {
      setSelectedProduct(product);
    } else {
      addToCart(product, 1);
    }
  };

  return (
    <div className="flex flex-1">

      {/* CATEGORIES */}
      <div className="w-52 border-r bg-gray-50 p-2 space-y-2">
        {categories.map(cat => (
          <div
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`p-2 rounded cursor-pointer ${
              activeCategory === cat.id
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </div>
        ))}
      </div>

      {/* PRODUCTS */}
      <div className="flex-1 p-4 grid grid-cols-4 gap-3">

        {currentCategory?.products?.map(product => (
          <div
            key={product.id}
            onClick={() => handleClick(product)}
            className="border rounded-lg p-3 cursor-pointer hover:bg-gray-100"
          >
            <div className="font-medium">{product.name}</div>
            <div className="text-sm opacity-70">
              {product.price} Ar
            </div>
          </div>
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