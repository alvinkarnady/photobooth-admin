'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

function DownloadContent() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('url');
  const gifUrl = searchParams.get('gif');
  const liveUrl = searchParams.get('live');
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'photo' | 'gif' | 'live'>('photo');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  if (!imageUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 p-6">
        <p className="text-slate-500 font-medium">Tidak ada foto yang ditemukan.</p>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const targetUrl = activeTab === 'live' && liveUrl ? liveUrl 
                      : activeTab === 'gif' && gifUrl ? gifUrl 
                      : imageUrl;
      if (!targetUrl) return;

      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = (activeTab === 'gif' || activeTab === 'live') ? 'gif' : 'png';
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
        // Fallback: Copy to clipboard
        const shareUrl = activeTab === 'live' && liveUrl ? liveUrl 
                       : activeTab === 'gif' && gifUrl ? gifUrl 
                       : imageUrl;
        if (shareUrl) await navigator.clipboard.writeText(shareUrl);
        alert('Tautan berhasil disalin ke clipboard!');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-sky-50 flex flex-col items-center justify-center text-slate-800 p-6 relative overflow-hidden font-sans">
      {/* Joyful floating background shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float" />
      <div className="absolute top-40 right-10 w-40 h-40 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-10 left-20 w-48 h-48 bg-sky-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float" style={{ animationDelay: '4s' }} />
      
      {/* Background blurred image for subtle depth */}
      <div 
        className="absolute inset-0 z-0 opacity-10 blur-3xl scale-110 pointer-events-none"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
      />
      
      <div className="z-10 w-full max-w-md flex flex-col items-center animate-fade-in-up">
        <div className="mb-6 text-center mt-8">
          <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-pink-500 via-orange-400 to-violet-500 bg-clip-text text-transparent animate-pulse-slow tracking-tight">
            Piawai Photobooth
          </h1>
          <p className="text-slate-500 font-medium">Yeay! Ini dia momen seru kamu 🎉</p>
        </div>

        {(gifUrl || liveUrl) && (
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 w-full max-w-sm shadow-inner overflow-x-auto">
            <button
              onClick={() => setActiveTab('photo')}
              className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'photo' 
                  ? 'bg-white text-pink-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Foto
            </button>
            {gifUrl && (
              <button
                onClick={() => setActiveTab('gif')}
                className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'gif' 
                    ? 'bg-white text-pink-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Mentahan
              </button>
            )}
            {liveUrl && (
              <button
                onClick={() => setActiveTab('live')}
                className={`flex-1 min-w-[100px] py-2 text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'live' 
                    ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Live Photo
              </button>
            )}
          </div>
        )}

        {/* Photo/GIF Container */}
        <div className="relative w-full rounded-[2rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(236,72,153,0.3)] border-4 border-white mb-10 bg-white p-3 group transform transition-all duration-300 hover:-translate-y-2">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100">
            {activeTab === 'photo' ? (
              <Image 
                src={imageUrl} 
                alt="Photobooth Result" 
                fill
                className="object-contain transition-transform duration-700 group-hover:scale-105"
                priority
              />
            ) : activeTab === 'gif' ? (
              <img 
                src={gifUrl!} 
                alt="Photobooth GIF Raw" 
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <img 
                src={liveUrl!} 
                alt="Photobooth Live Photo" 
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
            )}
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tr from-pink-400 to-orange-400 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-4 mb-10">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:from-pink-600 hover:to-violet-600 transition-all shadow-lg hover:shadow-pink-500/30 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            {isDownloading ? (
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            )}
            {isDownloading ? 'Menyimpan...' : `Simpan ${activeTab === 'live' ? 'Live Photo' : activeTab === 'gif' ? 'Mentahan GIF' : 'Foto'} ke Galeri`}
          </button>

          <button
            onClick={handleShare}
            className="w-full py-4 px-6 bg-white text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-md hover:shadow-lg active:scale-95 border-2 border-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Bagikan Keseruannya!
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
