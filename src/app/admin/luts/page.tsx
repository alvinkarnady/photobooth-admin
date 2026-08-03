"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Trash2, Power, PowerOff, Upload } from "lucide-react";

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

  useEffect(() => {
    fetchLuts();
  }, []);

  const fetchLuts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/luts");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLuts(data || []);
    } catch (error) {
      console.error("Error fetching LUTs:", error);
    } finally {
      setIsLoading(false);
    }
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
            alert(
              `Error: LUT harus berukuran tepat 512x512 piksel (Level 8 HALD LUT). Ukuran gambar Anda adalah ${img.width}x${img.height}.`,
            );
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
      const formData = new FormData();
      formData.append("name", filterName.trim());
      formData.append("file", file);

      const res = await fetch("/api/admin/luts", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      setFilterName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchLuts();
    } catch (error: any) {
      alert("Gagal mengupload LUT: " + (error.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/luts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      fetchLuts();
    } catch (error) {
      console.error("Error toggling LUT:", error);
    }
  };

  const deleteLut = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus filter LUT ini?")) return;

    try {
      const res = await fetch(`/api/admin/luts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchLuts();
    } catch (error) {
      console.error("Error deleting LUT:", error);
      alert("Gagal menghapus LUT");
    }
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
          <div className="overflow-x-auto">
            <table className="w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[28%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Filter</th>
                  <th className="w-[42%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Storage</th>
                  <th className="w-[15%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="w-[15%] px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {luts.map((lut) => {
                  const shortPath = `luts/${lut.id}.png`;
                  const openUrl = lut.lut_url?.split("?")[0] || lut.lut_url;
                  return (
                    <tr key={lut.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 truncate">{lut.name}</div>
                        <div className="text-xs text-gray-400">{new Date(lut.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <a
                          href={openUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={lut.lut_url}
                          className="inline-block max-w-full truncate bg-gray-100 px-2 py-1 rounded text-xs font-mono text-pink-700 hover:text-pink-900 hover:underline"
                        >
                          {shortPath}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${lut.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {lut.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="inline-flex items-center justify-end gap-3">
                          <button
                            onClick={() => toggleStatus(lut.id, lut.is_active)}
                            className={lut.is_active ? "text-amber-600 hover:text-amber-900" : "text-green-600 hover:text-green-900"}
                            title={lut.is_active ? "Matikan Filter" : "Aktifkan Filter"}
                          >
                            {lut.is_active ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => deleteLut(lut.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus Filter"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
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
  );
}
