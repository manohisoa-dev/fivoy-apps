import { useState } from 'react';

const CATEGORIES = ['Film', 'Drama', 'Série', 'DA', 'Documentaire', 'Novelas', 'Autre'];

export default function OrderForm({ onCreate }) {
  const [form, setForm] = useState({
    title: '', customer_name: '', poster_url: '', download_link: '', category: 'Film'
  });

  const canSave = form.title && form.category;

  const onChange = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    await onCreate({
      title: form.title.trim(),
      customer_name: form.customer_name.trim(),
      poster_url: form.poster_url.trim() || null,
      download_link: form.download_link.trim() || null,
      category: form.category,
      // status auto: "En attente"
    });
    setForm({ title:'', customer_name:'', poster_url:'', download_link:'', category:'Film' });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600">Titre</label>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.title}
                 onChange={e=>onChange('title', e.target.value)} placeholder="Ex: Inception (2010)"/>
        </div>
        <div>
          <label className="text-sm text-gray-600">Client</label>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.customer_name}
                 onChange={e=>onChange('customer_name', e.target.value)} placeholder="Nom du client"/>
        </div>
        <div>
          <label className="text-sm text-gray-600">Poster URL</label>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.poster_url}
                 onChange={e=>onChange('poster_url', e.target.value)} placeholder="https://..."/>
        </div>
        <div>
          <label className="text-sm text-gray-600">Lien de téléchargement</label>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.download_link}
                 onChange={e=>onChange('download_link', e.target.value)} placeholder="magnet/http/..."/>
        </div>
        <div>
          <label className="text-sm text-gray-600">Catégorie</label>
          <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.category}
                  onChange={e=>onChange('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={!canSave}
          className="rounded-2xl bg-[#2563EB] px-4 py-2 text-white hover:opacity-90 disabled:opacity-50">
          Ajouter la commande
        </button>
      </div>
    </form>
  );
}
