import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const session = req.auth;

  // Let the sign-in page itself through unconditionally — guarding it would
  // redirect an unauthenticated visitor to itself, looping forever.
  if (pathname === "/lalit/signin") {
    return NextResponse.next();
  }

  if (!session?.user) {
    const callbackUrl = encodeURIComponent(pathname + search);
    return NextResponse.redirect(
      new URL(`/lalit/signin?callbackUrl=${callbackUrl}`, req.nextUrl)
    );
  }

  if (session.user.role !== "admin") {
    // Rewrite (not redirect) to the 403 page: it serves the forbidden
    // content for this one response without a second navigation, so it
    // can't loop back through this same guard.
    return NextResponse.rewrite(new URL("/lalit/403", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = { matcher: ["/lalit/:path*"] };
