"use client";

import { useEffect, useState, use } from "react";
import { cmsConfig } from "@/lib/cms-config";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Loader2, Save, Image as ImageIcon, Upload, RotateCcw } from "lucide-react";
import enMessages from "../../../../../messages/en.json";
import idMessages from "../../../../../messages/id.json";

export default function CMSPage({ params }: { params: Promise<{ page: string }> }) {
  const resolvedParams = use(params);
  const pageId = resolvedParams.page;
  const config = cmsConfig[pageId];

  const [activeLocale, setActiveLocale] = useState<"en" | "id">("id");
  const [activeSection, setActiveSection] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  useEffect(() => {
    if (config && config.sections.length > 0) {
      setActiveSection(config.sections[0].id);
    }
  }, [config]);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("marketing_contents")
        .select("*")
        .eq("page", pageId)
        .eq("locale", activeLocale);

      if (error) {
        console.error("Error fetching content:", error);
      } else if (data) {
        const newData: Record<string, any> = {};
        data.forEach((row) => {
          if (row.content) {
            Object.assign(newData, row.content);
          }
        });
        setFormData(newData);
      }
      setLoading(false);
    };

    fetchContent();
  }, [pageId, activeLocale]);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (key: string, file: File) => {
    setUploadingImage(key);
    const supabase = getSupabaseBrowserClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `cms/${pageId}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('marketing-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('marketing-assets')
        .getPublicUrl(filePath);

      handleInputChange(key, data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal mengupload gambar. Pastikan storage bucket "marketing-assets" sudah dibuat dan public.');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSave = async () => {
    if (!activeSection) return;
    
    setSaving(true);
    const supabase = getSupabaseBrowserClient();
    
    // Extract only the fields for the active section to save to that section's row
    const sectionFields = config.sections.find(s => s.id === activeSection)?.fields || [];
    const sectionData: Record<string, any> = {};
    
    sectionFields.forEach(field => {
      // Hanya simpan jika ada nilainya. Jika string kosong, berarti direset ke default,
      // sehingga tidak akan masuk ke database dan otomatis mengambil dari JSON lokal.
      if (formData[field.name] !== undefined && formData[field.name] !== "") {
        sectionData[field.name] = formData[field.name];
      }
    });

    try {
      // Upsert the data for this page, section, and locale
      const { error } = await supabase
        .from('marketing_contents')
        .upsert(
          {
            page: pageId,
            section: activeSection,
            locale: activeLocale,
            content: sectionData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'page,section,locale' }
        );

      if (error) throw error;
      alert("Berhasil disimpan!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Konfigurasi CMS untuk halaman ini tidak ditemukan.</p>
      </div>
    );
  }

  const currentSection = config.sections.find((s) => s.id === activeSection);
  const defaultMessages = activeLocale === "en" ? (enMessages as any) : (idMessages as any);
  const pageKey = pageId.charAt(0).toUpperCase() + pageId.slice(1);
  const defaultSectionData = defaultMessages[pageKey] || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">
          CMS: {config.title}
        </h1>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveLocale("id")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeLocale === "id"
                ? "bg-pink-100 text-pink-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Indonesia (ID)
          </button>
          <button
            onClick={() => setActiveLocale("en")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeLocale === "en"
                ? "bg-pink-100 text-pink-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            English (EN)
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sections Sidebar */}
        <div className="lg:w-64 flex flex-col gap-2">
          <div className="bg-white rounded-xl border border-slate-200 p-2">
            {config.sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-pink-50 text-pink-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Form */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          ) : (
            currentSection && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-semibold text-slate-800">
                    {currentSection.title} ({activeLocale.toUpperCase()})
                  </h2>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan Bagian Ini
                  </button>
                </div>

                <div className="space-y-6 max-w-3xl">
                  {currentSection.fields.map((field) => {
                    const isOverridden = formData[field.name] !== undefined && formData[field.name] !== "";
                    const displayValue = formData[field.name] !== undefined ? formData[field.name] : (defaultSectionData[field.name] || "");
                    
                    return (
                    <div key={field.name} className="space-y-2 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-slate-800">
                          {field.label}
                        </label>
                        {isOverridden && (
                          <button
                            onClick={() => handleInputChange(field.name, "")}
                            className="flex items-center gap-1 text-xs font-medium text-pink-600 hover:text-pink-700 transition-colors"
                            title="Hapus kustomisasi dan kembali ke bawaan"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reset ke Bawaan
                          </button>
                        )}
                      </div>
                      
                      {field.type === "text" && (
                        <input
                          type="text"
                          value={displayValue}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${isOverridden ? 'bg-white border-pink-200' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
                          placeholder={`Nilai bawaan untuk ${field.label}...`}
                        />
                      )}

                      {field.type === "textarea" && (
                        <textarea
                          value={displayValue}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          rows={4}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${isOverridden ? 'bg-white border-pink-200' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
                          placeholder={`Nilai bawaan untuk ${field.label}...`}
                        />
                      )}

                      {field.type === "image" && (
                        <div className="space-y-3">
                          {displayValue && (
                            <div className={`relative w-48 h-48 rounded-lg overflow-hidden border ${isOverridden ? 'border-pink-300 shadow-sm' : 'border-slate-200'} bg-slate-100`}>
                              <img
                                src={displayValue}
                                alt={field.label}
                                className={`w-full h-full object-cover ${!isOverridden && 'opacity-70 grayscale'}`}
                              />
                              {!isOverridden && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <span className="text-white text-xs font-medium px-2 py-1 rounded bg-black/50">Gambar Bawaan</span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <label className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer transition-colors font-medium text-sm ${uploadingImage === field.name ? 'opacity-50 pointer-events-none' : ''}`}>
                              {uploadingImage === field.name ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              Upload Baru
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleImageUpload(field.name, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                            <span className="text-xs text-slate-500">atau</span>
                            <input
                              type="text"
                              value={displayValue}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              className={`flex-1 px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${isOverridden ? 'bg-white border-pink-200' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                              placeholder="Masukkan URL Gambar..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
