import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BulkSaveMarksSchema } from "@/lib/validations/tutor";
import { mockStore, MockExamMark } from "@/lib/tutor-store";
import crypto from "crypto";

function calculateGrade(percentage: number | null, isAbsent: boolean): string {
  if (isAbsent) return "AB";
  if (percentage === null || percentage === undefined) return "-";
  if (percentage >= 75) return "A";
  if (percentage >= 65) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 35) return "S";
  return "W";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await params;

    try {
      const exam = await prisma.classExam.findFirst({
        where: { id: examId, tenantId: session.tenantId },
        include: { class: true },
      });

      if (!exam) {
        return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
      }

      // Enrolled students in class
      const students = await prisma.student.findMany({
        where: { classId: exam.classId, tenantId: session.tenantId },
        orderBy: { studentCode: "asc" },
      });

      // Existing marks for this exam
      const existingMarks = await prisma.examMark.findMany({
        where: { examId, tenantId: session.tenantId },
      });

      const marksMap = new Map<string, (typeof existingMarks)[0]>();
      existingMarks.forEach((m) => marksMap.set(m.studentId, m));

      // Calculate ranks among non-absent students with marks
      const scoredStudents: { studentId: string; marksObtained: number }[] = [];
      existingMarks.forEach((m) => {
        if (!m.isAbsent && m.marksObtained !== null && m.marksObtained !== undefined) {
          scoredStudents.push({ studentId: m.studentId, marksObtained: m.marksObtained });
        }
      });
      scoredStudents.sort((a, b) => b.marksObtained - a.marksObtained);

      const rankMap = new Map<string, number>();
      scoredStudents.forEach((s, idx) => {
        rankMap.set(s.studentId, idx + 1);
      });

      const studentResults = students.map((stu) => {
        const markRecord = marksMap.get(stu.id);
        const marksObtained = markRecord?.marksObtained ?? null;
        const isAbsent = markRecord?.isAbsent ?? false;
        const remarks = markRecord?.remarks ?? "";

        const percentage =
          marksObtained !== null ? Math.round((marksObtained / exam.maxMarks) * 100) : null;
        const grade = calculateGrade(percentage, isAbsent);
        const rank = rankMap.get(stu.id) ?? null;

        return {
          id: stu.id,
          studentCode: stu.studentCode,
          fullName: stu.fullName,
          parentName: stu.parentName,
          parentPhone: stu.parentPhone,
          isFreeCard: stu.isFreeCard,
          marksObtained,
          isAbsent,
          remarks,
          percentage,
          grade,
          rank,
        };
      });

      const validMarks = existingMarks.filter((m) => !m.isAbsent && m.marksObtained !== null);
      const totalMarks = validMarks.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
      const classAverage =
        validMarks.length > 0 ? Math.round((totalMarks / validMarks.length) * 10) / 10 : 0;
      const highestMark =
        validMarks.length > 0 ? Math.max(...validMarks.map((m) => m.marksObtained || 0)) : 0;

      return NextResponse.json({
        success: true,
        exam: {
          id: exam.id,
          title: exam.title,
          examDate: exam.examDate,
          maxMarks: exam.maxMarks,
          classId: exam.classId,
          class: {
            id: exam.class.id,
            title: exam.class.title,
            subject: exam.class.subject,
            grade: exam.class.grade,
          },
        },
        students: studentResults,
        stats: {
          totalStudents: students.length,
          enteredCount: existingMarks.length,
          absentCount: existingMarks.filter((m) => m.isAbsent).length,
          classAverage,
          highestMark,
          totalParticipants: scoredStudents.length,
        },
      });
    } catch {
      // Local dev fallback
      const exam = mockStore.exams.find((e) => e.id === examId);
      if (!exam) {
        return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
      }

      const cls = mockStore.classes.find((c) => c.id === exam.classId);
      const students = mockStore.students.filter((s) => s.classId === exam.classId);
      const marks = mockStore.examMarks.filter((m) => m.examId === examId);

      const marksMap = new Map<string, MockExamMark>();
      marks.forEach((m) => marksMap.set(m.studentId, m));

      const scoredStudents: { studentId: string; marksObtained: number }[] = [];
      marks.forEach((m) => {
        if (!m.isAbsent && m.marksObtained !== null && m.marksObtained !== undefined) {
          scoredStudents.push({ studentId: m.studentId, marksObtained: m.marksObtained });
        }
      });
      scoredStudents.sort((a, b) => b.marksObtained - a.marksObtained);

      const rankMap = new Map<string, number>();
      scoredStudents.forEach((s, idx) => {
        rankMap.set(s.studentId, idx + 1);
      });

      const studentResults = students.map((stu) => {
        const markRecord = marksMap.get(stu.id);
        const marksObtained = markRecord?.marksObtained ?? null;
        const isAbsent = markRecord?.isAbsent ?? false;
        const remarks = markRecord?.remarks ?? "";

        const percentage =
          marksObtained !== null ? Math.round((marksObtained / exam.maxMarks) * 100) : null;
        const grade = calculateGrade(percentage, isAbsent);
        const rank = rankMap.get(stu.id) ?? null;

        return {
          id: stu.id,
          studentCode: stu.studentCode,
          fullName: stu.fullName,
          parentName: stu.parentName,
          parentPhone: stu.parentPhone,
          isFreeCard: stu.isFreeCard,
          marksObtained,
          isAbsent,
          remarks,
          percentage,
          grade,
          rank,
        };
      });

      const validMarks = marks.filter((m) => !m.isAbsent && m.marksObtained !== null);
      const totalMarks = validMarks.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
      const classAverage =
        validMarks.length > 0 ? Math.round((totalMarks / validMarks.length) * 10) / 10 : 0;
      const highestMark =
        validMarks.length > 0 ? Math.max(...validMarks.map((m) => m.marksObtained || 0)) : 0;

      return NextResponse.json({
        success: true,
        exam: {
          id: exam.id,
          title: exam.title,
          examDate: exam.examDate,
          maxMarks: exam.maxMarks,
          classId: exam.classId,
          class: cls
            ? {
                id: cls.id,
                title: cls.title,
                subject: cls.subject,
                grade: cls.grade,
              }
            : {
                id: exam.classId,
                title: "Tuition Class",
                subject: "Subject",
                grade: "Grade",
              },
        },
        students: studentResults,
        stats: {
          totalStudents: students.length,
          enteredCount: marks.length,
          absentCount: marks.filter((m) => m.isAbsent).length,
          classAverage,
          highestMark,
          totalParticipants: scoredStudents.length,
        },
      });
    }
  } catch (error) {
    console.error("[Exam Marks API] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load marks" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["SUPER_ADMIN", "INSTITUTE_ADMIN", "SOLO_TEACHER", "CLASS_ASSISTANT"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { examId } = await params;
    const body = await request.json();

    const validation = BulkSaveMarksSchema.safeParse({
      ...body,
      examId: body.examId || examId,
    });

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : "Invalid marks payload" },
        { status: 400 }
      );
    }

    const { marks } = validation.data;

    try {
      const exam = await prisma.classExam.findFirst({
        where: { id: examId, tenantId: session.tenantId },
      });

      if (!exam) {
        return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
      }

      // Upsert in transaction
      await prisma.$transaction(
        marks.map((m) =>
          prisma.examMark.upsert({
            where: {
              examId_studentId: {
                examId,
                studentId: m.studentId,
              },
            },
            create: {
              tenantId: session.tenantId,
              examId,
              classId: exam.classId,
              studentId: m.studentId,
              marksObtained: m.isAbsent ? null : m.marksObtained ?? null,
              isAbsent: m.isAbsent,
              remarks: m.remarks || null,
            },
            update: {
              marksObtained: m.isAbsent ? null : m.marksObtained ?? null,
              isAbsent: m.isAbsent,
              remarks: m.remarks || null,
            },
          })
        )
      );

      return NextResponse.json({ success: true, count: marks.length });
    } catch {
      // Local dev fallback
      const exam = mockStore.exams.find((e) => e.id === examId);
      if (!exam) {
        return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
      }

      marks.forEach((m) => {
        const existingIdx = mockStore.examMarks.findIndex(
          (em) => em.examId === examId && em.studentId === m.studentId
        );

        if (existingIdx >= 0) {
          mockStore.examMarks[existingIdx] = {
            ...mockStore.examMarks[existingIdx],
            marksObtained: m.isAbsent ? null : m.marksObtained ?? null,
            isAbsent: m.isAbsent,
            remarks: m.remarks || null,
            updatedAt: new Date().toISOString(),
          };
        } else {
          const newMark: MockExamMark = {
            id: "mark-" + crypto.randomBytes(4).toString("hex"),
            tenantId: session.tenantId,
            examId,
            classId: exam.classId,
            studentId: m.studentId,
            marksObtained: m.isAbsent ? null : m.marksObtained ?? null,
            isAbsent: m.isAbsent,
            remarks: m.remarks || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          mockStore.examMarks.push(newMark);
        }
      });

      return NextResponse.json({ success: true, count: marks.length });
    }
  } catch (error) {
    console.error("[Exam Marks API] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to save marks" }, { status: 500 });
  }
}
