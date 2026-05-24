'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Trash2, History } from 'lucide-react';

type Transaction = {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  created_at: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    
    // Get total count
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });
      
    if (count !== null) {
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE) || 1);
    }

    // Get paginated data
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: string, orderId: string) => {
    if (!window.confirm(`Yakin ingin menghapus transaksi "${orderId}"? Ini akan menghapus data dari riwayat secara permanen.`)) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus transaksi. Cek izin RLS di Supabase.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <History className="w-8 h-8 text-pink-500" />
          Riwayat Transaksi
        </h1>
        <p className="text-slate-500 mt-1">
          Pantau seluruh status pembayaran QRIS. Anda dapat menghapus transaksi percobaan (sandbox) di sini.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Belum ada riwayat transaksi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                  <th className="p-4 font-semibold">Waktu Transaksi</th>
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold text-right">Nominal</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  return (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <div className="text-sm font-medium text-slate-800">
                          {new Date(t.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {new Date(t.created_at).toLocaleTimeString('id-ID')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                          {t.order_id}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-semibold text-slate-800">
                          Rp {(t.amount || 0).toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {t.status === 'paid' || t.status === 'settlement' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Sukses
                          </span>
                        ) : t.status === 'pending' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {t.status || 'Gagal'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(t.id, t.order_id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {!loading && transactions.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Halaman <span className="font-semibold text-slate-800">{currentPage}</span> dari <span className="font-semibold text-slate-800">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
