import { useEffect, useState } from "react";
import { fetchProducts } from "./productService";

export default function useProductsAdmin(search, filter) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchProducts({
        search,
        active: filter
      });
      setProducts(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, filter]);

  return { products, loading, reload: load };
}