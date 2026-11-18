import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TuitionClassSchema } from "@/lib/validations/tutor";
import { mockStore } from "@/lib/tutor-store";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
      const classes = await prisma.tuitionClass.findMany({
        where: { tenantId: session.tenantId },
        include: {
          students: true,
          feePayments: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, classes });
    } catch {
      // Local dev fallback
      const classes = mockStore.classes.filter((c) => c.tenantId === session.tenantId || true);
      const students = mockStore.students;
      const fees = mockStore.fees;

      const enriched = classes.map((c) => {
        const classStudents = students.filter((s) => s.classId === c.id);
        const classFees = fees.filter((f) => f.classId === c.id);
        return {
          ...c,
          students: classStudents,
          feePayments: classFees,
        };
      });

      return NextResponse.json({ success: true, classes: enriched });
    }
  } catch (error) {
    console.error("[Classes API] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load classes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Role check: Only Tutors, Institute Admins, or Super Admins can create classes
    const allowed = ["SUPER_ADMIN", "INSTITUTE_ADMIN", "SOLO_TEACHER"];
    if (!allowed.includes(session.role)) {
      return NextResponse.json({ success: false, error: "Forbidden: Only tutors can create classes" }, { status: 403 });
    }

    const body = await request.json();
    const validation = TuitionClassSchema.safeParse(body);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : "Invalid class payload" },
        { status: 400 }
      );
    }

    const { title, subject, grade, monthlyFee, scheduleText, enableTutes, activeNotice } = validation.data;

    try {
      const newClass = await prisma.tuitionClass.create({
        data: {
          tenantId: session.tenantId,
          title,
          subject,
          grade,
          monthlyFee,
          scheduleText,
          enableTutes,
          activeNotice: activeNotice || null,
        },
      });
      return NextResponse.json({ success: true, class: newClass }, { status: 201 });
    } catch {
      // Local dev fallback
      const newClass = {
        id: crypto.randomBytes(12).toString("hex"),
        tenantId: session.tenantId,
        title,
        subject,
        grade,
        monthlyFee,
        scheduleText,
        enableTutes,
        activeNotice: activeNotice || null,
        createdAt: new Date().toISOString(),
      };
      mockStore.classes.unshift(newClass);
      return NextResponse.json({ success: true, class: newClass }, { status: 201 });
    }
  } catch (error) {
    console.error("[Classes API] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create class" }, { status: 500 });
  }
}
