"use client";

import { useState, useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Loader2, Plus, Trash2, Power, PowerOff, Upload } from "lucide-react";

interface LutFilter {
  id: string;
  name: string;
  lut_url: string;
  is_active: boolean;
  created_at: string;
}

export default function LutManagerPage() {
  const [luts, setLuts] = useState<LutFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [filterName, setFilterName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    fetchLuts();
  }, []);

  const fetchLuts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("lut_filters")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLuts(data);
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!filterName.trim()) {
      alert("Harap isi nama filter terlebih dahulu!");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate Image Dimensions (Must be 512x512 for HALD 8 LUT)
    const validateImage = () => {
      return new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (img.width !== 512 || img.height !== 512) {
            alert(`Error: LUT harus berukuran tepat 512x512 piksel (Level 8 HALD LUT). Ukuran gambar Anda adalah ${img.width}x${img.height}.`);
            resolve(false);
          } else {
            resolve(true);
          }
        };
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
      });
    };

    const isValid = await validateImage();
    if (!isValid) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('luts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Insert into database
      const { error: dbError } = await supabase
        .from('lut_filters')
        .insert([
          { name: filterName.trim(), lut_url: fileName, is_active: true }
        ]);

      if (dbError) throw dbError;

      setFilterName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchLuts();
    } catch (error: any) {
      alert("Gagal mengupload LUT: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('lut_filters')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    if (!error) fetchLuts();
  };

  const deleteLut = async (id: string, fileName: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus filter LUT ini?")) return;
    
    // Attempt to delete from storage first (ignoring errors if file is gone)
    await supabase.storage.from('luts').remove([fileName]);
    
    // Delete from DB
    const { error } = await supabase
      .from('lut_filters')
      .delete()
      .eq('id', id);
      
    if (!error) fetchLuts();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen LUT Filters</h1>
          <p className="text-gray-500 mt-2">Upload dan kelola filter warna bergaya sinematik (.png HALD LUT) untuk Photobooth Anda.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Filter Baru</label>
          <input 
            type="text" 
            placeholder="Contoh: Cinematic Vintage" 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </div>
        <div>
          <input 
            type="file" 
            accept="image/png"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden" 
          />
          <button 
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {isUploading ? "Mengunggah..." : "Upload LUT (.png)"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : luts.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            Belum ada LUT yang diunggah. Tambahkan satu di atas!
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Filter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Storage</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {luts.map((lut) => (
                <tr key={lut.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{lut.name}</div>
                    <div className="text-xs text-gray-400">{new Date(lut.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{lut.lut_url}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${lut.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {lut.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end">
                    <button 
                      onClick={() => toggleStatus(lut.id, lut.is_active)}
                      className={`${lut.is_active ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'} mr-4`}
                      title={lut.is_active ? "Matikan Filter" : "Aktifkan Filter"}
                    >
                      {lut.is_active ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => deleteLut(lut.id, lut.lut_url)}
                      className="text-red-600 hover:text-red-900"
                      title="Hapus Filter"
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
  );
}
