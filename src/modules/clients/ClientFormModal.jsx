import { useState } from "react";
import { createClient, updateClient } from "./clientsApi";
import Swal from "sweetalert2";

export default function ClientFormModal({ client, onClose, onSuccess }) {

  const [saving, setSaving] = useState(false);

  const [form,setForm] = useState({
    first_name: client?.first_name || "",
    last_name: client?.last_name || "",
    phone: client?.phone || "",
    email: client?.email || ""
  });

  const isValidPhone = (phone) => /^0\d{9}$/.test(phone);
  const isValidEmail = (email) =>
    !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {

    if (!form.first_name || !form.phone) {
        await Swal.fire({
        icon: "warning",
        title: "Champs obligatoires",
        text: "Nom et téléphone requis"
        });
        return;
    }

    if (!isValidPhone(form.phone)) {
        await Swal.fire({
        icon: "error",
        title: "Numéro invalide",
        text: "Ex: 0341234567"
        });
        return;
    }

    if (!isValidEmail(form.email)) {
        await Swal.fire({
        icon: "error",
        title: "Email invalide",
        text: "Veuillez vérifier l'adresse"
        });
        return;
    }

    try {

        setSaving(true); // ✅ START loading

        if (client) {

        await updateClient(client.id, form);

        await Swal.fire({
            icon: "success",
            title: "Client mis à jour",
            timer: 1000,
            showConfirmButton: false
        });

        } else {

        await createClient(form);

        await Swal.fire({
            icon: "success",
            title: "Client ajouté",
            timer: 1000,
            showConfirmButton: false
        });

        }

        onSuccess();

    } catch (error) {

        console.error(error);

        await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible d'enregistrer le client"
        });

    } finally {

        setSaving(false); // ✅ STOP loading (TOUJOURS exécuté)

    }
 };

  return(

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-6 rounded-xl w-full max-w-md">

        <h2 className="text-lg font-semibold mb-4">
          {client ? "Modifier" : "Ajouter"} client
        </h2>

        <div className="space-y-3">

          <input placeholder="Prénom"
            value={form.first_name}
            onChange={e=>setForm({...form,first_name:e.target.value})}
            className="w-full border px-3 py-2 rounded"
          />

          <input placeholder="Nom"
            value={form.last_name}
            onChange={e=>setForm({...form,last_name:e.target.value})}
            className="w-full border px-3 py-2 rounded"
          />

          <input placeholder="Téléphone"
            value={form.phone}
            onChange={(e)=>{
            let value = e.target.value.replace(/\D/g, "").slice(0,10);
            setForm({...form, phone:value});
            }}
            className="w-full border px-3 py-2 rounded"
          />

          <input placeholder="Email"
            value={form.email}
            onChange={e=>setForm({...form,email:e.target.value})}
            className="w-full border px-3 py-2 rounded"
          />

        </div>

        <div className="flex justify-end gap-2 mt-4">

          <button onClick={onClose}>
            Annuler
          </button>

          <button
            disabled={saving}
            onClick={handleSubmit}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>

        </div>

      </div>

    </div>
  );
}