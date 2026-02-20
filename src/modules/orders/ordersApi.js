
export async function listOrders({ q = '', status = '', category = '', limit = 50, offset = 0 } = {}) {
  let query = supabase.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false });

  if (status)   query = query.eq('status', status);
  if (category) query = query.eq('category', category);
  if (q) {
    // filtre simple sur title + customer_name
    query = query.or(`title.ilike.%${q}%,customer_name.ilike.%${q}%`);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) throw error;
  return { data, count };
}

export async function createOrder(payload) {
  const { data, error } = await supabase.from('orders').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteOrder(id) {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
  return true;
}
