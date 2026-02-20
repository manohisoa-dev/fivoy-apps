import React, { useState } from 'react';

async function* walkDir(dirHandle) {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') yield entry;
    if (entry.kind === 'directory') yield* walkDir(entry);
  }
}
const isVideo = (ext) => ['mp4','mkv','avi','mov','m4v','wmv'].includes(ext);
function guess(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  const m = base.match(/(.+?)[\.\s\-_\(]*((19|20)\d{2})/);
  if (m) return { name: m[1].replace(/[.\-_]/g,' ').trim(), year: parseInt(m[2],10) };
  return { name: base.replace(/[.\-_]/g,' ').trim(), year: null };
}

export default function LocalFolderScanner() {
  const [driveLabel, setDriveLabel] = useState('Seagate_8TB_01');
  const [secret, setSecret] = useState('');
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const push = (s)=>setLog(v=>[...v.slice(-200), s]);

  async function handleScan() {
    if (!secret) { alert('Entre le secret d’ingestion.'); return; }
    setBusy(true);
    try {
      const dir = await window.showDirectoryPicker();
      push(`📂 ${dir.name}`);
      const batch = [];
      let sent = 0;
      const MAX = 400;

      for await (const entry of walkDir(dir)) {
        const file = await entry.getFile();
        const ext = file.name.toLowerCase().split('.').pop();
        if (!isVideo(ext)) continue;

        const g = guess(file.name);
        batch.push({
          drive_label: driveLabel,
          absolute_path: `/${dir.name}/${entry.name}`, // chemin virtuel lisible
          size_bytes: file.size,
          ext,
          guessed_name: g.name,
          guessed_year: g.year,
          kind: 'movie'
        });

        if (batch.length >= MAX) {
          const { error } = await supabase.rpc('ingest_media_batch', { payload: batch, ingest_secret: secret });
          if (error) throw error;
          sent += batch.length; batch.length = 0;
          push(`⬆️ ${sent} éléments envoyés…`);
        }
      }
      if (batch.length) {
        const { error } = await supabase.rpc('ingest_media_batch', { payload: batch, ingest_secret: secret });
        if (error) throw error;
        sent += batch.length;
      }
      push(`✅ Terminé. Total: ${sent}`);
    } catch(e) {
      push(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      <h3 className="font-semibold">Scanner local (Chrome/Edge)</h3>
      <div className="flex flex-wrap gap-2">
        <input className="border rounded-xl px-3 py-2" placeholder="Drive label" value={driveLabel} onChange={e=>setDriveLabel(e.target.value)} />
        <input className="border rounded-xl px-3 py-2" placeholder="Secret d’ingestion" value={secret} onChange={e=>setSecret(e.target.value)} />
        <button onClick={handleScan} disabled={busy} className="px-3 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50">
          {busy ? 'Scan…' : 'Choisir un dossier & scanner'}
        </button>
      </div>
      <div className="h-40 overflow-auto text-sm bg-gray-50 rounded-xl p-2">{log.map((l,i)=><div key={i}>{l}</div>)}</div>
      <p className="text-xs text-gray-500">Les chemins stockés sont “virtuels”. Pour de vrais chemins + hash : solution CLI (Option A).</p>
    </div>
  );
}
