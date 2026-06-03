"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Header');

  const navLinks = [
    { name: t('home'), href: '/' },
    { name: t('services'), href: '/services' },
    { name: t('portfolio'), href: '/portfolio' },
    { name: t('contact'), href: '/contact' },
  ];

  const handleLanguageChange = (newLocale: string) => {
    setIsMobileMenuOpen(false);
    // pathname here is the path without the locale prefix because of next-intl
    router.replace(pathname, { locale: newLocale });
  };

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="docked full-width top-0 sticky z-50 bg-surface border-b border-outline-variant flat no shadows">
      <div className="flex justify-between items-center w-full h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <Link 
          href="/" 
          className="font-display-lg text-headline-sm md:text-headline-md text-primary tracking-tighter hover:opacity-80 transition-opacity"
        >
          Mémoire
        </Link>
        <nav className="hidden md:flex gap-8 items-center font-label-lg text-label-lg">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href as any}
                className={
                  isActive
                    ? 'text-primary border-b border-primary pb-1'
                    : 'text-secondary hover:text-primary transition-all duration-300 scale-95 active:opacity-80'
                }
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-2 mr-8 text-secondary font-label-sm text-label-sm tracking-widest">
            <button 
              onClick={() => handleLanguageChange('en')}
              className={locale === 'en' ? 'text-primary border-b border-primary pb-0.5' : 'hover:text-primary transition-colors pb-0.5'}
            >
              EN
            </button>
            <span className="opacity-50">/</span>
            <button 
              onClick={() => handleLanguageChange('id')}
              className={locale === 'id' ? 'text-primary border-b border-primary pb-0.5' : 'hover:text-primary transition-colors pb-0.5'}
            >
              ID
            </button>
          </div>
          <button className="bg-primary text-on-primary px-6 py-3 font-label-lg text-label-lg rounded-DEFAULT hover:opacity-90 transition-opacity flex items-center gap-2">
            {t('bookNow')}
          </button>
        </div>
        <button 
          className="md:hidden text-primary z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[80px] bg-surface z-40 flex flex-col items-center pt-12 px-6 md:hidden overflow-y-auto pb-12">
          <nav className="flex flex-col gap-8 items-center font-display-md text-headline-sm w-full mb-12">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href as any}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={
                    isActive
                      ? 'text-primary border-b border-primary pb-1'
                      : 'text-secondary hover:text-primary transition-colors'
                  }
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="w-full h-px bg-outline-variant mb-8" />
          
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="flex items-center gap-4 text-secondary font-label-lg tracking-widest uppercase">
              <button 
                onClick={() => handleLanguageChange('en')}
                className={locale === 'en' ? 'text-primary font-bold border-b border-primary pb-1' : 'hover:text-primary transition-colors pb-1'}
              >
                English
              </button>
              <span className="opacity-50 px-2">/</span>
              <button 
                onClick={() => handleLanguageChange('id')}
                className={locale === 'id' ? 'text-primary font-bold border-b border-primary pb-1' : 'hover:text-primary transition-colors pb-1'}
              >
                Indonesia
              </button>
            </div>
            
            <button className="bg-primary text-on-primary w-full max-w-xs py-4 font-label-lg text-label-lg tracking-widest uppercase rounded-none hover:opacity-90 transition-opacity mt-4">
              {t('bookNow')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
