'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

function DownloadContent() {
  const searchParams = useSearchParams();

  // New session-based params
  const session = searchParams.get('session');
  const burstsCount = parseInt(searchParams.get('bursts') || '0');
  const livesCount = parseInt(searchParams.get('lives') || '0');
  const liveDelay = parseInt(searchParams.get('liveDelay') || '150');

  // Legacy support: direct URL params
  const legacyUrl = searchParams.get('url');
  const legacyGif = searchParams.get('gif');
  const legacyLive = searchParams.get('live');

  const [isDownloading, setIsDownloading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'photo' | 'gif' | 'live'>('photo');
  const [gifBlobUrl, setGifBlobUrl] = useState<string | null>(null);
  const [liveBlobUrl, setLiveBlobUrl] = useState<string | null>(null);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [isGeneratingLive, setIsGeneratingLive] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Construct photo URL from session
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imageUrl = session
    ? `${supabaseUrl}/storage/v1/object/public/photos/${session}/photo.png`
    : legacyUrl;

  // Generate GIF on-demand when user switches to GIF/Live tab
  const generateGif = useCallback(async (type: 'burst' | 'live') => {
    if (!session) return;

    const count = type === 'burst' ? burstsCount : livesCount;
    if (count === 0) return;

    const setter = type === 'burst' ? setIsGeneratingGif : setIsGeneratingLive;
    const blobSetter = type === 'burst' ? setGifBlobUrl : setLiveBlobUrl;
    const delay = type === 'burst' ? 400 : liveDelay;

    setter(true);
    try {
      const apiUrl = `/api/generate-gif?session=${session}&type=${type}&count=${count}&width=720&delay=${delay}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('GIF generation failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      blobSetter(url);
    } catch (error) {
      console.error('Error generating GIF:', error);
      alert('Gagal membuat GIF. Silakan coba lagi.');
    } finally {
      setter(false);
    }
  }, [session, burstsCount, livesCount]);

  // Trigger GIF generation when tab changes
  useEffect(() => {
    if (!session) return; // Legacy mode, don't auto-generate

    if (activeTab === 'gif' && !gifBlobUrl && !isGeneratingGif && burstsCount > 0) {
      generateGif('burst');
    }
    if (activeTab === 'live' && !liveBlobUrl && !isGeneratingLive && livesCount > 0) {
      generateGif('live');
    }
  }, [activeTab, session, gifBlobUrl, liveBlobUrl, isGeneratingGif, isGeneratingLive, burstsCount, livesCount, generateGif]);

  if (!isClient) return null;

  if (!imageUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 p-6">
        <p className="text-slate-500 font-medium">Tidak ada foto yang ditemukan.</p>
      </div>
    );
  }

  // Determine current display URL based on active tab
  const currentGifUrl = session ? gifBlobUrl : legacyGif;
  const currentLiveUrl = session ? liveBlobUrl : legacyLive;
  const hasGif = session ? burstsCount > 0 : !!legacyGif;
  const hasLive = session ? livesCount > 0 : !!legacyLive;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      let targetUrl: string | null = null;
      let ext = 'png';

      if (activeTab === 'live') {
        targetUrl = currentLiveUrl;
        ext = 'gif';
      } else if (activeTab === 'gif') {
        targetUrl = currentGifUrl;
        ext = 'gif';
      } else {
        targetUrl = imageUrl;
        ext = 'png';
      }

      if (!targetUrl) {
        alert('File belum siap. Tunggu sebentar.');
        return;
      }

      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Piawai_Photobooth_${new Date().getTime()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Gagal mengunduh ${activeTab.toUpperCase()}. Silakan coba lagi.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Piawai Photobooth',
          text: 'Lihat foto saya dari Piawai Photobooth!',
          url: imageUrl,
        });
      } else {
        if (imageUrl) await navigator.clipboard.writeText(imageUrl);
        alert('Tautan berhasil disalin ke clipboard!');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const isCurrentTabLoading =
    (activeTab === 'gif' && isGeneratingGif) ||
    (activeTab === 'live' && isGeneratingLive);

  return (
    <div className="min-h-screen bg-[#f8f6f3] flex flex-col items-center text-slate-800 px-5 py-10 relative overflow-hidden font-sans">
      {/* Subtle ambient background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.06] blur-[80px] scale-125 pointer-events-none"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
      />

      <div className="z-10 w-full max-w-sm flex flex-col items-center animate-fade-in-up">
        {/* Minimal header */}
        <div className="mb-8 text-center mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">CubaPoto</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Foto kamu sudah siap ✨
          </h1>
        </div>

        {/* Tab switcher — pill style */}
        {(hasGif || hasLive) && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('photo')}
              className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${activeTab === 'photo'
                ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20'
                : 'bg-white/70 text-slate-500 hover:bg-white hover:text-slate-700'
                }`}
            >
              Foto
            </button>
            {hasGif && (
              <button
                onClick={() => setActiveTab('gif')}
                className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${activeTab === 'gif'
                  ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20'
                  : 'bg-white/70 text-slate-500 hover:bg-white hover:text-slate-700'
                  }`}
              >
                GIF
              </button>
            )}
            {hasLive && (
              <button
                onClick={() => setActiveTab('live')}
                className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${activeTab === 'live'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-white/70 text-slate-500 hover:bg-white hover:text-slate-700'
                  }`}
              >
                Live Photo
              </button>
            )}
          </div>
        )}

        {/* Floating photo frame — no container, no border */}
        <div className="relative w-full mb-8 group">
          <div className="relative aspect-[3/4] w-full overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.2)] group-hover:-translate-y-1">
            {isCurrentTabLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="w-12 h-12 border-[3px] border-slate-200 border-t-slate-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-600 font-semibold text-sm">
                  Membuat {activeTab === 'live' ? 'Live Photo' : 'GIF'}...
                </p>
                <p className="text-slate-400 text-xs mt-1.5">Tunggu sebentar ya</p>
              </div>
            ) : activeTab === 'photo' ? (
              <Image
                src={imageUrl}
                alt="Photobooth Result"
                fill
                className="object-contain"
                priority
              />
            ) : activeTab === 'gif' && currentGifUrl ? (
              <img
                src={currentGifUrl}
                alt="Photobooth GIF Raw"
                className="w-full h-full object-contain bg-white"
              />
            ) : activeTab === 'live' && currentLiveUrl ? (
              <img
                src={currentLiveUrl}
                alt="Photobooth Live Photo"
                className="w-full h-full object-contain bg-white"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                <p className="text-slate-400 text-sm">Tidak tersedia</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons — clean & minimal */}
        <div className="w-full flex flex-col gap-3 mb-8">
          <button
            onClick={handleDownload}
            disabled={isDownloading || isCurrentTabLoading}
            className="w-full py-3.5 px-6 bg-slate-800 text-white font-semibold text-sm rounded-2xl flex items-center justify-center gap-2.5 hover:bg-slate-900 transition-all duration-300 shadow-lg shadow-slate-800/20 active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100"
          >
            {isDownloading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            )}
            {isDownloading ? 'Menyimpan...' : `Simpan ${activeTab === 'live' ? 'Live Photo' : activeTab === 'gif' ? 'Mentahan GIF' : 'Foto'}`}
          </button>

          <button
            onClick={handleShare}
            className="w-full py-3.5 px-6 bg-white/80 backdrop-blur-sm text-slate-600 font-semibold text-sm rounded-2xl flex items-center justify-center gap-2.5 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.97]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Bagikan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-pink-500 font-bold animate-pulse text-xl">Menyiapkan fotomu...</p>
      </div>
    }>
      <DownloadContent />
    </Suspense>
  );
}
