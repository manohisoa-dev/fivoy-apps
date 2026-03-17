import { useEffect, useState } from "react";
import { fetchClients } from "./clientsApi";

export default function useClients(search) {

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const data = await fetchClients(search);
      setClients(data || []);
    } catch (error) {
      console.error("Erreur chargement clients:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [search]);

  return {
    clients,
    loading,
    reload: load
  };
}