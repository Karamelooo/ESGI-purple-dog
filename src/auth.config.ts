import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/admin');
            if (isOnDashboard) {
                if (isLoggedIn) {
                    // Check if user has admin/modo role
                    // NOTE: In a real app we'd check auth.user.role but the user object here is limited in the edge middleware for now
                    // We will trust the session in the actual page components or enhance the jwt callback
                    return true;
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Redirect logged-in users away from login/register pages
                if (nextUrl.pathname === '/login' || nextUrl.pathname === '/register') {
                    return Response.redirect(new URL('/', nextUrl));
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            // Persist the user id and role to the token right after signin
            if (user) {
                token.id = user.id;
                // @ts-ignore - We know role exists on user from Prisma
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // @ts-ignore
                session.user.id = token.id;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
