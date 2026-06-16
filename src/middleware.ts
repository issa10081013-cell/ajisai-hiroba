import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER = process.env.ADMIN_BASIC_USER ?? "ajisai";
const ADMIN_PASS = process.env.ADMIN_BASIC_PASS ?? "hiroba2024";

function isAuthenticated(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) return false;
  const [user, pass] = Buffer.from(auth.slice(6), "base64").toString().split(":");
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!isAuthenticated(req)) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
      });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
