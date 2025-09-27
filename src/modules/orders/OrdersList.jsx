import { useMemo } from 'react';

const STATUS = ['En attente','En cours','Terminé'];

function StatusBadge({ value }) {
  const cls = value === 'Terminé'
    ? 'bg-green-100 text-green-700'
    : value === 'En cours'
    ? 'bg-purple-100 text-purple-700'
    : 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-1 rounded-xl text-xs font-medium ${cls}`}>{value}</span>;
}

export default function OrdersList({ rows, page, pageSize, total, onPage, onPageSize, onStatus, onDelete }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const colHead = 'px-3 py-2 text-left text-sm font-semibold text-gray-700';
  const colCell = 'px-3 py-2 text-sm';

  const empty = useMemo(() => !rows || rows.length === 0, [rows]);

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
                <td className={colCell}>{row.customer_name}</td>
                <td className={colCell}>
                  <div className="flex items-center gap-2">
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
    </div>
  );
}
