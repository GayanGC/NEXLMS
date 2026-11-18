import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TuteRequestActionSchema } from "@/lib/validations/tutor";
import { mockStore } from "@/lib/tutor-store";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
      const requests = await prisma.tuteAccessRequest.findMany({
        where: { tenantId: session.tenantId },
        include: {
          student: true,
          class: true,
          tute: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, requests });
    } catch {
      const requests = mockStore.tuteRequests.map((req) => {
        const student = mockStore.students.find((s) => s.id === req.studentId);
        const tute = mockStore.tutes.find((t) => t.id === req.tuteId);
        const cls = mockStore.classes.find((c) => c.id === req.classId);
        return {
          ...req,
          student,
          tute,
          class: cls,
        };
      });
      return NextResponse.json({ success: true, requests });
    }
  } catch (error) {
    console.error("[Tute Requests API] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load tute requests" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "CLASS_ASSISTANT") {
      const perms = (session.permissions as string[]) || [];
      if (!perms.includes("TUTES")) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You do not have permission to approve tutes" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validation = TuteRequestActionSchema.safeParse(body);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : "Invalid action payload" },
        { status: 400 }
      );
    }

    const { requestId, status } = validation.data;

    try {
      const updated = await prisma.tuteAccessRequest.update({
        where: { id: requestId },
        data: { status },
      });
      return NextResponse.json({ success: true, request: updated });
    } catch {
      const req = mockStore.tuteRequests.find((r) => r.id === requestId);
      if (req) {
        req.status = status;
      }
      return NextResponse.json({ success: true, message: `Request ${status.toLowerCase()} successfully` });
    }
  } catch (error) {
    console.error("[Tute Requests API] PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update tute request" }, { status: 500 });
  }
}
