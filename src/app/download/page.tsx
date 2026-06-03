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

  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'photo' | 'gif' | 'live' | 'raw'>('photo');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Construct photo URL from session
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imageUrl = session
    ? `${supabaseUrl}/storage/v1/object/public/photos/${session}/photo.png`
    : legacyUrl;

  // No need to generate GIF client-side anymore! 
  // We use the MP4 files directly from Supabase.

  if (!isClient) return null;

  if (!imageUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 p-6">
        <p className="text-slate-500 font-medium">Tidak ada foto yang ditemukan.</p>
      </div>
    );
  }

  // Determine current display URL based on active tab
  const currentGifUrl = session ? `${supabaseUrl}/storage/v1/object/public/photos/${session}/burst.mp4` : legacyGif;
  const currentLiveUrl = session ? `${supabaseUrl}/storage/v1/object/public/photos/${session}/live.mp4` : legacyLive;
  const hasGif = session ? burstsCount > 0 : !!legacyGif;
  const hasLive = session ? livesCount > 0 : !!legacyLive;
  const hasRaw = session ? burstsCount > 0 : false;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      if (activeTab === 'raw') {
        // Download multiple raw photos
        for (let i = 0; i < burstsCount; i++) {
          const rawUrl = `${supabaseUrl}/storage/v1/object/public/photos/${session}/burst_${i}.png`;
          const response = await fetch(rawUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Mémoire_Raw_${i + 1}_${new Date().getTime()}.png`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          await new Promise(r => setTimeout(r, 400)); // delay to prevent browser block
        }
        return;
      }

      let targetUrl: string | null = null;
      let ext = 'png';

      if (activeTab === 'live') {
        targetUrl = currentLiveUrl;
        ext = session ? 'mp4' : 'gif'; // legacy uses gif, new uses mp4
      } else if (activeTab === 'gif') {
        targetUrl = currentGifUrl;
        ext = session ? 'mp4' : 'gif';
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
      a.download = `Mémoire_${new Date().getTime()}.${ext}`;
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
          title: 'Mémoire',
          text: 'Lihat foto saya dari Mémoire!',
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

  const isCurrentTabLoading = false; // Video tags will handle their own loading automatically

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center text-primary px-5 py-12 relative overflow-hidden font-sans">
      <div className="z-10 w-full max-w-lg flex flex-col items-center animate-fade-in-up">
        {/* Minimal header */}
        <div className="mb-12 text-center flex flex-col items-center gap-6">
          <img
            src="/images/memoire-logo.png"
            alt="Mémoire Logo"
            className="h-10 md:h-12 w-auto object-contain mix-blend-multiply opacity-90"
          />
          <h1 className="font-display-mobile md:font-display-md text-display-mobile md:text-display-md text-primary tracking-tight leading-tight italic">
            Your memories, preserved.
          </h1>
        </div>

        {/* Tab switcher — minimalist border style */}
        {(hasGif || hasLive) && (
          <div className="flex w-full border-b border-outline-variant mb-10">
            <button
              onClick={() => setActiveTab('photo')}
              className={`flex-1 pb-4 text-xs font-semibold uppercase tracking-widest transition-colors ${activeTab === 'photo'
                ? 'border-b-2 border-primary text-primary'
                : 'text-secondary hover:text-primary'
                }`}
            >
              Photo
            </button>
            {hasGif && (
              <button
                onClick={() => setActiveTab('gif')}
                className={`flex-1 pb-4 text-xs font-semibold uppercase tracking-widest transition-colors ${activeTab === 'gif'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-secondary hover:text-primary'
                  }`}
              >
                GIF
              </button>
            )}
            {hasLive && (
              <button
                onClick={() => setActiveTab('live')}
                className={`flex-1 pb-4 text-xs font-semibold uppercase tracking-widest transition-colors ${activeTab === 'live'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-secondary hover:text-primary'
                  }`}
              >
                Live Photo
              </button>
            )}
            {hasRaw && (
              <button
                onClick={() => setActiveTab('raw')}
                className={`flex-1 pb-4 text-xs font-semibold uppercase tracking-widest transition-colors ${activeTab === 'raw'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-secondary hover:text-primary'
                  }`}
              >
                Raw
              </button>
            )}
          </div>
        )}

        {/* Minimalist photo frame */}
        <div className="relative w-full mb-12">
          <div className="relative aspect-[3/4] w-full bg-surface-container border border-outline-variant shadow-sm overflow-hidden p-2 md:p-4">
            <div className="relative w-full h-full bg-white border border-outline-variant/50">
              {isCurrentTabLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-lowest">
                  <div className="w-8 h-8 border-[2px] border-outline-variant border-t-primary rounded-full animate-spin mb-4" />
                  <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                    Crafting {activeTab === 'live' ? 'Live Photo' : 'GIF'}...
                  </p>
                </div>
              ) : activeTab === 'photo' ? (
                <Image
                  src={imageUrl}
                  alt="Mémoire Result"
                  fill
                  sizes="100vw"
                  className="object-contain p-2"
                  priority
                />
              ) : activeTab === 'gif' && currentGifUrl ? (
                session ? (
                  <video
                    src={currentGifUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <img
                    src={currentGifUrl}
                    alt="Mémoire GIF Raw"
                    className="w-full h-full object-contain p-2"
                  />
                )
              ) : activeTab === 'live' && currentLiveUrl ? (
                session ? (
                  <video
                    src={currentLiveUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <img
                    src={currentLiveUrl}
                    alt="Mémoire Live Photo"
                    className="w-full h-full object-contain p-2"
                  />
                )
              ) : activeTab === 'raw' && hasRaw ? (
                <div className="absolute inset-0 overflow-y-auto p-2 grid grid-cols-2 gap-2 bg-surface custom-scrollbar">
                  {Array.from({ length: burstsCount }).map((_, i) => (
                    <img
                      key={i}
                      src={`${supabaseUrl}/storage/v1/object/public/photos/${session}/burst_${i}.png`}
                      alt={`Raw ${i + 1}`}
                      className="w-full aspect-[3/4] object-cover border border-outline-variant/30 shadow-sm"
                      loading="lazy"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-container-lowest">
                  <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Not Available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons — editorial style */}
        <div className="w-full flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleDownload}
            disabled={isDownloading || isCurrentTabLoading}
            className="flex-1 py-4 px-6 bg-primary text-on-primary font-label-lg text-label-lg uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isDownloading ? (
              <svg className="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="material-symbols-outlined font-light">download</span>
            )}
            {isDownloading ? 'Saving...' : `Save ${activeTab === 'live' ? 'Live Photo' : activeTab === 'gif' ? 'GIF' : activeTab === 'raw' ? 'Raw Photos' : 'Photo'}`}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 py-4 px-6 border border-primary text-primary bg-transparent font-label-lg text-label-lg uppercase tracking-widest rounded-none hover:bg-surface-variant transition-colors flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined font-light">share</span>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 gap-6">
        <img
          src="/images/memoire-logo.png"
          alt="Mémoire Logo"
          className="h-8 w-auto object-contain mix-blend-multiply opacity-50 animate-pulse"
        />
        <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest animate-pulse">Loading experience...</p>
      </div>
    }>
      <DownloadContent />
    </Suspense>
  );
}
