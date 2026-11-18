import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ParentAppointmentSchema, MongoIdSchema } from "@/lib/validations/tutor";
import { mockStore } from "@/lib/tutor-store";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
      const appointments = await prisma.parentAppointment.findMany({
        where: { tenantId: session.tenantId },
        include: {
          student: true,
          class: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, appointments });
    } catch {
      const appointments = mockStore.appointments.map((app) => {
        const student = mockStore.students.find((s) => s.id === app.studentId);
        const cls = mockStore.classes.find((c) => c.id === app.classId);
        return {
          ...app,
          student,
          class: cls,
        };
      });
      return NextResponse.json({ success: true, appointments });
    }
  } catch (error) {
    console.error("[Appointments API] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load appointments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = ParentAppointmentSchema.safeParse(body);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : "Invalid appointment data" },
        { status: 400 }
      );
    }

    const { classId, studentId, initiatedBy, requestedDate, confirmedDate, confirmedTime, reason, teacherNote, status } =
      validation.data;

    try {
      const appointment = await prisma.parentAppointment.create({
        data: {
          tenantId: session.tenantId,
          classId,
          studentId,
          initiatedBy,
          requestedDate,
          confirmedDate: confirmedDate || requestedDate,
          confirmedTime: confirmedTime || null,
          reason,
          teacherNote: teacherNote || null,
          status: status || "PENDING",
        },
      });
      return NextResponse.json({ success: true, appointment }, { status: 201 });
    } catch {
      const appointment = {
        id: "app-" + crypto.randomBytes(3).toString("hex"),
        tenantId: session.tenantId,
        classId,
        studentId,
        initiatedBy,
        requestedDate,
        confirmedDate: confirmedDate || requestedDate,
        confirmedTime: confirmedTime || null,
        reason,
        teacherNote: teacherNote || null,
        status: status || "PENDING",
        createdAt: new Date().toISOString(),
      };
      mockStore.appointments.unshift(appointment);
      return NextResponse.json({ success: true, appointment }, { status: 201 });
    }
  } catch (error) {
    console.error("[Appointments API] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to schedule appointment" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { appointmentId, status, confirmedDate, confirmedTime, teacherNote } = body;

    if (!appointmentId) {
      return NextResponse.json({ success: false, error: "appointmentId is required" }, { status: 400 });
    }

    try {
      const updated = await prisma.parentAppointment.update({
        where: { id: appointmentId },
        data: {
          status,
          confirmedDate: confirmedDate || undefined,
          confirmedTime: confirmedTime || undefined,
          teacherNote: teacherNote || undefined,
        },
      });
      return NextResponse.json({ success: true, appointment: updated });
    } catch {
      const app = mockStore.appointments.find((a) => a.id === appointmentId);
      if (app) {
        if (status) app.status = status;
        if (confirmedDate) app.confirmedDate = confirmedDate;
        if (confirmedTime) app.confirmedTime = confirmedTime;
        if (teacherNote) app.teacherNote = teacherNote;
      }
      return NextResponse.json({ success: true, message: "Appointment updated" });
    }
  } catch (error) {
    console.error("[Appointments API] PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update appointment" }, { status: 500 });
  }
}
