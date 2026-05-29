"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';

export default function Header() {
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
    // pathname here is the path without the locale prefix because of next-intl
    router.replace(pathname, { locale: newLocale });
  };

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
        <button className="md:hidden text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>menu</span>
        </button>
      </div>
    </header>
  );
}
