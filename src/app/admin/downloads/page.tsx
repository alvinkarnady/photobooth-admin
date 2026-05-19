'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Loader2,
  Trash2,
  RefreshCw,
  Link2,
  Search,
  CheckSquare,
  Square,
  Clock,
  HardDrive,
  Image as ImageIcon,
  Sparkles,
  AlertTriangle,
  Check,
  Timer,
  X,
} from 'lucide-react';

type Session = {
  id: string;
  photoUrl: string | null;
  fileCount: number;
  burstCount: number;
  liveCount: number;
  totalSize: number;
  createdAt: string;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return '1 hari lalu';
  if (diffDays < 30) return `${diffDays} hari lalu`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 bulan lalu';
  return `${diffMonths} bulan lalu`;
}

function getDaysOld(dateStr: string): number {
  const now = new Date();
  const date = new Date(dateStr);
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DownloadsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [autoDeleteDays, setAutoDeleteDays] = useState(30);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCleanupPanel, setShowCleanupPanel] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      alert('Gagal mengambil data sesi foto.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Filtered sessions
  const filteredSessions = sessions.filter((s) =>
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalSize = sessions.reduce((acc, s) => acc + s.totalSize, 0);
  const expiredCount = sessions.filter(
    (s) => getDaysOld(s.createdAt) >= autoDeleteDays
  ).length;

  // Selection
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSessions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSessions.map((s) => s.id)));
    }
  };

  // Delete sessions
  const handleDelete = async (ids: string[]) => {
    if (ids.length === 0) return;
    const confirmMsg =
      ids.length === 1
        ? `Yakin ingin menghapus sesi "${ids[0].substring(0, 8)}..."?`
        : `Yakin ingin menghapus ${ids.length} sesi foto?`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingIds(new Set(ids));
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionIds: ids }),
      });
      const data = await res.json();

      if (data.errors && data.errors.length > 0) {
        console.error('Some deletions failed:', data.errors);
        alert(`${data.deletedCount}/${data.totalRequested} sesi dihapus. ${data.errors.length} gagal.`);
      } else if (data.deletedCount > 0) {
        // Show brief success feedback
      }

      // Always re-fetch from server to stay in sync with actual storage
      setSelectedIds(new Set());
      await fetchSessions();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus sesi.');
    } finally {
      setDeletingIds(new Set());
    }
  };

  // Auto cleanup
  const handleAutoCleanup = async () => {
    if (
      !window.confirm(
        `Ini akan menghapus semua sesi foto yang lebih dari ${autoDeleteDays} hari. Lanjutkan?`
      )
    )
      return;

    setIsCleaningUp(true);
    setCleanupResult(null);
    try {
      const res = await fetch('/api/admin/auto-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: autoDeleteDays }),
      });
      const data = await res.json();

      if (data.success) {
        setCleanupResult(
          `✅ Berhasil menghapus ${data.deletedCount} sesi (cutoff: ${new Date(data.cutoffDate).toLocaleDateString('id-ID')})`
        );
        // Refresh the list
        await fetchSessions();
      } else {
        setCleanupResult(`❌ Gagal: ${data.error}`);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      setCleanupResult('❌ Terjadi error saat cleanup.');
    } finally {
      setIsCleaningUp(false);
    }
  };

  // Share link
  const handleShareLink = async (session: Session) => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      session: session.id,
      bursts: String(session.burstCount),
      lives: String(session.liveCount),
    });
    const downloadUrl = `${baseUrl}/download?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(downloadUrl);
      setCopiedId(session.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = downloadUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(session.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Manajemen Download
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola semua sesi foto pelanggan Anda.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCleanupPanel(!showCleanupPanel)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${
              showCleanupPanel
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Timer className="w-5 h-5" />
            Auto Delete
          </button>
          <button
            onClick={fetchSessions}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {sessions.length}
              </p>
              <p className="text-sm text-slate-500">Total Sesi</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {formatBytes(totalSize)}
              </p>
              <p className="text-sm text-slate-500">Total Storage</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${expiredCount > 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
              {expiredCount > 0 ? (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              ) : (
                <Sparkles className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {expiredCount}
              </p>
              <p className="text-sm text-slate-500">
                Expired (&gt;{autoDeleteDays} hari)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Delete Panel */}
      {showCleanupPanel && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-500" />
                Auto Delete
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Hapus otomatis semua sesi foto yang lebih tua dari batas hari yang ditentukan.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                Hapus setelah
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={autoDeleteDays}
                onChange={(e) =>
                  setAutoDeleteDays(Math.max(1, parseInt(e.target.value) || 30))
                }
                className="w-20 px-3 py-2.5 rounded-xl border border-amber-300 bg-white text-slate-800 font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="text-sm font-semibold text-slate-700">hari</span>
              <button
                onClick={handleAutoCleanup}
                disabled={isCleaningUp}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/20 disabled:opacity-70 whitespace-nowrap"
              >
                {isCleaningUp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isCleaningUp ? 'Menghapus...' : 'Jalankan Cleanup'}
              </button>
            </div>
          </div>
          {cleanupResult && (
            <div className="mt-4 px-4 py-3 bg-white rounded-xl border border-amber-200 text-sm font-medium text-slate-700">
              {cleanupResult}
            </div>
          )}
        </div>
      )}

      {/* Search & Bulk Actions */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Session ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
        {selectedIds.size > 0 && (
          <button
            onClick={() => handleDelete(Array.from(selectedIds))}
            className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
          >
            <Trash2 className="w-5 h-5" />
            Hapus {selectedIds.size} Terpilih
          </button>
        )}
      </div>

      {/* Sessions Table */}
      {loading && sessions.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            {searchQuery
              ? 'Tidak ada sesi ditemukan'
              : 'Belum ada sesi foto'}
          </h3>
          <p className="text-slate-500">
            {searchQuery
              ? `Tidak ada sesi dengan ID "${searchQuery}"`
              : 'Sesi foto pelanggan akan muncul di sini.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[48px_80px_1fr_120px_100px_120px_120px_140px] gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-500">
            <div className="flex items-center justify-center">
              <button onClick={toggleSelectAll} className="p-0.5">
                {selectedIds.size === filteredSessions.length &&
                filteredSessions.length > 0 ? (
                  <CheckSquare className="w-5 h-5 text-pink-500" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300" />
                )}
              </button>
            </div>
            <div>Foto</div>
            <div>Session ID</div>
            <div>File</div>
            <div>Ukuran</div>
            <div>Tanggal</div>
            <div>Status</div>
            <div className="text-right">Aksi</div>
          </div>

          {/* Table Rows */}
          {filteredSessions.map((session) => {
            const isExpired = getDaysOld(session.createdAt) >= autoDeleteDays;
            const isSelected = selectedIds.has(session.id);
            const isDeleting = deletingIds.has(session.id);
            const isCopied = copiedId === session.id;

            return (
              <div
                key={session.id}
                className={`grid grid-cols-1 md:grid-cols-[48px_80px_1fr_120px_100px_120px_120px_140px] gap-2 md:gap-2 px-5 py-4 border-b border-slate-100 last:border-b-0 items-center transition-colors ${
                  isSelected
                    ? 'bg-pink-50/50'
                    : isDeleting
                    ? 'bg-red-50/50 opacity-60'
                    : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Select */}
                <div className="hidden md:flex items-center justify-center">
                  <button onClick={() => toggleSelect(session.id)} className="p-0.5">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-pink-500" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="hidden md:block">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    {session.photoUrl ? (
                      <img
                        src={session.photoUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile: Photo + Info Row */}
                <div className="flex md:hidden items-center gap-3 mb-2">
                  <button onClick={() => toggleSelect(session.id)} className="p-0.5">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-pink-500" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                    {session.photoUrl ? (
                      <img
                        src={session.photoUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-semibold text-slate-800 truncate">
                      {session.id.substring(0, 12)}...
                    </p>
                    <p className="text-xs text-slate-500">{timeAgo(session.createdAt)}</p>
                  </div>
                  {isExpired && (
                    <span className="px-2 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-700">
                      Expired
                    </span>
                  )}
                </div>

                {/* Session ID - Desktop */}
                <div className="hidden md:block min-w-0">
                  <p
                    className="font-mono text-sm font-semibold text-slate-800 truncate"
                    title={session.id}
                  >
                    {session.id.substring(0, 16)}...
                  </p>
                </div>

                {/* File Count */}
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex flex-col text-sm text-slate-600">
                    <span className="font-medium">{session.fileCount} file</span>
                    <span className="text-xs text-slate-400">
                      {session.burstCount > 0 && `${session.burstCount} burst`}
                      {session.burstCount > 0 && session.liveCount > 0 && ' · '}
                      {session.liveCount > 0 && `${session.liveCount} live`}
                    </span>
                  </div>
                </div>

                {/* Size */}
                <div className="hidden md:block text-sm font-medium text-slate-600">
                  {formatBytes(session.totalSize)}
                </div>

                {/* Date */}
                <div className="hidden md:flex flex-col">
                  <span className="text-sm text-slate-700 font-medium">
                    {timeAgo(session.createdAt)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDate(session.createdAt)}
                  </span>
                </div>

                {/* Status */}
                <div className="hidden md:block">
                  {isExpired ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-700">
                      <Clock className="w-3 h-3" />
                      Expired
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-700">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleShareLink(session)}
                    title="Copy Link Download"
                    className={`p-2.5 rounded-xl transition-all ${
                      isCopied
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-100 text-slate-500 hover:bg-sky-100 hover:text-sky-600'
                    }`}
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Link2 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete([session.id])}
                    disabled={isDeleting}
                    title="Hapus Sesi"
                    className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 transition-all disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Mobile: Extra Info */}
                <div className="flex md:hidden items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span>{session.fileCount} file · {formatBytes(session.totalSize)}</span>
                  <span>
                    {session.burstCount > 0 && `${session.burstCount} burst`}
                    {session.burstCount > 0 && session.liveCount > 0 && ' · '}
                    {session.liveCount > 0 && `${session.liveCount} live`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      {filteredSessions.length > 0 && (
        <div className="mt-4 text-center text-sm text-slate-400">
          Menampilkan {filteredSessions.length} dari {sessions.length} sesi
        </div>
      )}
    </div>
  );
}
