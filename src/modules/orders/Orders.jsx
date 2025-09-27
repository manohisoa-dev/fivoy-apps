import { useOrders } from './useOrders';
import OrderForm from './OrderForm';
import OrdersList from './OrdersList';
import { useLoadingStore } from '../../store/loading';

export default function Orders() {
  const {
    rows, total, q, setQ, status, setStatus, category, setCategory,
    page, setPage, pageSize, setPageSize, addOrder, changeStatus, remove
  } = useOrders();

  const loading = useLoadingStore(s => s.count > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white p-4 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Commandes</h1>
            <p className="text-sm text-gray-500">Gestion des contenus à télécharger (films, dramas, séries, DA, Documentaire, Novelas, Autre).</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              className="w-full md:w-64 rounded-2xl border px-3 py-2"
              placeholder="Rechercher (titre, client)"
              value={q} onChange={e=>setQ(e.target.value)}
            />
            <select className="rounded-2xl border px-3 py-2" value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="">Toutes catégories</option>
              {['Film', 'Drama', 'Série', 'DA', 'Documentaire', 'Novelas', 'Autre'].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select className="rounded-2xl border px-3 py-2" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="">Tous statuts</option>
              {['En attente','En cours','Terminé'].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="rounded-2xl bg-white p-4 shadow">
        <OrderForm onCreate={addOrder}/>
      </div>

      {/* Liste */}
      <div className="rounded-2xl bg-white p-4 shadow">
        <OrdersList
          rows={rows}
          page={page}
          pageSize={pageSize}
          total={total}
          onPage={setPage}
          onPageSize={setPageSize}
          onStatus={changeStatus}
          onDelete={async (id)=>{
            const ok = window.confirm('Supprimer cette commande ?');
            if (!ok) return;
            await remove(id);
          }}
        />
        {loading && <div className="mt-2 text-sm text-gray-500">Chargement…</div>}
      </div>
    </div>
  );
}
