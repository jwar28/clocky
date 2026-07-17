import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr/middleware";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  await updateSession({
    requestCookies: request.cookies as unknown as Parameters<typeof updateSession>[0]["requestCookies"],
    responseCookies: response.cookies as unknown as Parameters<typeof updateSession>[0]["responseCookies"],
  });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons
     * - /equipo (public route — no auth/refresh overhead for anonymous visitors)
     */
    "/((?!_next/static|_next/image|favicon.ico|equipo|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};