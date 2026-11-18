import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "nexlms_token";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing in production middleware.");
}

const rawSecret = (process.env.JWT_SECRET || "nexlms-secure-jwt-signing-key-production-sri-lanka-2026-edtech")
  .replace(/^["']|["']$/g, "")
  .trim();
const SECRET_KEY = new TextEncoder().encode(rawSecret);

interface TokenClaims {
  userId: string;
  tenantId: string;
  role: string;
  tenantSlug: string;
  tenantType: string;
  fullName: string;
  phone: string;
  permissions?: string[];
}

// Role to default portal path mapping
function getDefaultPortalForRole(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "INSTITUTE_ADMIN":
      return "/portal/admin";
    case "SOLO_TEACHER":
    case "CLASS_ASSISTANT":
      return "/portal/teacher";
    case "MANAGER":
    case "CASHIER":
      return "/portal/cashier";
    case "ATTENDANCE_CHECKER":
      return "/portal/attendance";
    case "STUDENT":
      return "/portal/student";
    case "PARENT":
      return "/parent/STU-1041";
    default:
      return "/portal/admin";
  }
}

// Role-based route authorization
function isRoleAuthorizedForPath(role: string, pathname: string): boolean {
  if (role === "SUPER_ADMIN") return true;

  if (pathname.startsWith("/portal/admin")) {
    return role === "INSTITUTE_ADMIN";
  }

  if (pathname.startsWith("/portal/teacher")) {
    // Strictly block CLASS_ASSISTANT from accessing the Finance tab
    if (pathname.startsWith("/portal/teacher/finance") && role === "CLASS_ASSISTANT") {
      return false;
    }
    return (
      role === "INSTITUTE_ADMIN" ||
      role === "SOLO_TEACHER" ||
      role === "CLASS_ASSISTANT"
    );
  }

  if (pathname.startsWith("/portal/cashier")) {
    return role === "INSTITUTE_ADMIN" || role === "MANAGER" || role === "CASHIER";
  }

  if (pathname.startsWith("/portal/attendance")) {
    return (
      role === "INSTITUTE_ADMIN" ||
      role === "MANAGER" ||
      role === "ATTENDANCE_CHECKER" ||
      role === "CASHIER"
    );
  }

  if (pathname.startsWith("/portal/student")) {
    return role === "STUDENT" || role === "INSTITUTE_ADMIN" || role === "SOLO_TEACHER";
  }

  if (pathname.startsWith("/portal/parent")) {
    return role === "PARENT" || role === "INSTITUTE_ADMIN";
  }

  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply authentication guards to /portal and protected API paths
  const isPortalRoute = pathname.startsWith("/portal");
  const isProtectedApi = pathname.startsWith("/api/staff") || pathname.startsWith("/api/tutor");

  if (!isPortalRoute && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    // Redirect unauthenticated user to login card on landing page
    const loginUrl = new URL("/#login-card", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const claims = payload as unknown as TokenClaims;

    // Strict API guard: block CLASS_ASSISTANT from /api/tutor/finance
    if (pathname.startsWith("/api/tutor/finance") && claims.role === "CLASS_ASSISTANT") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Class Assistants are not permitted to access financial data" },
        { status: 403 }
      );
    }

    // If accessing root /portal, automatically route to role-appropriate portal
    if (pathname === "/portal" || pathname === "/portal/") {
      const targetPortal = getDefaultPortalForRole(claims.role);
      return NextResponse.redirect(new URL(targetPortal, request.url));
    }

    // Role-based authorization check
    if (isPortalRoute && !isRoleAuthorizedForPath(claims.role, pathname)) {
      // Redirect unauthorized role to their assigned dashboard
      const authorizedPortal = getDefaultPortalForRole(claims.role);
      return NextResponse.redirect(new URL(authorizedPortal, request.url));
    }

    // Forward request with injected tenant & user headers for downstream server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", claims.userId);
    requestHeaders.set("x-tenant-id", claims.tenantId);
    requestHeaders.set("x-user-role", claims.role);
    requestHeaders.set("x-tenant-slug", claims.tenantSlug);
    requestHeaders.set("x-user-name", claims.fullName);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    // Token is invalid, tampered, or expired:
    // IMPORTANT: Automatically clear the stale cookie to prevent infinite redirect loops!
    if (isProtectedApi) {
      const apiResponse = NextResponse.json(
        { success: false, error: "Invalid session token" },
        { status: 401 }
      );
      apiResponse.cookies.delete(AUTH_COOKIE_NAME);
      return apiResponse;
    }

    const loginUrl = new URL("/#login-card", request.url);
    loginUrl.searchParams.set("error", "session_expired");
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.cookies.delete(AUTH_COOKIE_NAME);
    return redirectResponse;
  }
}

export const config = {
  matcher: ["/portal/:path*", "/api/staff/:path*", "/api/tutor/:path*"],
};
