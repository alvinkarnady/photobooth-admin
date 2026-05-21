'use client';

import { useState, useEffect } from 'react';
import { Save, User, Lock, Loader2, CheckCircle } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user.email) {
        setEmail(session.user.email);
        setCurrentEmail(session.user.email);
      }
    });
  }, []);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailMessage({ type: 'error', text: 'Email tidak boleh kosong!' });
      return;
    }
    if (email === currentEmail) {
      setEmailMessage({ type: 'error', text: 'Email baru sama dengan email saat ini.' });
      return;
    }

    setIsSavingEmail(true);
    setEmailMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ email });

      if (error) {
        setEmailMessage({ type: 'error', text: error.message });
      } else {
        setEmailMessage({ type: 'success', text: 'Email berhasil diperbarui! Cek inbox email baru untuk konfirmasi.' });
        setCurrentEmail(email);
      }
    } catch {
      setEmailMessage({ type: 'error', text: 'Terjadi kesalahan. Coba lagi nanti.' });
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setPasswordMessage({ type: 'error', text: 'Password tidak boleh kosong!' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password minimal 6 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Password dan konfirmasi tidak cocok.' });
      return;
    }

    setIsSavingPassword(true);
    setPasswordMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setPasswordMessage({ type: 'error', text: error.message });
      } else {
        setPasswordMessage({ type: 'success', text: 'Password berhasil diperbarui!' });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Terjadi kesalahan. Coba lagi nanti.' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Pengaturan Akun</h1>
        <p className="text-slate-500 mt-1">Ubah email dan password akun admin kamu.</p>
      </div>

      {/* Update Email */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-pink-500" />
          Ubah Email
        </h2>
        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
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
          {emailMessage && (
            <div className={`flex items-center gap-2 text-sm ${emailMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {emailMessage.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {emailMessage.text}
            </div>
          )}
          <button
            type="submit"
            disabled={isSavingEmail}
            className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg disabled:opacity-70"
          >
            {isSavingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSavingEmail ? 'Menyimpan...' : 'Simpan Email'}
          </button>
        </form>
      </div>

      {/* Update Password */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-pink-500" />
          Ubah Password
        </h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password Baru
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50 text-slate-800 font-medium tracking-wide"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50 text-slate-800 font-medium tracking-wide"
              required
            />
          </div>
          {passwordMessage && (
            <div className={`flex items-center gap-2 text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {passwordMessage.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {passwordMessage.text}
            </div>
          )}
          <button
            type="submit"
            disabled={isSavingPassword}
            className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg disabled:opacity-70"
          >
            {isSavingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSavingPassword ? 'Menyimpan...' : 'Simpan Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
