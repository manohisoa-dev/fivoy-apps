import api from "../../api/api";

export const fetchClients = async (search = "") => {
  const res = await api.get("/clients");
  let data = res.data.data || res.data;

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(c =>
      c.first_name.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }

  return data;
};

export const createClient = (data) => api.post("/clients", data);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}`);
export const toggleClient = (id) => api.patch(`/clients/${id}/toggle`);