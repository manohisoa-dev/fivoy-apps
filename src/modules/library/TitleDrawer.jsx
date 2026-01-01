import React, { useEffect, useState } from 'react';
import { filesForTitle } from '../../api/library';

export default function TitleDrawer({ open, onClose, title }) {
  const [files, setFiles] = useState([]);
  useEffect(() => {
    if (open && title?.id) filesForTitle(title.id).then(setFiles).catch(console.error);
  }, [open, title?.id]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white p-5 overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {title.name} <span className="text-gray-500 font-normal">({title.year ?? '—'})</span>
          </h2>
          <button onClick={onClose} className="px-3 py-1 bg-gray-100 rounded-lg">Fermer</button>
        </div>
        {title.poster_url && <img src={title.poster_url} alt="" className="w-40 rounded-lg mb-4" />}
        <div className="text-sm text-gray-600 mb-4">
          Type: {title.kind} · Note TMDB: {title.vote_average ?? '—'} · Disques: {title.drive_count} · Fichiers: {title.file_count}
        </div>
        <h3 className="font-semibold mb-2">Emplacements</h3>
        <ul className="space-y-2 text-sm">
          {files.map((f, i) => (
            <li key={i} className="bg-gray-50 rounded-md p-2">
              <div className="font-medium">{f.drives?.label ?? '—'} <span className="text-gray-400">({f.ext}, {(f.size_bytes/1e9).toFixed(2)} Go)</span></div>
              <div className="text-gray-600 break-all">{f.absolute_path}</div>
            </li>
          ))}
          {!files.length && <li className="text-gray-500">Aucun fichier lié.</li>}
        </ul>
      </div>
    </div>
  );
}
