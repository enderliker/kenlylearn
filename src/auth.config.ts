import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-compatible NextAuth configuration.
 * Contains no Node.js runtime bindings (no C++ addons, no sqlite3, no argon2),
 * making it 100% safe to run in Vercel Edge Middleware.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');
      const isProtected = ['/upload', '/exams', '/settings', '/subjects'].some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirects to pages.signIn with callbackUrl
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }

      return true;
    },
  },
  providers: [], // Providers with database operations are attached in src/auth.ts
} satisfies NextAuthConfig;
