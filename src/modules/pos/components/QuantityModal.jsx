import { useState } from "react";

export default function QuantityModal({ product, onConfirm, onClose }) {
  const [qty, setQty] = useState("");

  const handleConfirm = () => {
    const value = parseInt(qty);
    if (!value || value <= 0) return;
    onConfirm(value);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-80 shadow-xl">

        <h2 className="text-lg font-semibold mb-4">
          {product.name}
        </h2>

        <input
          type="number"
          autoFocus
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-full border rounded p-3 text-xl text-center"
          placeholder="Quantité"
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 border rounded py-2"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 text-white rounded py-2"
          >
            Ajouter
          </button>
        </div>

      </div>
    </div>
  );
}