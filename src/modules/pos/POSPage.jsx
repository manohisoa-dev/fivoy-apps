import { useEffect, useState } from "react";
import api from "../../api/api";
import useGroupedProducts from "../sales/useGroupedProducts";
import { toast } from "react-hot-toast";

import POSCatalog from "./components/POSCatalog";
import POSCart from "./components/POSCart";

import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function POSPage() {

    const { categories, loading } = useGroupedProducts();

    const [items, setItems] = useState([]);
    const [stats, setStats] = useState(null);

    const navigate = useNavigate();

    const loadStats = async () => {
        try {
            const res = await api.get("/pos/stats/today");
            setStats(res.data);
        } catch (err) {
            console.error("Erreur stats POS:", err);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const addToCart = (product, quantity) => {

    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);

      if (existing) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          product_id: product.id,
          product_name: product.name,
          unit_price: product.price,
          quantity
        }
      ];
    });
  };

  const updateQuantity = (id, qty) => {
    setItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, quantity: Math.max(1, qty) } : i
      )
    );
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, i) => sum + i.unit_price * i.quantity,
    0
  );

  const handleSubmit = async () => {

    if (!items.length) return;

    try {
      await api.post("/sales", {
        date: new Date().toISOString().split("T")[0],
        payment_method: "Espèces",
        items: items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity
        }))
      });

      clearCart();
      toast.success(`Vente enregistrée — ${total.toLocaleString()} Ar`);

      await loadStats();

    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex flex-col min-h-screen lg:h-[calc(100vh-64px)]">

        {/* Bandeau Stats */}
        {stats && (
        <div className="bg-gray-50 border-b px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs gap-3 text-xs">
            <button
              onClick={() => navigate("/products")}
              className="flex items-center min-w-[70px] gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <Settings className="w-4 h-4" />
              Gérer produits
            </button>

            <div className="min-w-[70px] text-right">
                <div className="text-gray-400 uppercase tracking-wide">Ventes</div>
                <div className="font-semibold text-green-600">
                {Number(stats.sales_total).toLocaleString()} Ar
                </div>
            </div>

            <div className="min-w-[70px] text-right">
                <div className="text-gray-400 uppercase tracking-wide">Dépenses</div>
                <div className="font-semibold text-red-500">
                {Number(stats.expenses_total).toLocaleString()} Ar
                </div>
            </div>

            <div className="min-w-[70px] text-right">
                <div className="text-gray-400 uppercase tracking-wide">Solde</div>
                <div className="font-semibold text-blue-600">
                {Number(stats.theoretical_balance).toLocaleString()} Ar
                </div>
            </div>

            <div className="min-w-[70px] text-right">
                <div className="text-gray-400 uppercase tracking-wide">Tickets</div>
                <div className="font-semibold">
                {stats.tickets_count}
                </div>
            </div>

        </div>
        )}

        {/* Zone POS */}
        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">

            <POSCatalog
                categories={categories}
                addToCart={addToCart}
            />

            <POSCart
                items={items}
                total={total}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
                handleSubmit={handleSubmit}
            />

        </div>

    </div>
    );
}