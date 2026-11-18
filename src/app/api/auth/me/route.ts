import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let user = null;
    let dbConnected = true;

    try {
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
          tenant: true,
        },
      });
    } catch (dbErr) {
      dbConnected = false;
      console.warn("[Session API] Database unreachable in local development environment.");
    }

    // When database is reachable, strictly enforce user & tenant status
    if (dbConnected) {
      if (!user || user.status !== "ACTIVE" || !user.tenant || !user.tenant.isActive) {
        return NextResponse.json(
          { authenticated: false, error: "Session invalid or account inactive" },
          { status: 401 }
        );
      }

      // Check single-device active session enforcement (Anti-piracy stream revoke)
      if (session.sessionId && user.activeSessionToken && session.sessionId !== user.activeSessionToken) {
        return NextResponse.json(
          {
            authenticated: false,
            error: "SESSION_SUPERSEDED",
            message: "You have logged in from another device. Playback / access terminated.",
          },
          { status: 401 }
        );
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
        },
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
          tenantType: user.tenant.tenantType,
          studentScale: user.tenant.studentScale,
        },
      });
    }

    // In production, never permit dev bypass when database is unreachable
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { authenticated: false, error: "Database service unavailable" },
        { status: 503 }
      );
    }

    // Local Development Only: Allow cryptographically verified JWT claims when DB is offline
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        fullName: session.fullName,
        phone: session.phone,
        role: session.role,
        status: "ACTIVE",
      },
      tenant: {
        id: session.tenantId,
        name: session.tenantSlug
          .split("-")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        slug: session.tenantSlug,
        tenantType: session.tenantType,
        studentScale: "300 - 1,000",
      },
    });
  } catch (error) {
    console.error("[Auth API] Session verification error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to verify session" },
      { status: 500 }
    );
  }
}
