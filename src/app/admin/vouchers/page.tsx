'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, Ticket } from 'lucide-react';

type Voucher = {
  id: string;
  name: string;
  code: string;
  quota: number;
  is_unlimited: boolean;
  expire_date: string;
  description: string;
  created_at: string;
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newQuota, setNewQuota] = useState(1);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [newExpireDate, setNewExpireDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchVouchers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching vouchers:', error);
    } else {
      setVouchers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
    
    // Set default expire date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNewExpireDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim() || !newExpireDate) return;

    setIsAdding(true);
    try {
      // Create a valid ISO string for the date (end of day)
      const expireDateTime = new Date(`${newExpireDate}T23:59:59Z`).toISOString();

      const { data, error } = await supabase
        .from('vouchers')
        .insert({ 
          name: newName.trim(), 
          code: newCode.trim().toUpperCase(),
          quota: newQuota,
          is_unlimited: isUnlimited,
          expire_date: expireDateTime,
          description: newDescription.trim()
        })
        .select()
        .single();

      if (error) throw error;
      
      setVouchers([data, ...vouchers]);
      setNewName('');
      setNewCode('');
      setNewQuota(1);
      setIsUnlimited(false);
      setNewDescription('');
    } catch (error: any) {
      alert(error.message || 'Gagal menambahkan voucher. Pastikan kode unik.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Yakin ingin menghapus voucher "${code}"?`)) return;

    try {
      const { error } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setVouchers(vouchers.filter(v => v.id !== id));
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus voucher');
    }
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Ticket className="w-8 h-8 text-pink-500" />
          Manajemen Voucher
        </h1>
        <p className="text-slate-500 mt-1">
          Buat dan kelola kode voucher untuk sesi photobooth gratis atau berkuota.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Add New */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Buat Voucher Baru</h2>
            <form onSubmit={handleAdd}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Voucher</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Diskon Event XYZ"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none bg-slate-50"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Unik</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. PROMO2026"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none bg-slate-50 font-mono uppercase"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Batas Penggunaan (Kuota)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    value={newQuota}
                    onChange={e => setNewQuota(parseInt(e.target.value) || 0)}
                    disabled={isUnlimited}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none bg-slate-50 disabled:opacity-50"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isUnlimited}
                      onChange={e => setIsUnlimited(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Unlimited</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Berlaku Hingga</label>
                <input
                  type="date"
                  value={newExpireDate}
                  onChange={e => setNewExpireDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none bg-slate-50"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi (Opsional)</label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Catatan internal..."
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="w-full flex justify-center items-center gap-2 bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors disabled:opacity-70"
              >
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Buat Voucher
              </button>
            </form>
          </div>
        </div>

        {/* Right: List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
              </div>
            ) : vouchers.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                Belum ada voucher yang dibuat.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                      <th className="p-4 font-semibold">Kode & Nama</th>
                      <th className="p-4 font-semibold text-center">Kuota</th>
                      <th className="p-4 font-semibold">Berlaku Hingga</th>
                      <th className="p-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.map((v) => {
                      const expired = isExpired(v.expire_date);
                      const empty = !v.is_unlimited && v.quota <= 0;
                      const active = !expired && !empty;

                      return (
                        <tr key={v.id} className={`border-b border-slate-100 hover:bg-slate-50 ${!active ? 'opacity-60' : ''}`}>
                          <td className="p-4">
                            <div className="font-mono font-bold text-slate-800 tracking-wider">
                              {v.code}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">{v.name}</div>
                          </td>
                          <td className="p-4 text-center">
                            {v.is_unlimited ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Unlimited
                              </span>
                            ) : (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                empty ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                Sisa {v.quota}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className={`text-sm ${expired ? 'text-red-500 font-medium' : 'text-slate-700'}`}>
                              {new Date(v.expire_date).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </div>
                            {expired && <div className="text-xs text-red-500 mt-0.5">Kadaluarsa</div>}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDelete(v.id, v.code)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus Voucher"
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
          </div>
        </div>

      </div>
    </div>
  );
}
