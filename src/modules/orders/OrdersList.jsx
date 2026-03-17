import { useMemo } from 'react';
import { updateClientPhone } from "../clients/clientsApi";
import { useState } from 'react';
import Swal from "sweetalert2";

const STATUS = ['En attente','En cours','Terminé'];

function StatusBadge({ value }) {
  const cls = value === 'Terminé'
    ? 'bg-green-100 text-green-700'
    : value === 'En cours'
    ? 'bg-purple-100 text-purple-700'
    : 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-1 rounded-xl text-xs font-medium ${cls}`}>{value}</span>;
}

export default function OrdersList({ rows, page, pageSize, total, onPage, onPageSize, onStatus, onDelete, onUpdateClientPhone }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const colHead = 'px-3 py-2 text-left text-sm font-semibold text-gray-700';
  const colCell = 'px-3 py-2 text-sm';

  const empty = useMemo(() => !rows || rows.length === 0, [rows]);

  const isValidPhone = (phone) => /^0\d{9}$/.test(phone);

  const formatPhone = (phone) => {
    if (!phone) return "";

    return phone
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d{2})(\d{3})(\d{2})/, "$1 $2 $3 $4");
  };

  const [selectedClient, setSelectedClient] = useState(null);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phone, setPhone] = useState("");

  const openPhoneModal = (client) => {
    setSelectedClient(client);
    setPhone(client.phone || "");
    setPhoneModalOpen(true);
  };

 const handleSavePhone = async () => {

    if (!phone) {
      await Swal.fire({
        icon: "warning",
        title: "Numéro requis",
        text: "Veuillez saisir un numéro"
      });
      return;
    }

    if (!isValidPhone(phone)) {
      await Swal.fire({
        icon: "error",
        title: "Numéro invalide",
        text: "Format attendu : 0341234567"
      });
      return;
    }

    try {

      await updateClientPhone(selectedClient.id, phone);

      // 🔥 update UI local
      setSelectedClient(prev => ({
        ...prev,
        phone
      }));

      setPhoneModalOpen(false);

      // ✅ TOAST SUCCESS
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Numéro ajouté",
        showConfirmButton: false,
        timer: 1200
      });

      onUpdateClientPhone(selectedClient.id, phone);

    } catch (e) {

      console.error(e);

      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de mettre à jour"
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className={colHead}>Titre</th>
              <th className={colHead}>Catégorie</th>
              <th className={colHead}>Client</th>
              <th className={colHead}>Statut</th>
              <th className={colHead}>Créée le</th>
              <th className={colHead}></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {empty ? (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">Aucune commande.</td></tr>
            ) : rows.map(row => (
              <tr key={row.id}>
                <td className={colCell}>
                  <div className="flex items-center gap-3">
                    {row.poster_url && (
                      <img src={row.poster_url} alt="" className="h-10 w-7 rounded object-cover border" />
                    )}
                    <div className="font-medium text-gray-900">{row.title}</div>
                  </div>
                </td>
                <td className={colCell}>{row.category}</td>
                <td className="text-sm">

                  {row.client ? (
                    <div>
                      <div className="font-medium">
                        {row.client.first_name}
                      </div>

                      {/* Téléphone OU badge */}
                      {row.client.phone ? (
                        <div className="text-xs text-gray-500">
                          {formatPhone(row.client.phone)}
                        </div>
                      ) : (
                        <button
                          onClick={() => openPhoneModal(row.client)}
                          className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded w-fit hover:bg-yellow-200"
                        >
                          ⚠️ numéro manquant
                        </button>
                      )}
                      <span className="text-green-600 text-xs">Client enregistré</span>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-gray-900">
                        {row.customer_name || "—"}
                      </div>

                      <span className="text-gray-400 text-xs">Client libre</span>
                    </div>
                  )}

                </td>
                <td className={colCell}>
                  <div className="flex i  tems-center gap-2">
                    <StatusBadge value={row.status}/>
                    <select
                      className="rounded-xl border px-2 py-1 text-sm"
                      value={row.status}
                      onChange={e=>onStatus(row.id, e.target.value)}
                    >
                      {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </td>
                <td className={colCell}>{new Date(row.created_at).toLocaleString()}</td>
                <td className={`${colCell} text-right`}>
                  <div className="flex justify-end gap-2">
                    {row.download_link && (
                      <a href={row.download_link} target="_blank" rel="noreferrer"
                         className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50">Lien</a>
                    )}
                    <button onClick={()=>onDelete(row.id)}
                            className="rounded-xl border px-3 py-1 text-sm text-red-600 hover:bg-red-50">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm text-gray-500">
          Page {page} / {totalPages} — {total} éléments
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-xl border px-2 py-1" value={pageSize}
                  onChange={e=>onPageSize(Number(e.target.value))}>
            {[5,10,20,50].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
          <button className="rounded-xl px-3 py-1 hover:bg-gray-100" onClick={()=>onPage(Math.max(1, page-1))}>
            Précédent
          </button>
          <button className="rounded-xl px-3 py-1 hover:bg-gray-100" onClick={()=>onPage(Math.min(totalPages, page+1))}>
            Suivant
          </button>
        </div>
      </div>

      {phoneModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-5 w-80 space-y-3">

            <h2 className="text-lg font-semibold">
              Ajouter numéro
            </h2>

            <input
              value={phone}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "").slice(0,10);
                setPhone(value);
              }}
              placeholder="Ex: 0341234567"
              className="w-full border px-3 py-2 rounded"
            />

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setPhoneModalOpen(false)}
                className="px-3 py-1 text-gray-600"
              >
                Annuler
              </button>

              <button
                onClick={handleSavePhone}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Enregistrer
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
