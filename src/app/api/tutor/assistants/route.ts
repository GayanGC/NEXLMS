import { NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClassAssistantSchema } from "@/lib/validations/tutor";
import { mockStore } from "@/lib/tutor-store";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
      const assistants = await prisma.user.findMany({
        where: {
          tenantId: session.tenantId,
          role: "CLASS_ASSISTANT",
        },
        select: {
          id: true,
          fullName: true,
          phone: true,
          role: true,
          permissions: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, assistants });
    } catch {
      return NextResponse.json({ success: true, assistants: mockStore.assistants });
    }
  } catch (error) {
    console.error("[Assistants API] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load assistants" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Only Tutors or Admins can provision class assistants
    const allowed = ["SUPER_ADMIN", "INSTITUTE_ADMIN", "SOLO_TEACHER"];
    if (!allowed.includes(session.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = ClassAssistantSchema.safeParse(body);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : "Invalid assistant payload" },
        { status: 400 }
      );
    }

    const { fullName, phone, password, permissions } = validation.data;
    const passwordHash = await hashPassword(password);

    try {
      const newAssistant = await prisma.user.create({
        data: {
          tenantId: session.tenantId,
          role: "CLASS_ASSISTANT",
          fullName,
          phone,
          passwordHash,
          permissions,
          supervisorId: session.userId,
          status: "ACTIVE",
        },
        select: {
          id: true,
          fullName: true,
          phone: true,
          role: true,
          permissions: true,
          status: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ success: true, assistant: newAssistant }, { status: 201 });
    } catch {
      const newAssistant = {
        id: "asst-" + crypto.randomBytes(3).toString("hex"),
        tenantId: session.tenantId,
        fullName,
        phone,
        permissions,
        createdAt: new Date().toISOString(),
      };
      mockStore.assistants.unshift(newAssistant);
      return NextResponse.json({ success: true, assistant: newAssistant }, { status: 201 });
    }
  } catch (error) {
    console.error("[Assistants API] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to add class assistant" }, { status: 500 });
  }
}
