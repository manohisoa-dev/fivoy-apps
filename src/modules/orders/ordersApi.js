import api from "../../api/api";

export async function listOrders({
  q = "",
  status = "",
  category = "",
  limit = 50,
  offset = 0,
} = {}) {

  const res = await api.get("/orders");

  let rows = res.data;

  if (status) {
    rows = rows.filter((r) => r.status === status);
  }

  if (category) {
    rows = rows.filter((r) => r.category === category);
  }

  if (q) {
    const search = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.title?.toLowerCase().includes(search) ||
        r.customer_name?.toLowerCase().includes(search)
    );
  }

  const count = rows.length;

  const paginated = rows.slice(offset, offset + limit);

  return {
    data: paginated,
    count,
  };
}

export async function createOrder(payload) {
  const res = await api.post("/orders", payload);
  return res.data;
}

export async function updateOrderStatus(id, status) {
  const res = await api.put(`/orders/${id}`, { status });
  return res.data;
}

export async function deleteOrder(id) {
  await api.delete(`/orders/${id}`);
  return true;
}