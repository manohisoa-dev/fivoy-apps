import { useState } from 'react';
import { useRef } from "react";
import api from "../../api/api";
import { useEffect } from "react";
import ClientSearch from "../clients/ClientSearch";

const CATEGORIES = ['Film', 'Drama', 'Série', 'DA', 'Documentaire', 'Novelas', 'Autre'];

export default function OrderForm({ onCreate }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const suggestionRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    customer_name: '',
    client_id: null,
    poster_url: '',
    download_link: '',
    category: 'Film'
  });

  const canSave = form.title && form.category;

  const onChange = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    await onCreate({
      title: form.title.trim(),
      client_id: form.client_id,
      customer_name: form.customer_name || null,
      poster_url: form.poster_url || null,
      download_link: form.download_link || null,
      category: form.category
    });
    setForm({ title:'', customer_name:'', poster_url:'', download_link:'', category:'Film' });
  };

  const mapMediaTypeToCategory = (type) => {

    if (type === "movie") return "Film";

    if (type === "tv") return "Série";

    if (type === "anime") return "DA";

    if (type === "documentary") return "Documentaire";

    return "Autre";
  };

  const fetchSuggestions = async (query) => {

    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false); // 🔥 OBLIGATOIRE
      return;
    }

    try {
      const res = await api.get("/tmdb/search", {
        params: { query }
      });

      const results = res.data.results
        ?.slice(0,6)
        .map(item => ({
          title: item.title || item.name,
          media_type: item.media_type,
          poster: item.poster_path
            ? `https://image.tmdb.org/t/p/original${item.poster_path}`
            : null
        }))

      setSuggestions(results);
      setShowSuggestions(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!suggestionRef.current) return;

      if (!suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600">Titre</label>
          <div className="relative" ref={suggestionRef}>

          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.title}
            placeholder="Ex: Inception (2010)"
            onChange={(e)=>{

              const value = e.target.value;

              onChange("title", value);

              if(debounceTimer) clearTimeout(debounceTimer);

              const timer = setTimeout(()=>{
                fetchSuggestions(value);
              },400);

              setDebounceTimer(timer);

            }}
          />

          {showSuggestions && (

            <div className="absolute z-10 bg-white border rounded-lg mt-1 w-full shadow max-h-60 overflow-y-auto">

              {suggestions.length > 0 ? (

                suggestions.map((item,i)=>(

                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {

                      const category = mapMediaTypeToCategory(item.media_type);

                      setForm(s => ({
                        ...s,
                        poster_url: item.poster,
                        category
                      }));

                      setShowSuggestions(false);

                    }}
                  >

                    {item.poster && (
                      <img
                        src={item.poster}
                        className="w-8 h-12 object-cover rounded"
                      />
                    )}

                    <span className="text-sm">
                      {item.title}
                    </span>

                  </div>

                ))

              ) : (

                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  Aucun résultat trouvé
                </div>

              )}

            </div>

          )}

          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Client</label>

          <ClientSearch
            value={form.customer_name}
            onSelect={(client) => {
              setForm(s => ({
                ...s,
                client_id: client.id,
                customer_name: client.first_name
              }));
            }}
          />

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
