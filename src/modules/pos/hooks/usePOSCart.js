import { useMemo, useState } from "react";

export default function usePOSCart() {
  const [items, setItems] = useState([]);

  const addProduct = (product, quantity = 1) => {
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
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity
        }
      ];
    });
  };

  const increment = (id) => {
    setItems(prev =>
      prev.map(i =>
        i.product_id === id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  };

  const decrement = (id) => {
    setItems(prev =>
      prev
        .map(i =>
          i.product_id === id
            ? { ...i, quantity: Math.max(1, i.quantity - 1) }
            : i
        )
    );
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.product_id !== id));
  };

  const clearCart = () => setItems([]);

  const total = useMemo(() => {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [items]);

  return { items, addProduct, increment, decrement, removeItem, total };
}