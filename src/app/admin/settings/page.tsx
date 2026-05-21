'use client';

import { useState, useEffect } from 'react';
import { Save, User, Lock, Loader2, CheckCircle, Camera } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

interface CameraSettings {
  id: number;
  enable_mirror: boolean;
  enable_wide_lens: boolean;
  enable_switch_camera: boolean;
  enable_flash: boolean;
}

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Camera Settings State
  const [enableMirror, setEnableMirror] = useState(true);
  const [enableWideLens, setEnableWideLens] = useState(true);
  const [enableSwitchCamera, setEnableSwitchCamera] = useState(true);
  const [enableFlash, setEnableFlash] = useState(true);
  const [isSavingCamera, setIsSavingCamera] = useState(false);
  const [cameraMessage, setCameraMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user.email) {
        setEmail(session.user.email);
        setCurrentEmail(session.user.email);
      }
    });

    // Fetch Camera Settings
    supabase.from('camera_settings').select('*').eq('id', 1).single().then(({ data, error }) => {
      const settings = data as CameraSettings | null;
      if (settings && !error) {
        setEnableMirror(settings.enable_mirror);
        setEnableWideLens(settings.enable_wide_lens);
        setEnableSwitchCamera(settings.enable_switch_camera);
        setEnableFlash(settings.enable_flash);
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

  const handleUpdateCameraSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCamera(true);
    setCameraMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('camera_settings').update({
        enable_mirror: enableMirror,
        enable_wide_lens: enableWideLens,
        enable_switch_camera: enableSwitchCamera,
        enable_flash: enableFlash,
      } as never).eq('id', 1);

      if (error) {
        setCameraMessage({ type: 'error', text: error.message });
      } else {
        setCameraMessage({ type: 'success', text: 'Pengaturan kamera berhasil disimpan!' });
      }
    } catch {
      setCameraMessage({ type: 'error', text: 'Terjadi kesalahan. Coba lagi nanti.' });
    } finally {
      setIsSavingCamera(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Pengaturan Akun</h1>
        <p className="text-slate-500 mt-1">Ubah email dan password akun admin kamu.</p>
      </div>

      {/* Camera Settings */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-pink-500" />
          Pengaturan Fitur Kamera
        </h2>
        <p className="text-sm text-slate-500 mb-6">Pilih fitur apa saja yang muncul di layar kamera aplikasi Photobooth.</p>
        
        <form onSubmit={handleUpdateCameraSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mirror Toggle */}
            <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <div>
                <div className="font-semibold text-slate-800">Fitur Mirror</div>
                <div className="text-xs text-slate-500 mt-1">Mengaktifkan tombol Mirror</div>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={enableMirror} onChange={(e) => setEnableMirror(e.target.checked)} />
                <div className={`block w-14 h-8 rounded-full transition-colors ${enableMirror ? 'bg-pink-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enableMirror ? 'translate-x-6' : ''}`}></div>
              </div>
            </label>

            {/* Wide Lens Toggle */}
            <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <div>
                <div className="font-semibold text-slate-800">Lensa Wide</div>
                <div className="text-xs text-slate-500 mt-1">Mengaktifkan tombol Lensa Wide (0.5x)</div>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={enableWideLens} onChange={(e) => setEnableWideLens(e.target.checked)} />
                <div className={`block w-14 h-8 rounded-full transition-colors ${enableWideLens ? 'bg-pink-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enableWideLens ? 'translate-x-6' : ''}`}></div>
              </div>
            </label>

            {/* Switch Camera Toggle */}
            <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <div>
                <div className="font-semibold text-slate-800">Putar Kamera</div>
                <div className="text-xs text-slate-500 mt-1">Mengaktifkan tombol Kamera Depan/Belakang</div>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={enableSwitchCamera} onChange={(e) => setEnableSwitchCamera(e.target.checked)} />
                <div className={`block w-14 h-8 rounded-full transition-colors ${enableSwitchCamera ? 'bg-pink-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enableSwitchCamera ? 'translate-x-6' : ''}`}></div>
              </div>
            </label>

            {/* Flash Toggle */}
            <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <div>
                <div className="font-semibold text-slate-800">Efek Flash</div>
                <div className="text-xs text-slate-500 mt-1">Layar berkedip putih saat mengambil foto</div>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={enableFlash} onChange={(e) => setEnableFlash(e.target.checked)} />
                <div className={`block w-14 h-8 rounded-full transition-colors ${enableFlash ? 'bg-pink-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enableFlash ? 'translate-x-6' : ''}`}></div>
              </div>
            </label>
          </div>

          {cameraMessage && (
            <div className={`flex items-center gap-2 text-sm ${cameraMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {cameraMessage.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {cameraMessage.text}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingCamera}
              className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg disabled:opacity-70"
            >
              {isSavingCamera ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSavingCamera ? 'Menyimpan...' : 'Simpan Pengaturan Kamera'}
            </button>
          </div>
        </form>
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
