

export async function searchTitles({ q='', kinds=null, yearFrom=null, yearTo=null, genreIds=null, driveIds=null, page=1, pageSize=50 }) {
  const { data, error } = await supabase.rpc('search_titles', {
    q: q || null,
    kinds,
    year_from: yearFrom,
    year_to: yearTo,
    genre_ids: genreIds,
    drive_ids: driveIds,
    page,
    page_size: pageSize
  });
  if (error) throw error;
  return data || [];
}

export async function listGenres() {
  const { data, error } = await supabase.from('genres').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function listDrives() {
  const { data, error } = await supabase.from('drives').select('id,label').order('label');
  if (error) throw error;
  return data || [];
}

export async function filesForTitle(titleId) {
  const { data, error } = await supabase
    .from('media_files')
    .select('absolute_path, size_bytes, ext, drives:drives(label)')
    .eq('title_id', titleId)
    .order('absolute_path');
  if (error) throw error;
  return data || [];
}

export async function runEnrich(batch = 100) {
  const base = process.env.REACT_APP_SUPABASE_URL;              // ex: https://xxxx.supabase.co
  const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;         // ta anon key
  const adminSecret = process.env.REACT_APP_EDGE_ADMIN_SECRET;  // ton secret admin (front)

  const url = `${base}/functions/v1/tmdb_enrich`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // >>> Ces deux headers sont OBLIGATOIRES pour appeler une Edge Function côté client
      'apikey': anon,
      'Authorization': `Bearer ${anon}`,
      // >>> Et notre header de protection côté fonction :
      'x-admin-secret': adminSecret,
    },
    body: JSON.stringify({ batch }),
  });

  if (!res.ok) {
    const t = await res.text().catch(()=>'');
    throw new Error(`Edge failed ${res.status}: ${t}`);
  }
  return res.json();
}

