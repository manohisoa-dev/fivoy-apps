import { useEffect, useState } from 'react';
import { listOrders, createOrder, updateOrderStatus, deleteOrder } from './ordersApi';
import { useLoadingStore } from '../../store/loading';

export function useOrders() {
  const { withLoading } = useLoadingStore.getState();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function load() {
    await withLoading(async () => {
      const { data, count } = await listOrders({
        q, status, category,
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
      setRows(data || []);
      setTotal(count || 0);
    });
  }

  useEffect(() => { setPage(1); }, [q, status, category]);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, status, category, page, pageSize]);

  return {
    rows, total, q, setQ, status, setStatus, category, setCategory, page, setPage, pageSize, setPageSize,
    reload: load,
    async addOrder(payload) {
      await withLoading(async () => { await createOrder(payload); });
      await load();
    },
    async changeStatus(id, status) {
      await withLoading(async () => { await updateOrderStatus(id, status); });
      await load();
    },
    async remove(id) {
      await withLoading(async () => { await deleteOrder(id); });
      await load();
    }
  };
}
