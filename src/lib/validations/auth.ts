import { z } from "zod";

// MongoDB ObjectId validation regex (strict 24-character hexadecimal)
export const MongoIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid identifier format");

export const TenantTypeEnum = z.enum(["SOLO_TEACHER", "INSTITUTE", "HYBRID_OWNER"]);

export const RoleEnum = z.enum([
  "SUPER_ADMIN",
  "INSTITUTE_ADMIN",
  "SOLO_TEACHER",
  "MANAGER",
  "CASHIER",
  "ATTENDANCE_CHECKER",
  "STUDENT",
  "PARENT",
]);

export const AccountStatusEnum = z.enum(["ACTIVE", "ARCHIVED", "DELETED"]);

// Phone normalization helper for Sri Lankan numbers (+947xxxxxxxx or 07xxxxxxxx)
export function normalizeSriLankanPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("94") && cleaned.length === 11) {
    return "0" + cleaned.slice(2);
  }
  if (cleaned.length === 9 && cleaned.startsWith("7")) {
    return "0" + cleaned;
  }
  return cleaned;
}

// Onboarding & Registration Schema
export const RegisterSchema = z
  .object({
    instituteName: z
      .string()
      .trim()
      .min(2, "Class / Institute name must be at least 2 characters")
      .max(100, "Class / Institute name cannot exceed 100 characters")
      .optional(),
    instituteOrClassName: z
      .string()
      .trim()
      .min(2, "Class / Institute name must be at least 2 characters")
      .max(100, "Class / Institute name cannot exceed 100 characters")
      .optional(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, "Custom URL slug must be at least 2 characters")
      .max(50, "Slug cannot exceed 50 characters")
      .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and dashes")
      .optional(),
    tenantType: TenantTypeEnum.optional(),
    accountType: TenantTypeEnum.optional(),
    studentScale: z.string().trim().min(1, "Please select an operational student scale"),
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .trim()
      .min(9, "Phone number is too short")
      .max(15, "Phone number is too long")
      .refine((val) => {
        const normalized = normalizeSriLankanPhone(val);
        return /^07[01245678]\d{7}$/.test(normalized);
      }, "Please provide a valid Sri Lankan mobile number (e.g., 077 123 4567)"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password cannot exceed 100 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)/,
        "Password must contain at least one letter and one number"
      ),
  })
  .refine(
    (data) => Boolean(data.instituteName || data.instituteOrClassName),
    {
      message: "Class / Institute name is required and must be at least 2 characters",
      path: ["instituteOrClassName"],
    }
  );

export type RegisterInput = z.infer<typeof RegisterSchema>;

// Login Schema
export const LoginSchema = z.object({
  phoneOrEmail: z
    .string()
    .trim()
    .min(3, "Please enter your phone number or email")
    .max(100, "Input cannot exceed 100 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password cannot exceed 100 characters"),
  tenantSlug: z
    .string()
    .trim()
    .toLowerCase()
    .max(50, "Tenant slug is too long")
    .optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// Staff Archiving Schema (30-day grace period handover)
export const ArchiveStaffSchema = z.object({
  userId: MongoIdSchema,
  reason: z
    .string()
    .trim()
    .min(3, "Please provide an archiving reason (e.g. shift transition)")
    .max(300, "Archiving reason cannot exceed 300 characters"),
  gracePeriodDays: z.number().int().min(1).max(90).default(30),
});

export type ArchiveStaffInput = z.infer<typeof ArchiveStaffSchema>;

// Staff Restore Schema
export const RestoreStaffSchema = z.object({
  userId: MongoIdSchema,
});

export type RestoreStaffInput = z.infer<typeof RestoreStaffSchema>;
