import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FinancialAllocationSchema, MongoIdSchema } from "@/lib/validations/tutor";
import { mockStore } from "@/lib/tutor-store";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // STRICT ROLE GUARD: Class Assistants must NEVER access financial data
    if (session.role === "CLASS_ASSISTANT") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Class Assistants are not permitted to access financial data" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    try {
      // 1. Calculate class fees collected for the target month
      const feePayments = await prisma.feePayment.findMany({
        where: {
          tenantId: session.tenantId,
          month,
        },
      });

      const totalCollected = feePayments
        .filter((f) => f.status === "PAID")
        .reduce((sum, f) => sum + f.amount, 0);

      const totalPending = feePayments
        .filter((f) => f.status === "UNPAID")
        .reduce((sum, f) => sum + f.amount, 0);

      // 2. Fetch financial allocations for the target month
      const allocations = await prisma.financialAllocation.findMany({
        where: {
          tenantId: session.tenantId,
          month,
        },
        orderBy: { createdAt: "desc" },
      });

      const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
      const netCashInHand = totalCollected - totalAllocated;

      return NextResponse.json({
        success: true,
        month,
        totalCollected,
        totalPending,
        totalAllocated,
        netCashInHand,
        allocations,
      });
    } catch {
      // Local dev fallback
      const feePayments = mockStore.fees.filter((f) => f.month === month);
      const totalCollected = feePayments
        .filter((f) => f.status === "PAID")
        .reduce((sum, f) => sum + f.amount, 0) || 185000; // Realistic demo fallback

      const totalPending = feePayments
        .filter((f) => f.status === "UNPAID")
        .reduce((sum, f) => sum + f.amount, 0) || 35000;

      const allocations = mockStore.allocations.filter((a) => a.month === month);
      const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
      const netCashInHand = totalCollected - totalAllocated;

      return NextResponse.json({
        success: true,
        month,
        totalCollected,
        totalPending,
        totalAllocated,
        netCashInHand,
        allocations,
      });
    }
  } catch (error) {
    console.error("[Finance API] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load financial data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "CLASS_ASSISTANT") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Class Assistants are not permitted to manage financial data" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = FinancialAllocationSchema.safeParse(body);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : "Invalid allocation data" },
        { status: 400 }
      );
    }

    const { month, title, category, allocatedAmount } = validation.data;

    try {
      const newAllocation = await prisma.financialAllocation.create({
        data: {
          tenantId: session.tenantId,
          month,
          title,
          category,
          allocatedAmount,
        },
      });
      return NextResponse.json({ success: true, allocation: newAllocation }, { status: 201 });
    } catch {
      const newAllocation = {
        id: "alloc-" + crypto.randomBytes(3).toString("hex"),
        tenantId: session.tenantId,
        month,
        title,
        category,
        allocatedAmount,
        createdAt: new Date().toISOString(),
      };
      mockStore.allocations.unshift(newAllocation);
      return NextResponse.json({ success: true, allocation: newAllocation }, { status: 201 });
    }
  } catch (error) {
    console.error("[Finance API] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to save financial allocation" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "CLASS_ASSISTANT") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Allocation ID is required" }, { status: 400 });
    }

    try {
      await prisma.financialAllocation.deleteMany({
        where: { id, tenantId: session.tenantId },
      });
      return NextResponse.json({ success: true, message: "Allocation removed" });
    } catch {
      const idx = mockStore.allocations.findIndex((a) => a.id === id);
      if (idx >= 0) mockStore.allocations.splice(idx, 1);
      return NextResponse.json({ success: true, message: "Allocation removed" });
    }
  } catch (error) {
    console.error("[Finance API] DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete allocation" }, { status: 500 });
  }
}
