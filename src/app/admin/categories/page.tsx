'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

type PaperCategory = {
  id: string;
  name: string;
  is_active: boolean;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<PaperCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('paper_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from('paper_categories')
        .insert({ name: newName.trim(), is_active: true })
        .select()
        .single();

      if (error) throw error;
      
      setCategories([...categories, data]);
      setNewName('');
    } catch (error: any) {
      alert(error.message || 'Gagal menambahkan kategori');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic UI update
      setCategories(categories.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
      
      const { error } = await supabase
        .from('paper_categories')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling category:', error);
      // Revert on error
      fetchCategories();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('paper_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus kategori');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Manajemen Kategori Kertas</h1>
        <p className="text-slate-500 mt-1">
          Buat ukuran kertas baru dan tentukan mana yang aktif tampil di aplikasi iPad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Add New */}
        <div className="md:col-span-1">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Tambah Kategori</h2>
            <form onSubmit={handleAdd}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Ukuran</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. 4x6 Standard"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none bg-slate-50"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isAdding}
                className="w-full flex justify-center items-center gap-2 bg-slate-800 text-white py-2 rounded-xl font-semibold hover:bg-slate-700 transition-colors disabled:opacity-70"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Tambah
              </button>
            </form>
          </div>
        </div>

        {/* Right: List */}
        <div className="md:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
              </div>
            ) : categories.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                Belum ada kategori. Silakan buat yang pertama.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                    <th className="p-4 font-semibold">Nama Kategori</th>
                    <th className="p-4 font-semibold text-center">Status Aktif</th>
                    <th className="p-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{cat.name}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleActive(cat.id, cat.is_active)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            cat.is_active 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {cat.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {cat.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
