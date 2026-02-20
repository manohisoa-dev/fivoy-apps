import api from "../../api/api";

/* ===========================
   MAPPERS
=========================== */

export const mapSaleToDb = (sale) => ({
  date: sale.date,
  client_name: sale.client || null,
  payment_method: sale.paymentMethod || "Espèces",
  notes: sale.notes || null,
  total: Number(sale.total || 0),
  items: (sale.items || []).map(it => ({
    article_nom: it.name,
    quantite: Number(it.qty),
    prix_unitaire: Number(it.price),
  })),
});

export const mapDbToSale = (row) => ({
  id: row.id,
  date: row.date,
  created_at: row.created_at,
  client: row.client_name || "",
  paymentMethod: row.payment_method || "Espèces",
  notes: row.notes || "",
  total: Number(row.total || 0),
  items: (row.items || []).map(it => ({
    name: it.article_nom,
    qty: Number(it.quantite),
    price: Number(it.prix_unitaire),
  })),
});

/* ===========================
   FETCH ALL
=========================== */

export const fetchSales = async () => {
  const response = await api.get("/sales");

  const rows = Array.isArray(response.data)
    ? response.data
    : response.data.data;

  return rows.map(mapDbToSale);
};


/* ===========================
   FETCH BY DATE PAGED
=========================== */

export const fetchSalesByDatePaged = async ({
  date,
  page = 1,
  pageSize = 10,
  q = "",
}) => {
  const response = await api.get("/sales/by-date", {
    params: { date, page, pageSize, q },
  });

  const data = response.data;

  return {
    sales: (data.sales || []).map(mapDbToSale),
    totalCount: data.totalCount || 0,
    totalJour: Number(data.totalJour || 0),
  };
};

/* ===========================
   CREATE
=========================== */

export const createSale = async (sale) => {
  const payload = mapSaleToDb(sale);

  const response = await api.post("/sales", payload);

  return mapDbToSale(response.data);
};

/* ===========================
   UPDATE
=========================== */

export const updateSale = async (sale) => {
  if (!sale.id) throw new Error("ID manquant");

  const payload = mapSaleToDb(sale);

  await api.put(`/sales/${sale.id}`, payload);
};

/* ===========================
   DELETE
=========================== */

export const deleteSale = async (id) => {
  await api.delete(`/sales/${id}`);
};

/* ===========================
   DAILY REVENUE
=========================== */

export const fetchDailyRevenue = async () => {
  const response = await api.get("/sales/daily-revenue");
  return response.data;
};