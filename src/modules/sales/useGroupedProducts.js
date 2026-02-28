import { useEffect, useState } from "react";
import api from "../../api/api";

const useGroupedProducts = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products/grouped");
        setCategories(res.data || []);
      } catch (err) {
        console.error("Erreur grouped products:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { categories, loading };
};

export default useGroupedProducts;