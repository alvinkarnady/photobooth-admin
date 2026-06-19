'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
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

  // MP4 availability state
  const [burstMp4Available, setBurstMp4Available] = useState<boolean | null>(null);
  const [liveMp4Available, setLiveMp4Available] = useState<boolean | null>(null);

  // Slideshow state for GIF (raw photos cycling)
  const [gifFrameIndex, setGifFrameIndex] = useState(0);

  // Slideshow state for Live Photo (live frames cycling)
  const [liveFrameIndex, setLiveFrameIndex] = useState(0);

  // Selected raw photos
  const [selectedRaws, setSelectedRaws] = useState<number[]>([]);

  const gifIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Construct photo URL from session — using Cloudflare R2
  const r2BaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-39bcbb6191eb4a958c8210dc87371845.r2.dev';
  const imageUrl = session
    ? `${r2BaseUrl}/photos/${session}/photo.png`
    : legacyUrl;

  const burstMp4Url = session ? `${r2BaseUrl}/photos/${session}/burst.mp4` : null;
  const liveMp4Url = session ? `${r2BaseUrl}/photos/${session}/live.mp4` : null;

  const hasGif = session ? burstsCount > 0 : !!legacyGif;
  const hasLive = session ? livesCount > 0 : !!legacyLive;
  const hasRaw = session ? burstsCount > 0 : false;

  // Check if MP4 files exist on server
  useEffect(() => {
    if (!session) return;

    if (burstsCount > 0 && burstMp4Url) {
      fetch(burstMp4Url, { method: 'HEAD' })
        .then(res => setBurstMp4Available(res.ok))
        .catch(() => setBurstMp4Available(false));
    }

    if (livesCount > 0 && liveMp4Url) {
      fetch(liveMp4Url, { method: 'HEAD' })
        .then(res => setLiveMp4Available(res.ok))
        .catch(() => setLiveMp4Available(false));
    }
  }, [session, burstsCount, livesCount, burstMp4Url, liveMp4Url]);

  // GIF slideshow: cycle through raw photos at ~1 photo/sec
  useEffect(() => {
    if (activeTab === 'gif' && burstsCount > 1 && !burstMp4Available) {
      gifIntervalRef.current = setInterval(() => {
        setGifFrameIndex(prev => (prev + 1) % burstsCount);
      }, 1000); // 1 second per photo
    }
    return () => {
      if (gifIntervalRef.current) clearInterval(gifIntervalRef.current);
    };
  }, [activeTab, burstsCount, burstMp4Available]);

  // Live Photo slideshow: cycle through live frames at liveDelay ms
  useEffect(() => {
    if (activeTab === 'live' && livesCount > 1 && !liveMp4Available) {
      liveIntervalRef.current = setInterval(() => {
        setLiveFrameIndex(prev => (prev + 1) % livesCount);
      }, liveDelay);
    }
    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    };
  }, [activeTab, livesCount, liveDelay, liveMp4Available]);

  if (!isClient) return null;

  if (!imageUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 p-6">
        <p className="text-slate-500 font-medium">Tidak ada foto yang ditemukan.</p>
      </div>
    );
  }

  // Build URLs for individual frames
  const getBurstFrameUrl = (i: number) =>
    `${r2BaseUrl}/photos/${session}/burst_${i}.png`;
  const getLiveFrameUrl = (i: number) =>
    `${r2BaseUrl}/photos/${session}/live_${i}.png`;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      if (activeTab === 'raw') {
        if (selectedRaws.length === 0) {
          alert('Pilih setidaknya satu foto raw untuk diunduh.');
          setIsDownloading(false);
          return;
        }
        // Download selected raw photos
        for (const i of selectedRaws) {
          const rawUrl = getBurstFrameUrl(i);
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
          await new Promise(r => setTimeout(r, 400));
        }
        return;
      }

      let targetUrl: string | null = null;
      let ext = 'png';

      if (activeTab === 'live') {
        if (liveMp4Available && liveMp4Url) {
          targetUrl = liveMp4Url;
          ext = 'mp4';
        } else if (legacyLive) {
          targetUrl = legacyLive;
          ext = 'gif';
        } else {
          // Fallback: download individual live frames as zip would be complex,
          // so download the current visible frame
          targetUrl = getLiveFrameUrl(liveFrameIndex);
          ext = 'png';
        }
      } else if (activeTab === 'gif') {
        if (burstMp4Available && burstMp4Url) {
          targetUrl = burstMp4Url;
          ext = 'mp4';
        } else if (legacyGif) {
          targetUrl = legacyGif;
          ext = 'gif';
        } else {
          alert('Video MP4 tidak tersedia untuk sesi ini.');
          setIsDownloading(false);
          return;
        }
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

  // Render the preview content for the active tab
  const renderPreview = () => {
    if (activeTab === 'photo') {
      return (
        <Image
          src={imageUrl}
          alt="Mémoire Result"
          fill
          sizes="100vw"
          className="object-contain p-2"
          priority
        />
      );
    }

    if (activeTab === 'gif' && hasGif) {
      // If MP4 available, show video
      if (burstMp4Available && burstMp4Url) {
        return (
          <video
            src={burstMp4Url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain p-2"
          />
        );
      }
      // Legacy GIF
      if (legacyGif) {
        return (
          <img
            src={legacyGif}
            alt="Mémoire GIF"
            className="w-full h-full object-contain p-2"
          />
        );
      }
      // Fallback: PNG slideshow of raw photos
      if (session && burstsCount > 0) {
        return (
          <img
            key={gifFrameIndex}
            src={getBurstFrameUrl(gifFrameIndex)}
            alt={`Raw photo ${gifFrameIndex + 1}`}
            className="w-full h-full object-contain p-2 transition-opacity duration-200"
          />
        );
      }
    }

    if (activeTab === 'live' && hasLive) {
      // If MP4 available, show video
      if (liveMp4Available && liveMp4Url) {
        return (
          <video
            src={liveMp4Url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain p-2"
          />
        );
      }
      // Legacy GIF
      if (legacyLive) {
        return (
          <img
            src={legacyLive}
            alt="Mémoire Live Photo"
            className="w-full h-full object-contain p-2"
          />
        );
      }
      // Fallback: PNG slideshow of live frames
      if (session && livesCount > 0) {
        return (
          <img
            key={liveFrameIndex}
            src={getLiveFrameUrl(liveFrameIndex)}
            alt={`Live frame ${liveFrameIndex + 1}`}
            className="w-full h-full object-contain p-2"
          />
        );
      }
    }

    if (activeTab === 'raw' && hasRaw) {
      return (
        <div className="absolute inset-0 flex flex-col bg-surface">
          <div className="p-3 text-center border-b border-outline-variant/30">
            <p className="text-xs text-secondary mb-2">Pilih foto yang ingin diunduh</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setSelectedRaws(Array.from({ length: burstsCount }, (_, i) => i))}
                className="text-xs font-medium text-primary hover:underline"
              >
                Pilih Semua
              </button>
              <button 
                onClick={() => setSelectedRaws([])}
                className="text-xs font-medium text-secondary hover:underline"
              >
                Batal Pilih
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2 custom-scrollbar">
            {Array.from({ length: burstsCount }).map((_, i) => {
              const isSelected = selectedRaws.includes(i);
              return (
                <div 
                  key={i} 
                  className="relative cursor-pointer group"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedRaws(prev => prev.filter(id => id !== i));
                    } else {
                      setSelectedRaws(prev => [...prev, i]);
                    }
                  }}
                >
                  <img
                    src={getBurstFrameUrl(i)}
                    alt={`Raw ${i + 1}`}
                    className={`w-full aspect-[3/4] object-cover transition-all ${isSelected ? 'border-2 border-primary shadow-md' : 'border border-outline-variant/30 opacity-80 hover:opacity-100'}`}
                    loading="lazy"
                  />
                  <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-on-primary' : 'bg-surface/50 border-outline text-transparent'}`}>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-container-lowest">
        <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Not Available</p>
      </div>
    );
  };

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

        {/* Tab switcher */}
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

        {/* Photo frame */}
        <div className="relative w-full mb-12">
          <div className="relative aspect-[3/4] w-full bg-surface-container border border-outline-variant shadow-sm overflow-hidden p-2 md:p-4">
            <div className="relative w-full h-full bg-white border border-outline-variant/50">
              {renderPreview()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleDownload}
            disabled={isDownloading || (activeTab === 'raw' && selectedRaws.length === 0)}
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
            {isDownloading 
              ? 'Saving...' 
              : activeTab === 'raw'
                ? (selectedRaws.length > 0 ? `Save ${selectedRaws.length} Photos` : 'Select Photos')
                : `Save ${activeTab === 'live' ? 'Live Photo' : activeTab === 'gif' ? 'GIF' : 'Photo'}`}
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
