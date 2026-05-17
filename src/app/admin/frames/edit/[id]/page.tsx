'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Plus, Save, Trash2, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Slot = {
  id: string;
  left: number; // ratio 0-1
  top: number; // ratio 0-1
  width: number; // ratio 0-1
  height: number; // ratio 0-1
};

export default function EditFramePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const frameId = params.id;
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [liveDuration, setLiveDuration] = useState<number>(5);

  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction State
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [initialSlot, setInitialSlot] = useState<Slot | null>(null);

  useEffect(() => {
    const fetchFrame = async () => {
      const { data, error } = await supabase
        .from('frames')
        .select('*')
        .eq('id', frameId)
        .single();
        
      if (error || !data) {
        alert('Frame tidak ditemukan');
        router.push('/admin/frames');
        return;
      }

      setName(data.name);
      setPreviewUrl(data.overlay_image_path);
      setImageSize({ width: data.canvas_width || 0, height: data.canvas_height || 0 });
      
      if (data.photo_slots) {
        const loadedSlots = data.photo_slots.map((s: any) => ({
          id: uuidv4(),
          left: s.left,
          top: s.top,
          width: s.width,
          height: s.height
        }));
        setSlots(loadedSlots);
        
        // Load liveDuration from the first slot if available
        if (data.photo_slots.length > 0 && data.photo_slots[0].liveDuration) {
          setLiveDuration(data.photo_slots[0].liveDuration);
        }
      }
      setIsLoading(false);
    };

    fetchFrame();
  }, [frameId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = url;
    }
  };

  const addSlot = () => {
    setSlots([
      ...slots,
      { id: uuidv4(), left: 0.1, top: 0.1, width: 0.3, height: 0.4 },
    ]);
  };

  const removeSlot = (id: string) => {
    setSlots(slots.filter(s => s.id !== id));
  };

  const handlePointerDown = (e: React.PointerEvent, slot: Slot, action: 'drag' | 'resize') => {
    e.stopPropagation();
    setActiveSlotId(slot.id);
    setStartPos({ x: e.clientX, y: e.clientY });
    setInitialSlot({ ...slot });
    if (action === 'drag') setIsDragging(true);
    if (action === 'resize') setIsResizing(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeSlotId || !initialSlot || !containerRef.current) return;
    if (!isDragging && !isResizing) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - startPos.x) / containerRect.width;
    const dy = (e.clientY - startPos.y) / containerRect.height;

    setSlots(slots.map(slot => {
      if (slot.id === activeSlotId) {
        if (isDragging) {
          return {
            ...slot,
            left: Math.max(0, Math.min(1 - slot.width, initialSlot.left + dx)),
            top: Math.max(0, Math.min(1 - slot.height, initialSlot.top + dy)),
          };
        } else if (isResizing) {
          return {
            ...slot,
            width: Math.max(0.05, Math.min(1 - slot.left, initialSlot.width + dx)),
            height: Math.max(0.05, Math.min(1 - slot.top, initialSlot.height + dy)),
          };
        }
      }
      return slot;
    }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return alert('Nama frame harus diisi!');
    if (!previewUrl) return alert('Frame tidak memiliki gambar!');
    if (slots.length === 0) return alert('Tambahkan minimal 1 slot foto!');

    setIsSaving(true);
    try {
      let publicUrl = previewUrl;

      // If a new file was uploaded, upload it to storage
      if (file) {
        const fileName = `overlay_${frameId}.png`;
        const { error: uploadError } = await supabase.storage
          .from('frame_assets')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('frame_assets')
          .getPublicUrl(fileName);
          
        publicUrl = publicUrlData.publicUrl;
      }

      // Update DB
      const { error: dbError } = await supabase.from('frames').update({
        name,
        overlay_image_path: publicUrl,
        canvas_width: imageSize.width,
        canvas_height: imageSize.height,
        photo_slots: slots.map(s => ({
          left: s.left,
          top: s.top,
          width: s.width,
          height: s.height,
          rotation: 0,
          borderRadius: 8,
          liveDuration: liveDuration
        }))
      }).eq('id', frameId);

      if (dbError) throw dbError;

      alert('Frame berhasil diperbarui!');
      router.push('/admin/frames');
    } catch (error) {
      console.error('Update error:', error);
      alert('Terjadi kesalahan saat memperbarui frame.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/frames" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Frame</h1>
          <p className="text-slate-500">Sesuaikan tata letak dan nama frame.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* Left: Controls */}
        <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-sm shrink-0 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Frame</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ganti Gambar (Opsional)</label>
              <input
                type="file"
                accept="image/png"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              />
            </div>

            <hr className="border-slate-100" />

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Durasi Live Photo: {liveDuration} Detik
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={liveDuration}
                onChange={(e) => setLiveDuration(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <p className="text-xs text-slate-400 mt-2">Durasi panjang (5+ detik) menghasilkan gerakan yang mulus namun memerlukan koneksi stabil untuk mengunggah GIF yang lebih besar.</p>
            </div>

            <hr className="border-slate-100" />

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-semibold text-slate-700">Slot Foto ({slots.length})</label>
                <button
                  onClick={addSlot}
                  className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-3 h-3" /> Tambah
                </button>
              </div>

              {slots.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Belum ada slot. Klik Tambah untuk membuat slot foto.</p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot, idx) => (
                    <div key={slot.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="font-medium text-slate-600 text-sm">Slot {idx + 1}</span>
                      <button onClick={() => removeSlot(slot.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto pt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex justify-center items-center gap-2 bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>

        {/* Right: Visual Editor (Canvas) */}
        <div className="flex-1 bg-slate-200 rounded-2xl border border-slate-300 overflow-hidden relative flex items-center justify-center p-8 shadow-inner">
          <div 
            ref={containerRef}
            className="relative shadow-2xl bg-white select-none touch-none"
            style={{
              aspectRatio: imageSize.width && imageSize.height ? `${imageSize.width}/${imageSize.height}` : 'auto',
              maxHeight: '100%',
              maxWidth: '100%'
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <img src={previewUrl!} alt="Preview" className="w-full h-full object-contain pointer-events-none" />

            {/* Slots Overlay */}
            {slots.map((slot, idx) => (
              <div
                key={slot.id}
                className={`absolute border-2 flex items-center justify-center font-bold text-xl transition-colors cursor-move
                  ${activeSlotId === slot.id ? 'border-pink-500 bg-pink-500/30 text-pink-700 z-10 shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'border-blue-500 bg-blue-500/20 text-blue-700 hover:bg-blue-500/30'}
                `}
                style={{
                  left: `${slot.left * 100}%`,
                  top: `${slot.top * 100}%`,
                  width: `${slot.width * 100}%`,
                  height: `${slot.height * 100}%`,
                }}
                onPointerDown={(e) => handlePointerDown(e, slot, 'drag')}
              >
                {idx + 1}

                <div
                  className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-2 border-slate-800 rounded-full cursor-nwse-resize shadow-sm hover:scale-110 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, slot, 'resize')}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
