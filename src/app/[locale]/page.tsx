import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop py-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-surface/40 to-surface/90 z-10"></div>
            <img 
              alt="Hero Background" 
              className="w-full h-full object-cover grayscale opacity-60 mix-blend-multiply" 
              src={t('heroBgImage')}
            />
          </div>
          <div className="relative z-20 flex flex-col items-center text-center max-w-3xl mx-auto space-y-12">
            <div className="w-48 h-48 md:w-64 md:h-64 mb-8">
              <img 
                alt="Mémoire Logo Ink Splash" 
                className="w-full h-full object-contain mix-blend-multiply opacity-90" 
                src="/images/logo-splash.png"
              />
            </div>
            <h1 className="font-display-mobile md:font-display-lg text-display-mobile md:text-display-lg text-primary tracking-tight leading-tight">
              {t('heroTitle1')} <br/><span className="italic font-light">{t('heroTitle2')}</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto font-light leading-relaxed">
              {t('heroDesc')}
            </p>
            <div className="pt-8 flex flex-col sm:flex-row gap-6">
              <button className="bg-primary text-on-primary px-8 py-4 font-label-lg text-label-lg rounded-DEFAULT hover:opacity-90 transition-opacity tracking-widest uppercase">
                {t('reserveBtn')}
              </button>
              <button className="border border-primary text-primary px-8 py-4 font-label-lg text-label-lg rounded-DEFAULT hover:bg-surface-variant transition-colors tracking-widest uppercase">
                {t('exploreBtn')}
              </button>
            </div>
          </div>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-secondary z-20 animate-bounce">
            <span className="font-label-sm text-label-sm uppercase tracking-widest">{t('scroll')}</span>
            <span className="material-symbols-outlined text-sm font-light">arrow_downward</span>
          </div>
        </section>

        {/* The Experience Section */}
        <section className="py-32 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest border-t border-outline-variant relative">
          <div className="max-w-container-max mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
              <div className="md:col-span-5 md:col-start-2 space-y-8 order-2 md:order-1">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest border-b border-outline-variant pb-2 inline-block">{t('experienceLabel')}</span>
                <h2 className="font-headline-lg md:font-display-lg text-headline-lg md:text-display-lg text-primary leading-tight">
                  {t('experienceTitle1')}<br/>{t('experienceTitle2')}<br/>{t('experienceTitle3')}
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant font-light">
                  {t('experienceDesc')}
                </p>
                <ul className="space-y-4 pt-4 border-t border-outline-variant">
                  <li className="flex items-center gap-4 border-b border-outline-variant pb-4 font-body-md text-body-md text-on-surface">
                    <span className="material-symbols-outlined text-primary font-light">camera</span>
                    {t('feature1')}
                  </li>
                  <li className="flex items-center gap-4 border-b border-outline-variant pb-4 font-body-md text-body-md text-on-surface">
                    <span className="material-symbols-outlined text-primary font-light">layers</span>
                    {t('feature2')}
                  </li>
                  <li className="flex items-center gap-4 border-b border-outline-variant pb-4 font-body-md text-body-md text-on-surface">
                    <span className="material-symbols-outlined text-primary font-light">contrast</span>
                    {t('feature3')}
                  </li>
                </ul>
              </div>
              <div className="md:col-span-5 md:col-start-8 order-1 md:order-2 mb-12 md:mb-0 relative">
                <div className="absolute -inset-4 border border-outline-variant rounded-DEFAULT pointer-events-none hidden md:block"></div>
                <img 
                  alt="Camera equipment" 
                  className="w-full aspect-[4/5] object-cover grayscale matte-image shadow-sm" 
                  src={t('experienceImage')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Glimpses */}
        <section className="py-32 px-margin-mobile md:px-margin-desktop bg-surface border-t border-outline-variant">
          <div className="max-w-container-max mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b border-outline-variant pb-8">
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-4 block">{t('archiveLabel')}</span>
                <h2 className="font-headline-lg md:font-display-lg text-headline-lg md:text-display-lg text-primary">{t('archiveTitle')}</h2>
              </div>
              <Link href="/portfolio" className="flex items-center gap-2 font-label-lg text-label-lg text-primary hover:opacity-70 transition-opacity">
                {t('viewPortfolio')} <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div className="group cursor-pointer">
                <div className="overflow-hidden border border-outline-variant aspect-[3/4] mb-4 bg-surface-container">
                  <img alt="The Gala" className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-700 ease-out" src={t('gallery1Image')}/>
                </div>
                <div className="flex justify-between items-baseline font-label-sm text-label-sm">
                  <h3 className="font-headline-sm text-headline-sm text-primary group-hover:underline decoration-1 underline-offset-4">{t('gallery1')}</h3>
                  <span className="text-secondary">01</span>
                </div>
              </div>
              <div className="group cursor-pointer md:mt-12">
                <div className="overflow-hidden border border-outline-variant aspect-[3/4] mb-4 bg-surface-container">
                  <img alt="Fleeting Motions" className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-700 ease-out" src={t('gallery2Image')}/>
                </div>
                <div className="flex justify-between items-baseline font-label-sm text-label-sm">
                  <h3 className="font-headline-sm text-headline-sm text-primary group-hover:underline decoration-1 underline-offset-4">{t('gallery2')}</h3>
                  <span className="text-secondary">02</span>
                </div>
              </div>
              <div className="group cursor-pointer md:-mt-6">
                <div className="overflow-hidden border border-outline-variant aspect-[3/4] mb-4 bg-surface-container">
                  <img alt="Quiet Details" className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-700 ease-out" src={t('gallery3Image')}/>
                </div>
                <div className="flex justify-between items-baseline font-label-sm text-label-sm">
                  <h3 className="font-headline-sm text-headline-sm text-primary group-hover:underline decoration-1 underline-offset-4">{t('gallery3')}</h3>
                  <span className="text-secondary">03</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-32 px-margin-mobile md:px-margin-desktop bg-primary text-on-primary relative overflow-hidden">
          <div className="noise-overlay" style={{ opacity: 0.15, filter: 'invert(1)' }}></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, var(--color-surface-tint) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-20 max-w-2xl mx-auto text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl mb-6 font-light">ink_pen</span>
            <h2 className="font-headline-lg md:font-display-lg text-headline-lg md:text-display-lg mb-6 leading-tight">{t('newsletterTitle1')}<br/>{t('newsletterTitle2')}</h2>
            <p className="font-body-md text-body-md text-on-primary/80 mb-12 font-light max-w-md">
              {t('newsletterDesc')}
            </p>
            <form className="w-full max-w-md flex flex-col gap-6">
              <div className="relative border-b border-on-primary/30 pb-2 focus-within:border-on-primary transition-colors">
                <label className="absolute -top-4 left-0 font-label-sm text-label-sm text-on-primary/60 uppercase tracking-widest transition-all" htmlFor="email">{t('emailPlaceholder')}</label>
                <input className="w-full bg-transparent border-none focus:ring-0 text-on-primary font-body-lg text-body-lg p-0 h-8 placeholder-transparent" id="email" placeholder={t('emailPlaceholder')} required type="email"/>
              </div>
              <button className="w-full bg-surface text-primary py-4 font-label-lg text-label-lg rounded-DEFAULT hover:bg-surface-variant transition-colors tracking-widest uppercase mt-4" type="submit">
                {t('subscribeBtn')}
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
