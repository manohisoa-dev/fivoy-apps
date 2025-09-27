import { supabase, isSupabaseReady } from "../../lib/supabaseClient";

// Normalise une vente “front” vers le schéma SQL
export const mapSaleToDb = (sale) => ({
  date: sale.date, // "YYYY-MM-DD"
  client_nom: sale.client || null,
  mode_paiement: sale.modePaiement || "Espèces",
  notes: sale.notes || null,
  total: Number(sale.total || 0),
});

export const mapDbToSale = (row, items = []) => ({
  id: row.id,
  date: row.date,
  created_at: row.created_at, 
  client: row.client_nom || "",
  modePaiement: row.mode_paiement || "Espèces",
  notes: row.notes || "",
  total: Number(row.total || 0),
  items: items.map(it => ({
    name: it.article_nom,
    qty: Number(it.quantite),
    price: Number(it.prix_unitaire),
  })),
});

// CRUD minimal

export const fetchSales = async () => {
  if (!isSupabaseReady()) throw new Error("Supabase non configuré");
  const { data, error } = await supabase
    .from("ventes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  // charger items pour chaque vente
  const ids = data.map(r => r.id);
  if (ids.length === 0) return [];
  const { data: items, error: err2 } = await supabase
    .from("vente_items")
    .select("*")
    .in("vente_id", ids);
  if (err2) throw err2;
  const groups = items.reduce((acc, it) => {
    (acc[it.vente_id] ||= []).push(it);
    return acc;
  }, {});
  return data.map(row => mapDbToSale(row, groups[row.id] || []));
};

// Charger les ventes d'un jour, paginées, avec items
export const fetchSalesByDatePaged = async ({ date, page = 1, pageSize = 10, q = "" }) => {
  if (!isSupabaseReady()) throw new Error("Supabase non configuré");
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Filtre simple côté DB : client_nom et mode_paiement
  let query = supabase
    .from("ventes")
    .select("*", { count: "exact" })
    .eq("date", date)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q && q.trim()) {
    const like = `%${q.trim()}%`;
    query = query.or(`client_nom.ilike.${like},mode_paiement.ilike.${like}`);
  }

  const { data: ventesRows, error, count } = await query;
  if (error) throw error;

  // Charger les items pour les ventes de la page
  const ids = ventesRows.map(v => v.id);
  let items = [];
  if (ids.length > 0) {
    const { data: itemsRows, error: err2 } = await supabase
      .from("vente_items")
      .select("*")
      .in("vente_id", ids);
    if (err2) throw err2;
    items = itemsRows;
  }
  const grouped = items.reduce((acc, it) => {
    (acc[it.vente_id] ||= []).push(it);
    return acc;
  }, {});

  // Total du jour (on fait une requête dédiée)
  let totalJour = 0;
  {
    let tq = supabase.from("ventes").select("total").eq("date", date);
    if (q && q.trim()) {
      const like = `%${q.trim()}%`;
      tq = tq.or(`client_nom.ilike.${like},mode_paiement.ilike.${like}`);
    }
    const { data: totalsRows, error: errT } = await tq;
    if (errT) throw errT;
    totalJour = (totalsRows || []).reduce((sum, r) => sum + Number(r.total || 0), 0);
  }

  // Mapper vers le front
  const sales = ventesRows.map(row =>
    mapDbToSale(row, grouped[row.id] || [])
  );

  return {
    sales,
    totalCount: count || 0,
    totalJour, // somme de toutes les ventes du jour (après filtre q)
  };
};


export const createSale = async (sale) => {
  if (!isSupabaseReady()) throw new Error("Supabase non configuré");
  // 1) insérer la vente
  const payload = mapSaleToDb(sale);
  const { data: rows, error } = await supabase
    .from("ventes")
    .insert([payload])
    .select()
    .limit(1);
  if (error) throw error;
  const inserted = rows[0];

  // 2) insérer les lignes
  const itemsPayload = (sale.items || []).map(it => ({
    vente_id: inserted.id,
    article_nom: it.name,
    quantite: Number(it.qty),
    prix_unitaire: Number(it.price),
  }));
  if (itemsPayload.length > 0) {
    const { error: err2 } = await supabase.from("vente_items").insert(itemsPayload);
    if (err2) throw err2;
  }
  return inserted;
};

export const updateSale = async (sale) => {
  if (!isSupabaseReady()) throw new Error("Supabase non configuré");
  if (!sale.id) throw new Error("id manquant pour update");
  // 1) update vente
  const payload = mapSaleToDb(sale);
  const { error } = await supabase
    .from("ventes")
    .update(payload)
    .eq("id", sale.id);
  if (error) throw error;

  // 2) remplacer les lignes (simple et propre)
  const { error: errDel } = await supabase
    .from("vente_items")
    .delete()
    .eq("vente_id", sale.id);
  if (errDel) throw errDel;

  const itemsPayload = (sale.items || []).map(it => ({
    vente_id: sale.id,
    article_nom: it.name,
    quantite: Number(it.qty),
    prix_unitaire: Number(it.price),
  }));
  if (itemsPayload.length > 0) {
    const { error: errIns } = await supabase.from("vente_items").insert(itemsPayload);
    if (errIns) throw errIns;
  }
};

export const deleteSale = async (id) => {
  if (!isSupabaseReady()) throw new Error("Supabase non configuré");
  const { error } = await supabase.from("ventes").delete().eq("id", id);
  if (error) throw error;
};

// Petit helper pour CA quotidien (YYYY-MM-DD -> total)
export const fetchDailyRevenue = async () => {
  if (!isSupabaseReady()) throw new Error("Supabase non configuré");
  const { data, error } = await supabase.rpc("daily_revenue");
  if (error) throw error;
  return data; // [{ day: '2025-09-22', ca: 12345.67 }, ...]
};
