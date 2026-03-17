import { useState, useEffect } from "react";
import { searchClients, createClient } from "./clientsApi";
import Swal from "sweetalert2";

export default function ClientSearch({ onSelect, value }) {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {

    const load = async () => {
      const data = await searchClients(query);
      setResults(data.slice(0,5));
    };

    if(query) load();
    else setResults([]);

  }, [query]);

  useEffect(() => {
    if (value) setQuery(value);
  }, [value]);

  const handleCreateQuick = async () => {

    const isPhone = /^0\d{9}$/.test(query);

    try {

        if (isPhone) {
        const existing = results.find(c => c.phone === query);
        if (existing) {
            onSelect(existing);
            setShow(false);
            return;
        }
        }

        const res = await createClient({
        first_name: isPhone ? "Client" : query,
        phone: isPhone ? query : null
        });

        const newClient = res.data || res;

        onSelect(newClient);
        setQuery(newClient.first_name);
        setShow(false);

        await Swal.fire({
        icon: "success",
        title: "Client créé",
        timer: 800,
        showConfirmButton: false
        });

    } catch (error) {

        console.error(error);

        await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de créer le client"
        });

    }
    };

  return (

    <div className="relative">

      <input
        placeholder="Rechercher client (téléphone)"
        value={query}
        onChange={(e)=>{
            setQuery(e.target.value);
            setShow(true);
        }}
        className="w-full border px-3 py-2 rounded"
      />

      {show && (

        <div className="absolute bg-white border rounded w-full mt-1 shadow z-50">

          {results.length === 0 ? (

            <div className="p-3 text-sm text-gray-500">
              Aucun client
            </div>

          ) : (

            results.map(c => (

                <div
                    key={c.id}
                    onClick={()=>{
                    onSelect(c);
                    setQuery(c.first_name);
                    setShow(false);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                    {c.first_name} - {c.phone}
                </div>

            ))

          )}

          <div
            onClick={handleCreateQuick}
            className="p-2 text-blue-600 cursor-pointer border-t"
          >
            + Créer client ({query})
          </div>

        </div>

      )}

    </div>
  );
}