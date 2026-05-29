import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export const proxy = createMiddleware(routing);
 
export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /admin (Admin dashboard)
    // - /download (Download page)
    // - /_next (Next.js internals)
    // - /images, /favicon.ico, etc. (Static files)
    '/((?!api|admin|download|_next|_vercel|.*\\..*).*)',
  ]
};
