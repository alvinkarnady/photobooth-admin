'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Trash2, Plus, RefreshCw, Edit2, GripVertical, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

type Frame = {
  id: string;
  name: string;
  overlay_image_path: string;
  photo_slots: any[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export default function FramesPage() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const startYRef = useRef(0);
  const scrollYRef = useRef(0);

  const fetchFrames = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('frames')
      .select('*')
      .order('sort_order', { ascending: true })
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
      const fileName = `overlay_${frame.id}.png`;
      await supabase.storage.from('frame_assets').remove([fileName]);
      await supabase.from('frames').delete().eq('id', frame.id);
      setFrames(frames.filter(f => f.id !== frame.id));
    } catch (error) {
      console.error('Error deleting frame:', error);
      alert('Gagal menghapus frame');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setFrames(frames.map(f => f.id === id ? { ...f, is_active: !currentStatus } : f));
      const { error } = await supabase
        .from('frames')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling frame:', error);
      fetchFrames();
    }
  };

  // --- Drag & Drop logic (pointer events for mouse + touch) ---

  const saveSortOrder = useCallback(async (reorderedFrames: Frame[]) => {
    try {
      await Promise.all(
        reorderedFrames.map((f, i) =>
          supabase.from('frames').update({ sort_order: i }).eq('id', f.id)
        )
      );
    } catch (e) {
      console.error('Save sort order error', e);
    }
  }, []);

  const handleDragStart = (e: React.PointerEvent, index: number) => {
    // Only start drag from the grip handle
    e.preventDefault();
    setDragIndex(index);
    setOverIndex(index);
    startYRef.current = e.clientY;
    scrollYRef.current = window.scrollY;

    // Capture pointer so events continue even outside element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (dragIndex === null) return;

    // Determine which item we're hovering over based on bounding rects
    const clientY = e.clientY;
    let closest = dragIndex;
    let closestDist = Infinity;

    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const dist = Math.abs(clientY - midY);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });

    setOverIndex(closest);
  }, [dragIndex]);

  const handleDragEnd = useCallback(() => {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }

    const newFrames = [...frames];
    const [moved] = newFrames.splice(dragIndex, 1);
    newFrames.splice(overIndex, 0, moved);

    const updated = newFrames.map((f, i) => ({ ...f, sort_order: i }));
    setFrames(updated);
    saveSortOrder(updated);

    setDragIndex(null);
    setOverIndex(null);
  }, [dragIndex, overIndex, frames, saveSortOrder]);

  // Build the visually-reordered list for rendering
  const getDisplayFrames = () => {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      return frames;
    }
    const display = [...frames];
    const [moved] = display.splice(dragIndex, 1);
    display.splice(overIndex, 0, moved);
    return display;
  };

  const displayFrames = getDisplayFrames();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manajemen Frame</h1>
          <p className="text-slate-500 mt-1">Kelola template photobooth Anda. Seret untuk mengurutkan.</p>
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
        <div ref={containerRef} className="space-y-3">
          {displayFrames.map((frame, index) => {
            const isDragging = dragIndex !== null && frame.id === frames[dragIndex]?.id;

            return (
              <div
                key={frame.id}
                ref={(el) => { itemRefs.current[index] = el; }}
                className={`
                  flex items-center gap-4 bg-white rounded-2xl border p-4 transition-all
                  ${isDragging ? 'shadow-xl ring-2 ring-pink-400 scale-[1.02] z-20 relative' : 'shadow-sm hover:shadow-md'}
                  ${frame.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60'}
                `}
              >
                {/* Drag Handle */}
                <div
                  className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors touch-none"
                  onPointerDown={(e) => handleDragStart(e, index)}
                  onPointerMove={handleDragMove}
                  onPointerUp={handleDragEnd}
                  onPointerCancel={handleDragEnd}
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Thumbnail */}
                <div className="w-16 h-20 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative">
                  {frame.overlay_image_path ? (
                    <img 
                      src={frame.overlay_image_path} 
                      alt={frame.name}
                      className="w-full h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                      N/A
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">#{index + 1}</span>
                    <h3 className="font-bold text-slate-800 truncate">{frame.name}</h3>
                  </div>
                  <p className="text-slate-500 text-sm">{frame.photo_slots?.length || 0} Slot Foto</p>
                </div>

                {/* Status Toggle */}
                <button
                  onClick={() => handleToggleActive(frame.id, frame.is_active)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex-shrink-0 ${
                    frame.is_active 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                  }`}
                >
                  {frame.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {frame.is_active ? 'Aktif' : 'Nonaktif'}
                </button>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <Link 
                    href={`/admin/frames/edit/${frame.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 text-slate-600 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(frame)}
                    disabled={deletingId === frame.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-red-600 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {deletingId === frame.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Dummy icon for empty state
const ImageIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);
