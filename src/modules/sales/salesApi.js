import api from "../../api/api";

export const mapDbToSale = (row) => ({
  id: row.id,
  date: row.date,
  created_at: row.created_at,
  client: row.client_name || "",
  modePaiement: row.payment_method || "Espèces",
  notes: row.notes || "",
  total: Number(row.total || 0),

  items: (row.items || []).map(it => {

    if (it.product_id) {
      return {
        type: "catalog",
        product_id: it.product_id,
        product_name: it.product_name,
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price)
      };
    }

    return {
      type: "custom",
      custom_name: it.product_name,
      custom_price: Number(it.unit_price),
      quantity: Number(it.quantity)
    };
  })
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
  const response = await api.get("/sales");
  return response.data.data;
};

/* ===========================
   CREATE
=========================== */

export const createSale = async (sale) => {

  const payload = {
    date: sale.date,
    client_name: sale.client || null,
    payment_method: sale.modePaiement || "Espèces",
    notes: sale.notes || null,
    items: (sale.items || []).map(it => {
      if (it.product_id) {
        return {
          product_id: it.product_id,
          quantity: Number(it.quantity)
        };
      }

      return {
        product_id: null,
        custom_name: it.custom_name,
        custom_price: Number(it.custom_price),
        quantity: Number(it.quantity)
      };
    })
  };

  const response = await api.post("/sales", payload);

  return response.data;
};

/* ===========================
   UPDATE
=========================== */

export const updateSale = async (sale) => {
  if (!sale.id) throw new Error("ID manquant");

  const payload = {
    date: sale.date,
    client_name: sale.client || null,
    payment_method: sale.modePaiement || "Espèces",
    notes: sale.notes || null,
    items: (sale.items || []).map(it => {
      if (it.product_id) {
        return {
          product_id: it.product_id,
          quantity: Number(it.quantity)
        };
      }

      return {
        product_id: null,
        custom_name: it.custom_name,
        custom_price: Number(it.custom_price),
        quantity: Number(it.quantity)
      };
    })
  };

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