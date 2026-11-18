import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateExamSchema } from "@/lib/validations/tutor";
import { mockStore, MockClassExam } from "@/lib/tutor-store";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["SUPER_ADMIN", "INSTITUTE_ADMIN", "SOLO_TEACHER", "CLASS_ASSISTANT"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filterClassId = searchParams.get("classId");

    try {
      const exams = await prisma.classExam.findMany({
        where: {
          tenantId: session.tenantId,
          ...(filterClassId ? { classId: filterClassId } : {}),
        },
        include: {
          class: true,
          marks: {
            include: {
              student: true,
            },
          },
        },
        orderBy: { examDate: "desc" },
      });

      const enriched = await Promise.all(
        exams.map(async (exam) => {
          const totalStudents = await prisma.student.count({
            where: { classId: exam.classId, tenantId: session.tenantId },
          });

          const validMarks = exam.marks.filter(
            (m) => !m.isAbsent && m.marksObtained !== null && m.marksObtained !== undefined
          );

          const totalObtained = validMarks.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
          const classAverage = validMarks.length > 0 ? Math.round((totalObtained / validMarks.length) * 10) / 10 : 0;
          const highestMark = validMarks.length > 0 ? Math.max(...validMarks.map((m) => m.marksObtained || 0)) : 0;

          return {
            id: exam.id,
            tenantId: exam.tenantId,
            classId: exam.classId,
            title: exam.title,
            examDate: exam.examDate,
            maxMarks: exam.maxMarks,
            createdAt: exam.createdAt,
            class: {
              id: exam.class.id,
              title: exam.class.title,
              subject: exam.class.subject,
              grade: exam.class.grade,
            },
            totalStudents,
            marksEnteredCount: exam.marks.length,
            classAverage,
            highestMark,
          };
        })
      );

      return NextResponse.json({ success: true, exams: enriched });
    } catch {
      // Local dev fallback
      const exams = mockStore.exams.filter(
        (e) =>
          (e.tenantId === session.tenantId || true) &&
          (!filterClassId || e.classId === filterClassId)
      );

      const enriched = exams.map((exam) => {
        const cls = mockStore.classes.find((c) => c.id === exam.classId);
        const enrolledStudents = mockStore.students.filter((s) => s.classId === exam.classId);
        const marks = mockStore.examMarks.filter((m) => m.examId === exam.id);

        const validMarks = marks.filter(
          (m) => !m.isAbsent && m.marksObtained !== null && m.marksObtained !== undefined
        );

        const totalObtained = validMarks.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
        const classAverage = validMarks.length > 0 ? Math.round((totalObtained / validMarks.length) * 10) / 10 : 0;
        const highestMark = validMarks.length > 0 ? Math.max(...validMarks.map((m) => m.marksObtained || 0)) : 0;

        return {
          id: exam.id,
          tenantId: exam.tenantId,
          classId: exam.classId,
          title: exam.title,
          examDate: exam.examDate,
          maxMarks: exam.maxMarks,
          createdAt: exam.createdAt,
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
          totalStudents: enrolledStudents.length,
          marksEnteredCount: marks.length,
          classAverage,
          highestMark,
        };
      });

      return NextResponse.json({ success: true, exams: enriched });
    }
  } catch (error) {
    console.error("[Exams API] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load exams" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["SUPER_ADMIN", "INSTITUTE_ADMIN", "SOLO_TEACHER", "CLASS_ASSISTANT"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = CreateExamSchema.safeParse(body);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : "Invalid exam payload" },
        { status: 400 }
      );
    }

    const { classId, title, examDate, maxMarks } = validation.data;

    try {
      const exam = await prisma.classExam.create({
        data: {
          tenantId: session.tenantId,
          classId,
          title,
          examDate,
          maxMarks,
        },
        include: {
          class: true,
        },
      });

      return NextResponse.json({ success: true, exam }, { status: 201 });
    } catch {
      // Local dev fallback
      const exam: MockClassExam = {
        id: "exam-" + crypto.randomBytes(4).toString("hex"),
        tenantId: session.tenantId,
        classId,
        title,
        examDate,
        maxMarks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockStore.exams.unshift(exam);
      const cls = mockStore.classes.find((c) => c.id === classId);

      return NextResponse.json(
        {
          success: true,
          exam: {
            ...exam,
            class: cls || { id: classId, title: "Class", subject: "Subject", grade: "Grade" },
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("[Exams API] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create exam" }, { status: 500 });
  }
}
