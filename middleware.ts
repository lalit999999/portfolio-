import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const session = req.auth;

  if (!session?.user) {
    const callbackUrl = encodeURIComponent(pathname + search);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl)
    );
  }

  if (session.user.role !== "admin") {
    // Rewrite rather than redirect so a non-admin visiting /admin sees the
    // homepage silently, instead of a distinct signal that /admin exists.
    return NextResponse.rewrite(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = { matcher: ["/admin/:path*"] };
