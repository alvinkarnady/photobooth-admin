'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Trash2, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';

type Frame = {
  id: string;
  name: string;
  overlay_image_path: string;
  photo_slots: any[];
  created_at: string;
};

export default function FramesPage() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFrames = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('frames')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching frames:', error);
      alert('Gagal mengambil data frame');
    } else {
      setFrames(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFrames();
  }, []);

  const handleDelete = async (frame: Frame) => {
    if (!window.confirm(`Yakin ingin menghapus frame "${frame.name}"?`)) return;

    setDeletingId(frame.id);
    try {
      // 1. Delete from storage
      const fileName = `overlay_${frame.id}.png`;
      await supabase.storage.from('frame_assets').remove([fileName]);

      // 2. Delete from DB
      await supabase.from('frames').delete().eq('id', frame.id);

      // Refresh list
      setFrames(frames.filter(f => f.id !== frame.id));
    } catch (error) {
      console.error('Error deleting frame:', error);
      alert('Gagal menghapus frame');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manajemen Frame</h1>
          <p className="text-slate-500 mt-1">Kelola template photobooth Anda.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchFrames}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/frames/create"
            className="flex items-center gap-2 px-5 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Frame Baru
          </Link>
        </div>
      </div>

      {loading && frames.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
        </div>
      ) : frames.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Belum ada frame</h3>
          <p className="text-slate-500 mb-6">Buat frame pertama Anda untuk mulai digunakan di iPad.</p>
          <Link
            href="/admin/frames/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors shadow-md shadow-pink-500/20"
          >
            <Plus className="w-5 h-5" />
            Buat Frame Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frames.map((frame) => (
            <div key={frame.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="aspect-[3/4] relative bg-slate-100 overflow-hidden">
                {frame.overlay_image_path ? (
                  <img 
                    src={frame.overlay_image_path} 
                    alt={frame.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    Tidak ada gambar
                  </div>
                )}
                
                {/* Photo Slots Overlay Preview */}
                <div className="absolute inset-0 pointer-events-none">
                  {frame.photo_slots?.map((slot: any, idx: number) => (
                    <div 
                      key={idx}
                      className="absolute border-2 border-dashed border-pink-400 bg-pink-400/20 rounded-lg flex items-center justify-center text-pink-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        left: `${slot.left * 100}%`,
                        top: `${slot.top * 100}%`,
                        width: `${slot.width * 100}%`,
                        height: `${slot.height * 100}%`,
                      }}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-800 mb-1">{frame.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{frame.photo_slots?.length || 0} Slot Foto</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDelete(frame)}
                    disabled={deletingId === frame.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-red-600 bg-red-50 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {deletingId === frame.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Dummy icon for empty state
const ImageIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);
