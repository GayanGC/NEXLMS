import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClassTuteSchema } from "@/lib/validations/tutor";
import { mockStore } from "@/lib/tutor-store";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    try {
      const where: any = { tenantId: session.tenantId };
      if (classId) where.classId = classId;

      const tutes = await prisma.classTute.findMany({
        where,
        include: {
          class: true,
          tuteAccessRequests: { include: { student: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, tutes });
    } catch {
      let filtered = mockStore.tutes;
      if (classId) filtered = filtered.filter((t) => t.classId === classId);
      return NextResponse.json({ success: true, tutes: filtered });
    }
  } catch (error) {
    console.error("[Tutes API] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load tutes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "CLASS_ASSISTANT") {
      const perms = (session.permissions as string[]) || [];
      if (!perms.includes("TUTES")) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You do not have permission to manage tutes" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validation = ClassTuteSchema.safeParse(body);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : "Invalid tute data" },
        { status: 400 }
      );
    }

    const { classId, title, month, fileUrl } = validation.data;

    try {
      const newTute = await prisma.classTute.create({
        data: {
          tenantId: session.tenantId,
          classId,
          title,
          month,
          fileUrl,
        },
      });
      return NextResponse.json({ success: true, tute: newTute }, { status: 201 });
    } catch {
      const newTute = {
        id: "tute-" + crypto.randomBytes(3).toString("hex"),
        tenantId: session.tenantId,
        classId,
        title,
        month,
        fileUrl,
        createdAt: new Date().toISOString(),
      };
      mockStore.tutes.unshift(newTute);
      return NextResponse.json({ success: true, tute: newTute }, { status: 201 });
    }
  } catch (error) {
    console.error("[Tutes API] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create tute" }, { status: 500 });
  }
}
