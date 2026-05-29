import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant full-width bottom-0 flat no shadows py-margin-desktop px-margin-mobile md:px-margin-desktop">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter max-w-container-max mx-auto items-center">
        <div className="font-display-mobile text-display-mobile text-primary">
          Mémoire
        </div>
        <div className="font-body-md text-body-md text-secondary text-center md:text-left font-light">
          © {new Date().getFullYear()} Mémoire. Memories, Inked in Time.
        </div>
        <nav className="flex justify-center md:justify-end gap-6 font-label-sm text-label-sm uppercase tracking-widest">
          <Link href="#" className="text-on-surface-variant hover:underline decoration-outline underline-offset-4 transition-all opacity-70 hover:opacity-100">
            Instagram
          </Link>
          <Link href="#" className="text-on-surface-variant hover:underline decoration-outline underline-offset-4 transition-all opacity-70 hover:opacity-100">
            Pinterest
          </Link>
          <Link href="#" className="text-on-surface-variant hover:underline decoration-outline underline-offset-4 transition-all opacity-70 hover:opacity-100">
            Privacy
          </Link>
          <Link href="#" className="text-on-surface-variant hover:underline decoration-outline underline-offset-4 transition-all opacity-70 hover:opacity-100">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
