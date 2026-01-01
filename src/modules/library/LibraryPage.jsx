import React, { useEffect, useState } from 'react';
import { listGenres, listDrives, searchTitles } from '../../api/library';
import TitleCard from './TitleCard';
import TitleDrawer from './TitleDrawer';
import LocalFolderScanner from './LocalFolderScanner';
import { runEnrich } from '../../api/library';

export default function LibraryPage() {
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';
  const [busyEnrich, setBusyEnrich] = useState(false);
  async function onEnrich(){ try{ setBusyEnrich(true); await runEnrich(150); alert('Enrich lancé'); } catch(e){ alert(e.message); } finally{ setBusyEnrich(false); } }

  const [q, setQ] = useState('');
  const [genres, setGenres] = useState([]);
  const [drives, setDrives] = useState([]);
  const [selGenre, setSelGenre] = useState(null);
  const [selDrive, setSelDrive] = useState(null);
  const [kinds, setKinds] = useState([]);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [drawer, setDrawer] = useState({ open:false, item:null });

  useEffect(()=>{ listGenres().then(setGenres).catch(console.error); listDrives().then(setDrives).catch(console.error); },[]);
  useEffect(()=>{
    const h=setTimeout(()=>{
      searchTitles({
        q, kinds: kinds.length?kinds:null,
        yearFrom: yearFrom||null, yearTo: yearTo||null,
        genreIds: selGenre?[selGenre]:null, driveIds: selDrive?[selDrive]:null,
        page, pageSize: 50
      }).then(setItems).catch(console.error);
    },300);
    return ()=>clearTimeout(h);
  },[q,kinds,yearFrom,yearTo,selGenre,selDrive,page]);

  const toggleKind=(k)=>{ setPage(1); setKinds(v=>v.includes(k)?v.filter(x=>x!==k):[...v,k]); };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-4">Bibliothèque</h1>
      {isAdmin && (
        <div className="mb-4">
          <button onClick={onEnrich} disabled={busyEnrich} className="px-3 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50">
            {busyEnrich ? 'Enrich…' : 'Lancer enrichissement TMDB (150)'}
          </button>
        </div>
      )}

      {isAdmin && <div className="mb-6"><LocalFolderScanner /></div>}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 grid gap-3 md:grid-cols-5">
        <input
          placeholder="Rechercher un titre… (ex: John Wick 4)"
          className="md:col-span-2 rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring"
          value={q}
          onChange={(e)=>{ setQ(e.target.value); setPage(1); }}
        />
        <div className="flex flex-wrap gap-2">
          {['movie','series','anime','cartoon','other'].map(k => (
            <button key={k}
              onClick={()=>toggleKind(k)}
              className={`px-3 py-1 rounded-full border text-sm ${kinds.includes(k)?'bg-indigo-600 text-white border-indigo-600':'border-gray-300'}`}>
              {k}
            </button>
          ))}
        </div>
        <select className="rounded-xl border border-gray-200 px-3 py-2"
          value={selGenre ?? ''} onChange={e=>{ setSelGenre(e.target.value || null); setPage(1); }}>
          <option value="">Genre (tous)</option>
          {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select className="rounded-xl border border-gray-200 px-3 py-2"
          value={selDrive ?? ''} onChange={e=>{ setSelDrive(e.target.value || null); setPage(1); }}>
          <option value="">Disque (tous)</option>
          {drives.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
        <div className="flex gap-2">
          <input className="rounded-xl border border-gray-200 px-3 py-2 w-full" placeholder="Année min" value={yearFrom} onChange={e=>{ setYearFrom(e.target.value); setPage(1); }}/>
          <input className="rounded-xl border border-gray-200 px-3 py-2 w-full" placeholder="Année max" value={yearTo} onChange={e=>{ setYearTo(e.target.value); setPage(1); }}/>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map(item => (
          <TitleCard key={item.id} item={item} onClick={()=>setDrawer({ open:true, item })}/>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-6">
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded-lg bg-gray-100">Précédent</button>
        <div>Page {page}</div>
        <button onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded-lg bg-gray-100">Suivant</button>
      </div>

      <TitleDrawer open={drawer.open} title={drawer.item} onClose={()=>setDrawer({ open:false, item:null })}/>
    </div>
  );
}
