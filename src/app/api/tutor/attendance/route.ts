import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceBatchSchema } from "@/lib/validations/tutor";
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
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (!classId) {
      return NextResponse.json({ success: false, error: "classId parameter is required" }, { status: 400 });
    }

    try {
      const records = await prisma.attendanceRecord.findMany({
        where: {
          tenantId: session.tenantId,
          classId,
          date,
        },
        include: {
          student: true,
        },
      });
      return NextResponse.json({ success: true, date, records });
    } catch {
      const records = mockStore.attendance.filter(
        (a) => a.classId === classId && a.date === date
      );
      return NextResponse.json({ success: true, date, records });
    }
  } catch (error) {
    console.error("[Attendance API] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load attendance records" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Assistant permission check
    if (session.role === "CLASS_ASSISTANT") {
      const perms = (session.permissions as string[]) || [];
      if (!perms.includes("ATTENDANCE")) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You do not have permission to record attendance" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validation = AttendanceBatchSchema.safeParse(body);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : "Invalid attendance batch payload" },
        { status: 400 }
      );
    }

    const { classId, date, records } = validation.data;

    try {
      // Upsert attendance records atomically
      const operations = records.map((rec) =>
        prisma.attendanceRecord.upsert({
          where: {
            studentId_classId_date: {
              studentId: rec.studentId,
              classId,
              date,
            },
          },
          update: {
            status: rec.status,
            method: rec.method,
          },
          create: {
            tenantId: session.tenantId,
            classId,
            studentId: rec.studentId,
            date,
            status: rec.status,
            method: rec.method,
          },
        })
      );

      await prisma.$transaction(operations);
      return NextResponse.json({ success: true, message: `Recorded attendance for ${records.length} students` });
    } catch {
      // Local dev fallback
      records.forEach((rec) => {
        const existingIdx = mockStore.attendance.findIndex(
          (a) => a.classId === classId && a.studentId === rec.studentId && a.date === date
        );
        if (existingIdx >= 0) {
          mockStore.attendance[existingIdx].status = rec.status;
          mockStore.attendance[existingIdx].method = rec.method;
        } else {
          mockStore.attendance.push({
            id: "att-" + crypto.randomBytes(3).toString("hex"),
            tenantId: session.tenantId,
            classId,
            studentId: rec.studentId,
            date,
            status: rec.status,
            method: rec.method,
            createdAt: new Date().toISOString(),
          });
        }
      });

      return NextResponse.json({ success: true, message: `Recorded attendance for ${records.length} students` });
    }
  } catch (error) {
    console.error("[Attendance API] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to save attendance" }, { status: 500 });
  }
}
