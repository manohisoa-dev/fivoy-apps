import { useState, useEffect } from "react";
import { fetchProducts } from "./productService";

export default function useProducts(search, filter) {
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

      const res = await fetchProducts({
        search,
        active: filter
      });;

      setProducts(res.data.data);
      setMeta(res.data.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, filter]);

  return {
    products,
    meta,
    loading,
    reload: loadProducts
  };
}