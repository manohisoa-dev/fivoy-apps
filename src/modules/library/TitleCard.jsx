import React from 'react';

export default function TitleCard({ item, onClick }) {
  return (
    <button onClick={onClick} className="text-left bg-white rounded-2xl shadow-sm hover:shadow-md transition p-3">
      <div className="aspect-[2/3] w-full bg-gray-100 rounded-xl overflow-hidden mb-3">
        {item.poster_url ? (
          <img src={item.poster_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Poster</div>
        )}
      </div>
      <div className="font-medium leading-tight line-clamp-2">{item.name}</div>
      <div className="text-sm text-gray-500">{item.year ?? '—'} · {item.kind}</div>
      <div className="mt-1 text-xs text-gray-500">{item.drive_count} disque(s) · {item.file_count} fichier(s)</div>
    </button>
  );
}
