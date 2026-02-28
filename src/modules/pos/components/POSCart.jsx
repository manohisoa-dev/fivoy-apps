export default function POSCart({
  items,
  total,
  updateQuantity,
  removeItem,
  handleSubmit
}) {

  return (
    <div className="w-[380px] flex flex-col h-full border-l bg-white relative">

      {/* LISTE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-40">

        {items.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            Panier vide
          </div>
        )}

        {items.map(item => (
          <div
            key={item.id}
            className="border rounded-lg px-3 py-2 flex justify-between items-center"
          >
            <div className="flex-1">
              <div className="font-medium text-sm truncate">
                {item.product_name}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded"
                >
                  -
                </button>

                <span className="w-6 text-center text-sm">
                  {item.quantity}
                </span>

                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right ml-3">
              <div className="font-semibold text-sm">
                {(item.unit_price * item.quantity).toLocaleString()} Ar
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 text-xs mt-1 hover:underline"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}

      </div>

      {/* BLOC TOTAL FIXE GLOBAL */}
      <div className="fixed bottom-6 right-6 w-[380px] bg-slate-900 text-white p-5 border-t border-green-500 shadow-2xl rounded-lg">

        <div className="text-xs uppercase tracking-wide opacity-70">
          Total
        </div>

        <div className="text-3xl font-bold mt-1">
          {total.toLocaleString()} Ar
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 transition py-3 rounded-lg font-semibold"
        >
          Valider
        </button>

      </div>

    </div>
  );
}