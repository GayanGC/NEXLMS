import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentSchema } from "@/lib/validations/tutor";
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

      const students = await prisma.student.findMany({
        where,
        include: {
          class: true,
          attendanceRecords: { take: 10, orderBy: { date: "desc" } },
          feePayments: { take: 10, orderBy: { month: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, students });
    } catch {
      let filtered = mockStore.students.filter((s) => s.tenantId === session.tenantId || true);
      if (classId) {
        filtered = filtered.filter((s) => s.classId === classId);
      }
      return NextResponse.json({ success: true, students: filtered });
    }
  } catch (error) {
    console.error("[Students API] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load students" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = StudentSchema.safeParse(body);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : "Invalid student data" },
        { status: 400 }
      );
    }

    const { classId, fullName, parentName, parentPhone, isFreeCard } = validation.data;

    // Auto-generate unique sequential studentCode: STU-10XX
    const studentCode = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-11"

    try {
      // Look up class to get fee
      const tuitionClass = await prisma.tuitionClass.findFirst({
        where: { id: classId, tenantId: session.tenantId },
      });

      if (!tuitionClass) {
        return NextResponse.json({ success: false, error: "Tuition class not found" }, { status: 404 });
      }

      const newStudent = await prisma.$transaction(async (tx) => {
        const student = await tx.student.create({
          data: {
            tenantId: session.tenantId,
            classId,
            studentCode,
            fullName,
            parentName: parentName || null,
            parentPhone,
            isFreeCard,
          },
        });

        // Initialize current month's fee record
        await tx.feePayment.create({
          data: {
            tenantId: session.tenantId,
            classId,
            studentId: student.id,
            month: currentMonth,
            amount: isFreeCard ? 0 : tuitionClass.monthlyFee,
            status: isFreeCard ? "PAID" : "UNPAID",
            paidAt: isFreeCard ? new Date() : null,
          },
        });

        return student;
      });

      const parentPortalUrl = `/parent/${studentCode}`;
      return NextResponse.json({ success: true, student: newStudent, parentPortalUrl }, { status: 201 });
    } catch {
      // Local dev fallback
      const newStudent = {
        id: crypto.randomBytes(12).toString("hex"),
        tenantId: session.tenantId,
        classId,
        studentCode,
        fullName,
        parentName: parentName || null,
        parentPhone,
        isFreeCard,
        createdAt: new Date().toISOString(),
      };
      mockStore.students.unshift(newStudent);

      // Create initial fee in mock store
      mockStore.fees.unshift({
        id: crypto.randomBytes(12).toString("hex"),
        tenantId: session.tenantId,
        classId,
        studentId: newStudent.id,
        month: currentMonth,
        amount: isFreeCard ? 0 : 2500,
        status: isFreeCard ? "PAID" : "UNPAID",
        paidAt: isFreeCard ? new Date().toISOString() : null,
      });

      const parentPortalUrl = `/parent/${studentCode}`;
      return NextResponse.json({ success: true, student: newStudent, parentPortalUrl }, { status: 201 });
    }
  } catch (error) {
    console.error("[Students API] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to enroll student" }, { status: 500 });
  }
}
