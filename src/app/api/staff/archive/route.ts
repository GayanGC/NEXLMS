import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArchiveStaffSchema, RestoreStaffSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Role-based privilege check: Only Admins and Managers can archive staff
    const allowedRoles = ["SUPER_ADMIN", "INSTITUTE_ADMIN", "MANAGER"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Insufficient privileges to archive staff" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = ArchiveStaffSchema.safeParse(body);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : "Invalid archiving payload" },
        { status: 400 }
      );
    }

    const { userId, reason, gracePeriodDays } = validation.data;

    // Prevent self-archiving lockouts
    if (userId === session.userId) {
      return NextResponse.json(
        { success: false, error: "Administrators cannot archive their own active account." },
        { status: 400 }
      );
    }

    // Strict Tenant Scoping: Verify target staff belongs strictly to caller's tenant
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: session.tenantId,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Staff member not found in your institute" },
        { status: 404 }
      );
    }

    // Calculate grace period date
    const now = new Date();
    const canRestoreUntil = new Date(now.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: "ARCHIVED",
        archiveReason: reason,
        archivedAt: now,
        canRestoreUntil,
        activeSessionToken: null, // Terminate all active sessions immediately
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        archivedAt: true,
        canRestoreUntil: true,
        archiveReason: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Staff member safely archived. Full transaction history preserved with a ${gracePeriodDays}-day restore window.`,
      staff: updatedUser,
    });
  } catch (error) {
    console.error("[Staff API] Archive error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to archive staff member. Please try again." },
      { status: 500 }
    );
  }
}

// RESTORE Staff Member
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["SUPER_ADMIN", "INSTITUTE_ADMIN", "MANAGER"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Insufficient privileges" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = RestoreStaffSchema.safeParse(body);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : "Invalid identifier format" },
        { status: 400 }
      );
    }

    const { userId } = validation.data;

    // Strict Tenant Scoping: Verify target archived staff belongs to caller's tenant
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: session.tenantId,
        status: "ARCHIVED",
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Archived staff member not found in your institute" },
        { status: 404 }
      );
    }

    // Check if grace period has expired
    if (targetUser.canRestoreUntil && new Date(targetUser.canRestoreUntil) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "The 30-day grace period for this account has expired. Account is permanently locked.",
        },
        { status: 400 }
      );
    }

    const restoredUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        archivedAt: null,
        canRestoreUntil: null,
        archiveReason: null,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Staff member successfully restored to ACTIVE status with zero data loss.",
      staff: restoredUser,
    });
  } catch (error) {
    console.error("[Staff API] Restore error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to restore staff member. Please try again." },
      { status: 500 }
    );
  }
}
