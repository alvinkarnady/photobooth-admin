'use client';

import { useState, useEffect } from 'react';
import { Save, User, Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load existing credentials from local storage, or fallback to default
    const savedEmail = localStorage.getItem('admin_email') || 'admin@piawai.id';
    const savedPassword = localStorage.getItem('admin_password') || 'admin123';
    setEmail(savedEmail);
    setPassword(savedPassword);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Email dan Password tidak boleh kosong!');
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('admin_email', email);
      localStorage.setItem('admin_password', password);
      setIsSaving(false);
      alert('Kredensial berhasil diperbarui! Silakan gunakan email dan password baru ini saat login berikutnya.');
      // Also update layout state if needed, but layout reads from local storage indirectly or we can force reload
      window.location.reload();
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Pengaturan Akun</h1>
        <p className="text-slate-500 mt-1">Ubah email dan password untuk login Admin Panel.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <User className="w-4 h-4 text-pink-500" />
              Email Baru
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50 text-slate-800 font-medium"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Lock className="w-4 h-4 text-pink-500" />
              Password Baru
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50 text-slate-800 font-medium tracking-wide"
              required
            />
            <p className="text-xs text-slate-400 mt-2 ml-1">
              *Catatan: Kredensial ini disimpan secara lokal di browser Anda.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
