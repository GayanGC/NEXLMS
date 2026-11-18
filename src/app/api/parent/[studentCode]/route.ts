import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockStore } from "@/lib/tutor-store";
import crypto from "crypto";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentCode: string }> }
) {
  try {
    const { studentCode } = await params;
    const code = studentCode?.toUpperCase().trim();

    try {
      const student = await prisma.student.findFirst({
        where: { studentCode: code },
        include: {
          class: true,
          tenant: true,
        },
      });

      if (!student) {
        return NextResponse.json({ success: false, error: "Student code not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        studentName: student.fullName,
        studentCode: student.studentCode,
        classTitle: student.class.title,
        instituteName: student.tenant.name,
      });
    } catch {
      // Local dev fallback
      const student = mockStore.students.find((s) => s.studentCode.toUpperCase() === code);
      if (!student) {
        return NextResponse.json({ success: false, error: "Student code not found" }, { status: 404 });
      }
      const cls = mockStore.classes.find((c) => c.id === student.classId);
      return NextResponse.json({
        success: true,
        studentName: student.fullName,
        studentCode: student.studentCode,
        classTitle: cls?.title || "Tuition Class",
        instituteName: "Bandara Physics Academy",
      });
    }
  } catch (error) {
    console.error("[Parent API] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load student" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ studentCode: string }> }
) {
  try {
    const { studentCode } = await params;
    const code = studentCode?.toUpperCase().trim();
    const body = await request.json();
    const { action } = body;
    const rawPhone = (body.phoneOrPin || body.parentPhone || body.last4Phone || "").toString().trim();
    const digitsOnly = rawPhone.replace(/\D/g, "");

    if (!digitsOnly || digitsOnly.length < 4) {
      return NextResponse.json(
        { success: false, error: "Please enter the registered parent phone number or its last 4 digits" },
        { status: 400 }
      );
    }

    const last4 = digitsOnly.slice(-4);

    // Verify student and phone
    let student: any = null;
    let cls: any = null;
    let attendance: any[] = [];
    let fees: any[] = [];
    let tutes: any[] = [];
    let appointments: any[] = [];
    let tuteRequests: any[] = [];
    let examResults: any[] = [];

    try {
      student = await prisma.student.findFirst({
        where: { studentCode: code },
        include: { class: true, tenant: true },
      });

      if (student) {
        cls = student.class;
        const phone = (student.parentPhone || "").replace(/\D/g, "");
        const isMatch =
          phone.endsWith(last4) &&
          (digitsOnly.length === 4 ||
            phone.endsWith(digitsOnly.slice(-9)) ||
            digitsOnly.endsWith(phone.slice(-9)));

        if (!isMatch) {
          return NextResponse.json(
            { success: false, error: "Student code or parent phone number did not match. Please check with your class teacher." },
            { status: 401 }
          );
        }

        // Fetch child data
        attendance = await prisma.attendanceRecord.findMany({
          where: { studentId: student.id },
          orderBy: { date: "desc" },
          take: 30,
        });

        fees = await prisma.feePayment.findMany({
          where: { studentId: student.id },
          orderBy: { month: "desc" },
          take: 12,
        });

        tutes = await prisma.classTute.findMany({
          where: { classId: student.classId },
          orderBy: { createdAt: "desc" },
        });

        appointments = await prisma.parentAppointment.findMany({
          where: { studentId: student.id },
          orderBy: { createdAt: "desc" },
        });

        tuteRequests = await prisma.tuteAccessRequest.findMany({
          where: { studentId: student.id },
        });

        // Fetch student class exams and marks
        const classExams = await prisma.classExam.findMany({
          where: { classId: student.classId, tenantId: student.tenantId },
          orderBy: { examDate: "desc" },
          include: {
            marks: true,
          },
        });

        examResults = classExams.map((exam) => {
          const studentMark = exam.marks.find((m) => m.studentId === student.id);
          const marksObtained = studentMark?.marksObtained ?? null;
          const isAbsent = studentMark?.isAbsent ?? false;
          const remarks = studentMark?.remarks ?? "";

          const percentage = marksObtained !== null ? Math.round((marksObtained / exam.maxMarks) * 100) : null;
          let grade = "-";
          if (isAbsent) grade = "AB";
          else if (percentage !== null) {
            if (percentage >= 75) grade = "A";
            else if (percentage >= 65) grade = "B";
            else if (percentage >= 50) grade = "C";
            else if (percentage >= 35) grade = "S";
            else grade = "W";
          }

          const validMarks = exam.marks.filter((m) => !m.isAbsent && m.marksObtained !== null);
          const totalScore = validMarks.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
          const classAverage = validMarks.length > 0 ? Math.round((totalScore / validMarks.length) * 10) / 10 : 0;

          const sorted = [...validMarks].sort((a, b) => (b.marksObtained || 0) - (a.marksObtained || 0));
          const rankIdx = sorted.findIndex((m) => m.studentId === student.id);
          const rank = rankIdx >= 0 ? rankIdx + 1 : null;

          return {
            examId: exam.id,
            title: exam.title,
            examDate: exam.examDate,
            maxMarks: exam.maxMarks,
            marksObtained,
            isAbsent,
            remarks,
            percentage,
            grade,
            classAverage,
            rank,
            totalParticipants: validMarks.length,
          };
        });
      }
    } catch {
      student = mockStore.students.find((s) => s.studentCode.toUpperCase() === code);
      if (student) {
        cls = mockStore.classes.find((c) => c.id === student.classId);
        const phone = (student.parentPhone || "").replace(/\D/g, "");
        const isMatch =
          phone.endsWith(last4) &&
          (digitsOnly.length === 4 ||
            phone.endsWith(digitsOnly.slice(-9)) ||
            digitsOnly.endsWith(phone.slice(-9)));

        if (!isMatch) {
          return NextResponse.json(
            { success: false, error: "Student code or parent phone number did not match. Please check with your class teacher." },
            { status: 401 }
          );
        }

        attendance = mockStore.attendance.filter((a) => a.studentId === student.id);
        fees = mockStore.fees.filter((f) => f.studentId === student.id);
        tutes = mockStore.tutes.filter((t) => t.classId === student.classId);
        appointments = mockStore.appointments.filter((a) => a.studentId === student.id);
        tuteRequests = mockStore.tuteRequests.filter((r) => r.studentId === student.id);

        const classExams = mockStore.exams
          .filter((e) => e.classId === student.classId)
          .sort((a, b) => b.examDate.localeCompare(a.examDate));

        examResults = classExams.map((exam) => {
          const allMarks = mockStore.examMarks.filter((m) => m.examId === exam.id);
          const studentMark = allMarks.find((m) => m.studentId === student.id);
          const marksObtained = studentMark?.marksObtained ?? null;
          const isAbsent = studentMark?.isAbsent ?? false;
          const remarks = studentMark?.remarks ?? "";

          const percentage = marksObtained !== null ? Math.round((marksObtained / exam.maxMarks) * 100) : null;
          let grade = "-";
          if (isAbsent) grade = "AB";
          else if (percentage !== null) {
            if (percentage >= 75) grade = "A";
            else if (percentage >= 65) grade = "B";
            else if (percentage >= 50) grade = "C";
            else if (percentage >= 35) grade = "S";
            else grade = "W";
          }

          const validMarks = allMarks.filter((m) => !m.isAbsent && m.marksObtained !== null);
          const totalScore = validMarks.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
          const classAverage = validMarks.length > 0 ? Math.round((totalScore / validMarks.length) * 10) / 10 : 0;

          const sorted = [...validMarks].sort((a, b) => (b.marksObtained || 0) - (a.marksObtained || 0));
          const rankIdx = sorted.findIndex((m) => m.studentId === student.id);
          const rank = rankIdx >= 0 ? rankIdx + 1 : null;

          return {
            examId: exam.id,
            title: exam.title,
            examDate: exam.examDate,
            maxMarks: exam.maxMarks,
            marksObtained,
            isAbsent,
            remarks,
            percentage,
            grade,
            classAverage,
            rank,
            totalParticipants: validMarks.length,
          };
        });
      }
    }

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student code or parent phone number did not match. Please check with your class teacher." },
        { status: 404 }
      );
    }

    // Handle Actions
    if (!action || action === "VERIFY") {
      return NextResponse.json({
        success: true,
        verified: true,
        student: {
          id: student.id,
          fullName: student.fullName,
          studentCode: student.studentCode,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          isFreeCard: student.isFreeCard,
        },
        class: {
          id: cls?.id,
          title: cls?.title,
          subject: cls?.subject,
          grade: cls?.grade,
          monthlyFee: cls?.monthlyFee,
          scheduleText: cls?.scheduleText,
          activeNotice: cls?.activeNotice,
          enableTutes: cls?.enableTutes,
        },
        attendance,
        fees,
        tutes,
        appointments,
        tuteRequests,
        examResults,
      });
    }

    if (action === "APPOINTMENT_REQUEST") {
      const { requestedDate, reason } = body;
      if (!requestedDate || !reason) {
        return NextResponse.json({ success: false, error: "Date and reason are required" }, { status: 400 });
      }

      try {
        const app = await prisma.parentAppointment.create({
          data: {
            tenantId: student.tenantId,
            classId: student.classId,
            studentId: student.id,
            initiatedBy: "PARENT",
            requestedDate,
            reason,
            status: "PENDING",
          },
        });
        return NextResponse.json({ success: true, appointment: app });
      } catch {
        const app = {
          id: "app-" + crypto.randomBytes(3).toString("hex"),
          tenantId: student.tenantId,
          classId: student.classId,
          studentId: student.id,
          initiatedBy: "PARENT" as const,
          requestedDate,
          reason,
          status: "PENDING" as const,
          createdAt: new Date().toISOString(),
        };
        mockStore.appointments.unshift(app);
        return NextResponse.json({ success: true, appointment: app });
      }
    }

    if (action === "TUTE_REQUEST") {
      const { tuteId, reason } = body;
      if (!tuteId || !reason) {
        return NextResponse.json({ success: false, error: "Tute selection and reason are required" }, { status: 400 });
      }

      try {
        const req = await prisma.tuteAccessRequest.create({
          data: {
            tenantId: student.tenantId,
            classId: student.classId,
            studentId: student.id,
            tuteId,
            reason,
            status: "PENDING",
          },
        });
        return NextResponse.json({ success: true, request: req });
      } catch {
        const req = {
          id: "req-" + crypto.randomBytes(3).toString("hex"),
          tenantId: student.tenantId,
          classId: student.classId,
          studentId: student.id,
          tuteId,
          reason,
          status: "PENDING" as const,
          createdAt: new Date().toISOString(),
        };
        mockStore.tuteRequests.unshift(req);
        return NextResponse.json({ success: true, request: req });
      }
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Parent API] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 });
  }
}
