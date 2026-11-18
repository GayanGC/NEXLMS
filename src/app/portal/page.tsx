import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function PortalIndexPage() {
  const session = await getSession();

  if (!session) {
    redirect("/#login-card");
  }

  // Route to specific role portal
  switch (session.role) {
    case "SUPER_ADMIN":
    case "INSTITUTE_ADMIN":
      redirect("/portal/admin");
    case "SOLO_TEACHER":
      redirect("/portal/teacher");
    case "MANAGER":
    case "CASHIER":
      redirect("/portal/cashier");
    case "ATTENDANCE_CHECKER":
      redirect("/portal/attendance");
    case "STUDENT":
      redirect("/portal/student");
    case "PARENT":
      redirect("/parent/STU-1041");
    default:
      redirect("/portal/admin");
  }
}
