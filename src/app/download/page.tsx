'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

type AssetStatus = 'idle' | 'loading' | 'ready' | 'error';

type CacheState = {
  photoUrl?: string;
  photoStatus: AssetStatus;
  gifMp4Url?: string;
  gifMp4Status: AssetStatus;
  gifFrameUrls: string[];
  gifFramesStatus: AssetStatus;
  liveMp4Url?: string;
  liveMp4Status: AssetStatus;
  liveFrameUrls: string[];
  liveFramesStatus: AssetStatus;
};

function DownloadContent() {
  const searchParams = useSearchParams();

  // New session-based params
  const session = searchParams.get('session');
  const gifsCount = parseInt(searchParams.get('gifs') || '0');
  const livesCount = parseInt(searchParams.get('lives') || '0');
  const liveDelay = parseInt(searchParams.get('liveDelay') || '150');

  // Legacy support: direct URL params
  const legacyUrl = searchParams.get('url');
  const legacyGif = searchParams.get('gif');
  const legacyLive = searchParams.get('live');

  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'photo' | 'gif' | 'live' | 'raw'>('photo');
  const [isDownloading, setIsDownloading] = useState(false);

  // Caching State
  const [cache, setCache] = useState<CacheState>({
    photoStatus: 'idle',
    gifMp4Status: 'idle',
    gifFramesStatus: 'idle',
    liveMp4Status: 'idle',
    liveFramesStatus: 'idle',
    gifFrameUrls: [],
    liveFrameUrls: []
  });

  // Slideshow state for GIF (raw photos cycling)
  const [gifFrameIndex, setGifFrameIndex] = useState(0);

  // Slideshow state for Live Photo (live frames cycling)
  const [liveFrameIndex, setLiveFrameIndex] = useState(0);

  const gifIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const r2BaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-39bcbb6191eb4a958c8210dc87371845.r2.dev';

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Eager prefetch and cache
  useEffect(() => {
    if (!session && !legacyUrl) return;

    let mounted = true;

    const fetchAsObjectURL = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Not found: ${url}`);
      const blob = await res.blob();
      return window.URL.createObjectURL(blob);
    };

    const loadAll = async () => {
      // Photo
      if (session || legacyUrl) {
        setCache(prev => ({ ...prev, photoStatus: 'loading' }));
        try {
          const url = session ? `${r2BaseUrl}/photos/${session}/photo.png` : legacyUrl!;
          const objUrl = await fetchAsObjectURL(url);
          if (mounted) setCache(prev => ({ ...prev, photoUrl: objUrl, photoStatus: 'ready' }));
        } catch {
          if (mounted) setCache(prev => ({ ...prev, photoStatus: 'error' }));
        }
      }

      // GIF MP4 & Frames
      if (session && gifsCount > 0) {
        setCache(prev => ({ ...prev, gifMp4Status: 'loading' }));
        try {
          const objUrl = await fetchAsObjectURL(`${r2BaseUrl}/photos/${session}/gif.mp4`);
          if (mounted) setCache(prev => ({ ...prev, gifMp4Url: objUrl, gifMp4Status: 'ready' }));
        } catch {
          if (mounted) setCache(prev => ({ ...prev, gifMp4Status: 'error' }));
        }

        // Always fetch raw frames for the Raw tab (and as fallback for GIF tab)
        setCache(prev => ({ ...prev, gifFramesStatus: 'loading' }));
        try {
          const promises = Array.from({ length: gifsCount }).map((_, i) => 
            fetchAsObjectURL(`${r2BaseUrl}/photos/${session}/burst_${i}.png`)
          );
          const urls = await Promise.all(promises);
          if (mounted) setCache(prev => ({ ...prev, gifFrameUrls: urls, gifFramesStatus: 'ready' }));
        } catch {
          if (mounted) setCache(prev => ({ ...prev, gifFramesStatus: 'error' }));
        }
      }

      // Live MP4 & Frames
      if (session && livesCount > 0) {
        setCache(prev => ({ ...prev, liveMp4Status: 'loading' }));
        try {
          const objUrl = await fetchAsObjectURL(`${r2BaseUrl}/photos/${session}/live.mp4`);
          if (mounted) setCache(prev => ({ ...prev, liveMp4Url: objUrl, liveMp4Status: 'ready' }));
        } catch {
          if (mounted) setCache(prev => ({ ...prev, liveMp4Status: 'error' }));
        }

        // Always fetch live frames as fallback for Live Photo
        setCache(prev => ({ ...prev, liveFramesStatus: 'loading' }));
        try {
          const promises = Array.from({ length: livesCount }).map((_, i) => 
            fetchAsObjectURL(`${r2BaseUrl}/photos/${session}/live_${i}.png`)
          );
          const urls = await Promise.all(promises);
          if (mounted) setCache(prev => ({ ...prev, liveFrameUrls: urls, liveFramesStatus: 'ready' }));
        } catch {
          if (mounted) setCache(prev => ({ ...prev, liveFramesStatus: 'error' }));
        }
      }
    };

    loadAll();

    return () => {
      mounted = false;
    };
  }, [session, legacyUrl, gifsCount, livesCount, r2BaseUrl]);

  const hasGif = session ? gifsCount > 0 : !!legacyGif;
  const hasLive = session ? livesCount > 0 : !!legacyLive;
  const hasRaw = session ? gifsCount > 0 : false;

  // GIF slideshow: cycle through raw photos at ~1 photo/sec
  useEffect(() => {
    if (activeTab === 'gif' && gifsCount > 1 && cache.gifMp4Status !== 'ready') {
      gifIntervalRef.current = setInterval(() => {
        setGifFrameIndex(prev => (prev + 1) % gifsCount);
      }, 1000); // 1 second per photo
    }
    return () => {
      if (gifIntervalRef.current) clearInterval(gifIntervalRef.current);
    };
  }, [activeTab, gifsCount, cache.gifMp4Status]);

  // Live Photo slideshow: cycle through live frames at liveDelay ms
  useEffect(() => {
    if (activeTab === 'live' && livesCount > 1 && cache.liveMp4Status !== 'ready') {
      liveIntervalRef.current = setInterval(() => {
        setLiveFrameIndex(prev => (prev + 1) % livesCount);
      }, liveDelay);
    }
    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    };
  }, [activeTab, livesCount, liveDelay, cache.liveMp4Status]);

  if (!isClient) return null;

  if (!session && !legacyUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 p-6">
        <p className="text-slate-500 font-medium">Tidak ada foto yang ditemukan.</p>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      if (activeTab === 'raw') {
        if (cache.gifFramesStatus !== 'ready' || cache.gifFrameUrls.length === 0) {
          alert('Foto raw belum siap. Tunggu sebentar.');
          setIsDownloading(false);
          return;
        }

        // Dynamically import jszip to keep initial bundle size small
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        // Fetch blobs from the pre-cached Object URLs
        const fetchPromises = cache.gifFrameUrls.map(async (url, i) => {
          const res = await fetch(url);
          const blob = await res.blob();
          zip.file(`Mémoire_Raw_${i + 1}.png`, blob);
        });

        await Promise.all(fetchPromises);

        const content = await zip.generateAsync({ type: 'blob' });
        const zipUrl = window.URL.createObjectURL(content);

        const a = document.createElement('a');
        a.href = zipUrl;
        a.download = `Mémoire_Raw_${new Date().getTime()}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(zipUrl);
        document.body.removeChild(a);

        setIsDownloading(false);
        return;
      }

      let targetUrl: string | null = null;
      let ext = 'png';

      if (activeTab === 'live') {
        if (cache.liveMp4Status === 'ready' && cache.liveMp4Url) {
          targetUrl = cache.liveMp4Url;
          ext = 'mp4';
        } else if (legacyLive) {
          targetUrl = legacyLive;
          ext = 'gif';
        } else if (cache.liveFramesStatus === 'ready' && cache.liveFrameUrls.length > 0) {
          targetUrl = cache.liveFrameUrls[liveFrameIndex];
          ext = 'png';
        }
      } else if (activeTab === 'gif') {
        if (cache.gifMp4Status === 'ready' && cache.gifMp4Url) {
          targetUrl = cache.gifMp4Url;
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
        if (cache.photoStatus === 'ready' && cache.photoUrl) {
          targetUrl = cache.photoUrl;
          ext = 'png';
        }
      }

      if (!targetUrl) {
        alert('File belum siap. Tunggu sebentar.');
        setIsDownloading(false);
        return;
      }

      const a = document.createElement('a');
      a.href = targetUrl;
      a.download = `Mémoire_${new Date().getTime()}.${ext}`;
      document.body.appendChild(a);
      a.click();
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
      const shareUrl = session ? `${r2BaseUrl}/photos/${session}/photo.png` : legacyUrl;
      if (!shareUrl) return;

      if (navigator.share) {
        await navigator.share({
          title: 'Mémoire',
          text: 'Lihat foto saya dari Mémoire!',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Tautan berhasil disalin ke clipboard!');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const renderLoading = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-lowest gap-3">
      <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest animate-pulse">Loading Assets...</p>
    </div>
  );

  const renderNotAvailable = () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-container-lowest">
      <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Not Available</p>
    </div>
  );

  // Render the preview content for the active tab
  const renderPreview = () => {
    if (activeTab === 'photo') {
      if (cache.photoStatus === 'loading') return renderLoading();
      if (cache.photoStatus === 'ready' && cache.photoUrl) {
        return (
          <Image
            src={cache.photoUrl}
            alt="Mémoire Result"
            fill
            sizes="100vw"
            className="object-contain p-2"
            priority
          />
        );
      }
      return renderNotAvailable();
    }

    if (activeTab === 'gif' && hasGif) {
      if (cache.gifMp4Status === 'loading' && !legacyGif) return renderLoading();
      if (cache.gifMp4Status === 'ready' && cache.gifMp4Url) {
        return (
          <video
            src={cache.gifMp4Url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain p-2"
          />
        );
      }
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
      if (session && gifsCount > 0) {
        if (cache.gifFramesStatus === 'loading') return renderLoading();
        if (cache.gifFramesStatus === 'ready' && cache.gifFrameUrls.length > 0) {
          return (
            <img
              key={gifFrameIndex}
              src={cache.gifFrameUrls[gifFrameIndex]}
              alt={`Raw photo ${gifFrameIndex + 1}`}
              className="w-full h-full object-contain p-2 transition-opacity duration-200"
            />
          );
        }
      }
      return renderNotAvailable();
    }

    if (activeTab === 'live' && hasLive) {
      if (cache.liveMp4Status === 'loading' && !legacyLive) return renderLoading();
      if (cache.liveMp4Status === 'ready' && cache.liveMp4Url) {
        return (
          <video
            src={cache.liveMp4Url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain p-2"
          />
        );
      }
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
        if (cache.liveFramesStatus === 'loading') return renderLoading();
        if (cache.liveFramesStatus === 'ready' && cache.liveFrameUrls.length > 0) {
          return (
            <img
              key={liveFrameIndex}
              src={cache.liveFrameUrls[liveFrameIndex]}
              alt={`Live frame ${liveFrameIndex + 1}`}
              className="w-full h-full object-contain p-2"
            />
          );
        }
      }
      return renderNotAvailable();
    }

    if (activeTab === 'raw' && hasRaw) {
      if (cache.gifFramesStatus === 'loading') return renderLoading();
      if (cache.gifFramesStatus === 'ready' && cache.gifFrameUrls.length > 0) {
        return (
          <div className="absolute inset-0 flex flex-col bg-surface">
            <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2 custom-scrollbar">
              {cache.gifFrameUrls.map((url, i) => (
                <div key={i} className="relative">
                  <img
                    src={url}
                    alt={`Raw ${i + 1}`}
                    className="w-full aspect-[3/4] object-cover border border-outline-variant/30"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }
      return renderNotAvailable();
    }

    return renderNotAvailable();
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
            disabled={isDownloading || 
                     (activeTab === 'raw' && cache.gifFramesStatus !== 'ready') ||
                     (activeTab === 'photo' && cache.photoStatus !== 'ready') ||
                     (activeTab === 'gif' && cache.gifMp4Status !== 'ready' && cache.gifFramesStatus !== 'ready' && !legacyGif) ||
                     (activeTab === 'live' && cache.liveMp4Status !== 'ready' && cache.liveFramesStatus !== 'ready' && !legacyLive)}
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
                ? 'Save All Raw Photos (ZIP)'
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
