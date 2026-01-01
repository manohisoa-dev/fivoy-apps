// Deno / Supabase Edge Function
import { serve } from "https://deno.land/std/http/server.ts";

const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_SECRET  = Deno.env.get("ADMIN_SECRET")!;

serve(async (req) => {
  try {
    if (req.headers.get("x-admin-secret") !== ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }
    const { batch = 100 } = await req.json().catch(() => ({ batch: 100 }));

    // 1) prendre quelques titres sans tmdb_id
    const listRes = await fetch(`${SUPABASE_URL}/rest/v1/titles?tmdb_id=is.null&select=id,name,year&limit=${batch}`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
    });
    const titles = await listRes.json() as {id:string;name:string;year:number|null}[];

    let updated = 0;
    for (const t of titles) {
      // 2) recherche TMDB
      const s = new URL("https://api.themoviedb.org/3/search/movie");
      s.searchParams.set("api_key", TMDB_API_KEY);
      s.searchParams.set("query", t.name);
      if (t.year) s.searchParams.set("year", String(t.year));
      const sRes = await fetch(s);
      const sJson = await sRes.json();
      const hit = sJson?.results?.[0];
      if (!hit) continue;

      // 3) détails TMDB (optionnel, on peut se contenter du hit)
      const d = new URL(`https://api.themoviedb.org/3/movie/${hit.id}`);
      d.searchParams.set("api_key", TMDB_API_KEY);
      const dRes = await fetch(d);
      const det = await dRes.json();

      const poster_url   = det.poster_path   ? `https://image.tmdb.org/t/p/w500${det.poster_path}`   : null;
      const backdrop_url = det.backdrop_path ? `https://image.tmdb.org/t/p/w780${det.backdrop_path}` : null;

      // 4) update du titre
      await fetch(`${SUPABASE_URL}/rest/v1/titles?id=eq.${t.id}`, {
        method: "PATCH",
        headers: {
          apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json", Prefer: "return=representation"
        },
        body: JSON.stringify({
          tmdb_id: det.id, tmdb_kind: "movie",
          poster_url, backdrop_url,
          overview: det.overview, original_title: det.original_title,
          popularity: det.popularity, vote_average: det.vote_average,
          updated_at: new Date().toISOString()
        })
      });

      // 5) genres (facultatif)
      if (Array.isArray(det.genres) && det.genres.length) {
        await fetch(`${SUPABASE_URL}/rest/v1/genres`, {
          method: "UPSERT",
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
          body: JSON.stringify(det.genres.map((g:any)=>({ id:g.id, name:g.name })))
        });
        await fetch(`${SUPABASE_URL}/rest/v1/title_genres`, {
          method: "UPSERT",
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
          body: JSON.stringify(det.genres.map((g:any)=>({ title_id: t.id, genre_id: g.id })))
        });
      }
      updated++;
      // rate-limit soft
      await new Promise(r=>setTimeout(r, 120)); // ~8 req/s
    }

    return new Response(JSON.stringify({ scanned: titles.length, updated }), { headers: { "Content-Type": "application/json" }});
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
