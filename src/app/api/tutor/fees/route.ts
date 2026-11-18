import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FeeToggleSchema } from "@/lib/validations/tutor";
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
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    if (!classId) {
      return NextResponse.json({ success: false, error: "classId parameter is required" }, { status: 400 });
    }

    try {
      const fees = await prisma.feePayment.findMany({
        where: {
          tenantId: session.tenantId,
          classId,
          month,
        },
        include: {
          student: true,
        },
      });
      return NextResponse.json({ success: true, month, fees });
    } catch {
      const fees = mockStore.fees.filter((f) => f.classId === classId && f.month === month);
      return NextResponse.json({ success: true, month, fees });
    }
  } catch (error) {
    console.error("[Fees API] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load fee payments" }, { status: 500 });
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
      if (!perms.includes("FEES")) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You do not have permission to manage fees" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validation = FeeToggleSchema.safeParse(body);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : "Invalid fee toggle payload" },
        { status: 400 }
      );
    }

    const { classId, studentId, month, status, amount } = validation.data;
    const paidAt = status === "PAID" ? new Date() : null;

    try {
      const updatedFee = await prisma.feePayment.upsert({
        where: {
          studentId_classId_month: {
            studentId,
            classId,
            month,
          },
        },
        update: {
          status,
          amount,
          paidAt,
        },
        create: {
          tenantId: session.tenantId,
          classId,
          studentId,
          month,
          amount,
          status,
          paidAt,
        },
      });

      return NextResponse.json({ success: true, fee: updatedFee });
    } catch {
      // Local dev fallback
      const existingIdx = mockStore.fees.findIndex(
        (f) => f.classId === classId && f.studentId === studentId && f.month === month
      );

      if (existingIdx >= 0) {
        mockStore.fees[existingIdx].status = status;
        mockStore.fees[existingIdx].amount = amount;
        mockStore.fees[existingIdx].paidAt = status === "PAID" ? new Date().toISOString() : null;
      } else {
        mockStore.fees.push({
          id: "fee-" + crypto.randomBytes(3).toString("hex"),
          tenantId: session.tenantId,
          classId,
          studentId,
          month,
          amount,
          status,
          paidAt: status === "PAID" ? new Date().toISOString() : null,
        });
      }

      return NextResponse.json({ success: true, message: "Fee payment status updated" });
    }
  } catch (error) {
    console.error("[Fees API] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to update fee payment" }, { status: 500 });
  }
}
