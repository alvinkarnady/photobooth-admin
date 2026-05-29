"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Contact', href: '/contact' },
  ];

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
                href={link.href}
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
        <div className="hidden md:block">
          <button className="bg-primary text-on-primary px-6 py-3 font-label-lg text-label-lg rounded-DEFAULT hover:opacity-90 transition-opacity flex items-center gap-2">
            Book Now
          </button>
        </div>
        <button className="md:hidden text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>menu</span>
        </button>
      </div>
    </header>
  );
}
