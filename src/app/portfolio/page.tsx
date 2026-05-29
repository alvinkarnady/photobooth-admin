import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Portfolio() {
  return (
    <>
      <Header />
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-16 pb-32">
        {/* Header Section */}
        <section className="mb-20 md:mb-32 max-w-3xl">
          <h1 className="font-display-mobile text-display-mobile md:font-display-lg md:text-display-lg text-primary mb-6">Inked in Time.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
            A curated gallery of moments captured through our lens. Monochromatic, timeless, and beautifully imperfect. Explore our portfolio of weddings, galas, and intimate gatherings.
          </p>
        </section>

        {/* Filters */}
        <section className="mb-12 border-b border-outline-variant pb-6 flex flex-wrap gap-6 items-center">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Filter by:</span>
          <div className="flex gap-4 flex-wrap">
            <button className="font-label-lg text-label-lg text-primary border-b-2 border-primary pb-1">All Events</button>
            <button className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors pb-1">Weddings</button>
            <button className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors pb-1">Galas</button>
            <button className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors pb-1">Private</button>
            <button className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors pb-1">Editorial</button>
          </div>
        </section>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-gutter space-y-gutter">
          {/* Item 1 (Tall) */}
          <div className="break-inside-avoid mb-gutter">
            <div className="ink-hover-container matte-border border border-outline-variant cursor-pointer group">
              <img alt="Wedding portrait" className="w-full h-auto object-cover block grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf3MuKXvKTCpZP04Vj_oLCzKCCKed1N4E64Gf7jzPeM5XvIt04yupc3ro8VshDMMmqFBVpafNrzd6RGeUa7YFkszqANxkrIrwpMiba1LLt75cKK7GSfbDc8PxvfB_CSbTfDEAHe42Xr9GjptAJYO5IaHq3S89_FvYrY6qouRAVJOoSvcDq8GuUGPzVq84RQeovpXdjLYW5sd4rsSHBwbTKoYWZIgHg1prDo31BygaywE5KF_DnOXAi_nuLDMVTukUTPG2r2d4JnTE"/>
              <div className="ink-hover-content">
                <h3 className="font-headline-sm text-headline-sm mb-1">The Anderson Wedding</h3>
                <p className="font-label-sm text-label-sm uppercase tracking-widest opacity-80">New York, 2023</p>
              </div>
            </div>
          </div>
          {/* Item 2 (Square) */}
          <div className="break-inside-avoid mb-gutter">
            <div className="ink-hover-container matte-border border border-outline-variant cursor-pointer group">
              <img alt="Gala guests" className="w-full h-auto object-cover block grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnFiYSPyzICG-neRL9i-OuPLSIUw674zm7JqeMDUXUBvI8nf26EmeyjufIYbD4Znk2Cx_mH4AS_3dRNNDmmkmwmJvHacDgYCDsorCLOpCXnIFv3KMnINaTwFQsgKsHmUYANrGipcmqTMFqdIe-5QJVpc6OqDmU3mENlz2zUHG2i_8hpipFzgznJ30_bazeTRkVzV9GkPnep8PtNn--LU47q5uGvFrA_IrO2QCSefetpFnT2UfwMgS06E7f8hjPJa0wet7W8wz6DeY"/>
              <div className="ink-hover-content">
                <h3 className="font-headline-sm text-headline-sm mb-1">Metropolitan Gala</h3>
                <p className="font-label-sm text-label-sm uppercase tracking-widest opacity-80">London, 2024</p>
              </div>
            </div>
          </div>
          {/* Item 3 (Wide) */}
          <div className="break-inside-avoid mb-gutter">
            <div className="ink-hover-container matte-border border border-outline-variant cursor-pointer group">
              <img alt="Bride and Groom" className="w-full h-auto object-cover block grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBV8AGsr4LAaJKU-ravAjxtBwaOrcYdZ4p3COobCVWM0sMWIq6nKNPxdHzwLtiaXvIp8JBfQ2DmG8c-5WLgrpFp4O3Q1Y8uSosyWe8ybLGx2MSKQ1tYOm4oYkF6UpLH7YNrDyhwSvGOyzd-lIXVNxtzan6UdIfZ8NTahIV5t0LDnGL7U4qzRAEESMTGgImNs14jkHNa-nz0UZXk8tTShzQylhrS72VGkDaDRi7HlDZWUhpNhf9wEXE8oSYscE5m2hFsB3y6bInwBRo"/>
              <div className="ink-hover-content">
                <h3 className="font-headline-sm text-headline-sm mb-1">Estate Celebration</h3>
                <p className="font-label-sm text-label-sm uppercase tracking-widest opacity-80">Tuscany, 2023</p>
              </div>
            </div>
          </div>
          {/* Item 4 (Square) */}
          <div className="break-inside-avoid mb-gutter">
            <div className="ink-hover-container matte-border border border-outline-variant cursor-pointer group">
              <img alt="Party guests" className="w-full h-auto object-cover block grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVWvUNcACJ25u93NsHGWcUWUxiGE2pfAIbTpJnYU5st2t5A2FuepAW_x5kXqpuXZhrerYMXv4I2_a9799_V-QE7Z3J0D5Iq1rwe8-QTcwWKnA94bHzvfL5_rotOeoRW0Ov74dgvA6FnrUndShgFIbOZxR1aq5lJyMAQ8zVeQJb6a8KXHNXybaKFOoZ7Cd4lcrAVMzVsAo7BWZWALKWAS2zLrjPAoOQZeQddAnimtCkts1n46qrCWybE_slOoApHuOF4-gqiSCGcvk"/>
              <div className="ink-hover-content">
                <h3 className="font-headline-sm text-headline-sm mb-1">Midnight Soirée</h3>
                <p className="font-label-sm text-label-sm uppercase tracking-widest opacity-80">Paris, 2024</p>
              </div>
            </div>
          </div>
          {/* Item 5 (Tall) */}
          <div className="break-inside-avoid mb-gutter">
            <div className="ink-hover-container matte-border border border-outline-variant cursor-pointer group">
              <img alt="Fashion portrait" className="w-full h-auto object-cover block grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-dOsqxXpYiBuAheWCEt5apfAeEh93UL_eUHLaysk57CItaM8uqBms2YrD4M7SECfCqx5IRA2kORhMNLTnmG75hO2ThjNPiDu5EwMKSCilmsL9tHmdA7-ucJh-ZYkL_2k1jGEiO8zEkJvU9H8H1DWJP3w9S4ssgq7I5VKKG3BGV1zKW2KsPqu35e6du4CMPz_r2Nbe4cpCx2NrZRvZkstPlpXpOTLUqbthy1-sbkM5cVF-FSXuYUaBxJtKn1fTX8C8Zot5d8cqIVQ"/>
              <div className="ink-hover-content">
                <h3 className="font-headline-sm text-headline-sm mb-1">Vogue Afterparty</h3>
                <p className="font-label-sm text-label-sm uppercase tracking-widest opacity-80">Milan, 2023</p>
              </div>
            </div>
          </div>
          {/* Item 6 (Wide) */}
          <div className="break-inside-avoid mb-gutter">
            <div className="ink-hover-container matte-border border border-outline-variant cursor-pointer group">
              <img alt="Group shot" className="w-full h-auto object-cover block grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdCOdLnAN3glvFj0JJ3BpF0xaleroZ-Xw5P_invK_bROYdr3AvDmFNtC8k0TcPRE7QiOr09WYaA-j-BFqEFjzKzbISA8GUeazRLnMpj9H_dtRmz0fBD9Q8KRZSP_OcNLLd0fOXBnNx7Iyj2v4PnkTAOt6KrqJ7jepZFd80hLTidTp6oxQKOmrnbkRp4-C4sdI8WTX0R4wRrXQZXWQFpxtLcgFRAVTQNr2VgM39iABBtPnn_GlSiKKZTgIYPyUz7NfGxoTBK01iThc"/>
              <div className="ink-hover-content">
                <h3 className="font-headline-sm text-headline-sm mb-1">The Summer Edit</h3>
                <p className="font-label-sm text-label-sm uppercase tracking-widest opacity-80">Los Angeles, 2022</p>
              </div>
            </div>
          </div>
        </div>

        {/* Load More */}
        <div className="mt-20 flex justify-center">
          <button className="bg-transparent border border-primary text-primary font-label-lg text-label-lg px-8 py-4 hover:bg-primary hover:text-on-primary transition-colors duration-300">
            Load More Memories
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
