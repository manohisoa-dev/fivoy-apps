import { useState, useEffect } from "react";
import { fetchProducts } from "./productService";

export default function useProducts(search = "") {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);

  const loadProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };

      if (search && search.trim() !== "") {
        params.search = search;
      }

      const res = await fetchProducts(params);

      setProducts(res.data.data);
      setMeta(res.data.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  return {
    products,
    meta,
    loading,
    reload: loadProducts
  };
}