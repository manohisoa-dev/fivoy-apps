import { useState } from "react";
import useClients from "./useClients";
import ClientFormModal from "./ClientFormModal";
import { deleteClient } from "./clientsApi";
import { updateClient } from "./clientsApi";
import { toggleClient } from "./clientsApi";
import Swal from "sweetalert2";

export default function ClientsPage(){

  const [search,setSearch] = useState("");
  const [open,setOpen] = useState(false);
  const [editing,setEditing] = useState(null);

  const {clients,loading,reload} = useClients(search);

  const formatPhone = (phone) => {
    if (!phone) return "";

    return phone
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d{2})(\d{3})(\d{2})/, "$1 $2 $3 $4");
  };

  const handleDelete = async (client) => {

    const confirm = await Swal.fire({
      title: "Désactiver ce client ?",
      text: client.first_name,
      icon: "warning",
      showCancelButton: true
    });

    if(!confirm.isConfirmed) return;

    await deleteClient(client.id);
    reload();
  };

  const handleToggle = async (client) => {

    const action = client.is_active ? "désactiver" : "réactiver";

    const confirm = await Swal.fire({
        title: `Voulez-vous ${action} ce client ?`,
        text: `${client.first_name}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui",
        cancelButtonText: "Annuler",
        confirmButtonColor: client.is_active ? "#dc2626" : "#16a34a"
    });

    if (!confirm.isConfirmed) return;

    await toggleClient(client.id);

    Swal.fire({
        icon: "success",
        title: "Statut mis à jour",
        timer: 800,
        showConfirmButton: false
    });

    reload();
 };

  return(

    <div className="p-6">

      <div className="flex justify-between mb-4">

        <h1 className="text-2xl font-semibold">
          Clients
        </h1>

        <button
          onClick={()=>{setEditing(null);setOpen(true);}}
          className="bg-black text-white px-4 py-2 rounded-xl"
        >
          Ajouter
        </button>

      </div>

      <input
        placeholder="Rechercher client..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        className="w-full mb-4 border rounded-xl px-4 py-2"
      />

      {loading && <p>Chargement...</p>}

      <div className="grid gap-3">

        {clients.map(c => (

          <div key={c.id} className="border p-4 rounded-xl flex justify-between">

            <div>
              <p className="font-medium flex items-center gap-2">
                {c.first_name} {c.last_name}

                <span
                    className={`text-xs px-2 py-1 rounded-full ${
                    c.is_active
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                >
                    {c.is_active ? "Actif" : "Inactif"}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                {formatPhone(c.phone)}
              </p>

              <p className="text-xs text-gray-400">
                {c.email}
              </p>
            </div>

            <div className="flex gap-3">

              <button
                onClick={()=>{setEditing(c);setOpen(true);}}
                className="text-blue-600"
              >
                Modifier
              </button>

              <button
                onClick={() => handleToggle(c)}
                className={`${
                    c.is_active ? "text-red-600" : "text-green-600"
                }`}
                >
                {c.is_active ? "Désactiver" : "Réactiver"}
              </button>

            </div>

          </div>

        ))}

      </div>

      {open && (
        <ClientFormModal
          client={editing}
          onClose={()=>setOpen(false)}
          onSuccess={()=>{
            reload();
            setOpen(false);
          }}
        />
      )}

    </div>
  );
}