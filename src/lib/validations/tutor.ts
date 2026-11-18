import { z } from "zod";
import { normalizeSriLankanPhone } from "./auth";

// Strict MongoDB ObjectId validation
export const MongoIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid identifier format");

// 1. Tuition Class Validation
export const TuitionClassSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Class title must be at least 2 characters")
    .max(100, "Title is too long"),
  subject: z
    .string()
    .trim()
    .min(2, "Subject is required")
    .max(50, "Subject is too long"),
  grade: z
    .string()
    .trim()
    .min(1, "Grade is required")
    .max(30, "Grade is too long"),
  monthlyFee: z
    .number()
    .min(0, "Monthly fee cannot be negative")
    .max(1000000, "Monthly fee exceeds maximum threshold"),
  scheduleText: z
    .string()
    .trim()
    .min(3, "Schedule description is required")
    .max(100, "Schedule is too long"),
  enableTutes: z.boolean().default(false),
  activeNotice: z
    .string()
    .trim()
    .max(300, "Notice cannot exceed 300 characters")
    .optional()
    .nullable(),
});

export type TuitionClassInput = z.infer<typeof TuitionClassSchema>;

// 2. Student Enrollment Validation
export const StudentSchema = z.object({
  classId: MongoIdSchema,
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
  parentName: z
    .string()
    .trim()
    .max(100, "Parent name is too long")
    .optional()
    .nullable(),
  parentPhone: z
    .string()
    .trim()
    .min(9, "Phone number is too short")
    .max(15, "Phone number is too long")
    .refine((val) => {
      const normalized = normalizeSriLankanPhone(val);
      return /^07[01245678]\d{7}$/.test(normalized);
    }, "Please provide a valid Sri Lankan mobile number (e.g. 077 123 4567)"),
  isFreeCard: z.boolean().default(false),
});

export type StudentInput = z.infer<typeof StudentSchema>;

// 3. Attendance Batch Validation
export const AttendanceBatchSchema = z.object({
  classId: MongoIdSchema,
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be formatted as YYYY-MM-DD"),
  records: z.array(
    z.object({
      studentId: MongoIdSchema,
      status: z.enum(["PRESENT", "ABSENT"]),
      method: z.enum(["MANUAL_TAP", "QR_SCAN"]).default("MANUAL_TAP"),
    })
  ),
});

export type AttendanceBatchInput = z.infer<typeof AttendanceBatchSchema>;

// 4. Fee Toggle Validation
export const FeeToggleSchema = z.object({
  classId: MongoIdSchema,
  studentId: MongoIdSchema,
  month: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, "Month must be formatted as YYYY-MM"),
  status: z.enum(["PAID", "UNPAID"]),
  amount: z.number().min(0, "Amount cannot be negative"),
});

export type FeeToggleInput = z.infer<typeof FeeToggleSchema>;

// 5. Class Tute Validation
export const ClassTuteSchema = z.object({
  classId: MongoIdSchema,
  title: z
    .string()
    .trim()
    .min(2, "Tute title is required")
    .max(120, "Title is too long"),
  month: z
    .string()
    .trim()
    .min(2, "Target month or unit is required")
    .max(50, "Month/unit is too long"),
  fileUrl: z
    .string()
    .trim()
    .url("Please provide a valid file download link or URL"),
});

export type ClassTuteInput = z.infer<typeof ClassTuteSchema>;

// 6. Tute Access Request Action Validation
export const TuteRequestActionSchema = z.object({
  requestId: MongoIdSchema,
  status: z.enum(["APPROVED", "REJECTED"]),
});

export type TuteRequestActionInput = z.infer<typeof TuteRequestActionSchema>;

// 7. Financial Allocation Validation
export const FinancialAllocationSchema = z.object({
  month: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, "Month must be formatted as YYYY-MM"),
  title: z
    .string()
    .trim()
    .min(2, "Allocation title is required")
    .max(100, "Title is too long"),
  category: z.enum(["CLASS_EXPENSE", "PERSONAL_GOAL", "SAVINGS"]),
  allocatedAmount: z
    .number()
    .min(1, "Amount must be at least 1 LKR")
    .max(10000000, "Amount exceeds limit"),
});

export type FinancialAllocationInput = z.infer<typeof FinancialAllocationSchema>;

// 8. Parent Appointment & Summon Validation
export const ParentAppointmentSchema = z.object({
  classId: MongoIdSchema,
  studentId: MongoIdSchema,
  initiatedBy: z.enum(["PARENT", "TEACHER"]),
  requestedDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  confirmedDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional()
    .nullable(),
  confirmedTime: z
    .string()
    .trim()
    .max(30, "Time string too long")
    .optional()
    .nullable(),
  reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters")
    .max(300, "Reason is too long"),
  teacherNote: z
    .string()
    .trim()
    .max(300, "Teacher note is too long")
    .optional()
    .nullable(),
  status: z
    .enum(["PENDING", "APPROVED", "RESCHEDULED", "COMPLETED"])
    .default("PENDING"),
});

export type ParentAppointmentInput = z.infer<typeof ParentAppointmentSchema>;

// 9. Class Assistant Provisioning Validation
export const ClassAssistantSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
  phone: z
    .string()
    .trim()
    .min(9, "Phone number is too short")
    .max(15, "Phone number is too long")
    .refine((val) => {
      const normalized = normalizeSriLankanPhone(val);
      return /^07[01245678]\d{7}$/.test(normalized);
    }, "Please provide a valid Sri Lankan mobile number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  permissions: z
    .array(z.enum(["ATTENDANCE", "FEES", "TUTES"]))
    .min(1, "Please select at least one permission"),
});

export type ClassAssistantInput = z.infer<typeof ClassAssistantSchema>;

// 10. Parent Verification Schema
export const ParentVerifySchema = z.object({
  studentCode: z
    .string()
    .trim()
    .min(3, "Student code is required")
    .max(20, "Student code is too long"),
  last4Phone: z
    .string()
    .trim()
    .length(4, "Please enter exactly the last 4 digits of the registered parent phone number")
    .regex(/^\d{4}$/, "Last 4 digits must contain numbers only"),
});

export type ParentVerifyInput = z.infer<typeof ParentVerifySchema>;

// 11. Create Exam Schema
export const CreateExamSchema = z.object({
  classId: MongoIdSchema,
  title: z
    .string()
    .trim()
    .min(2, "Exam title must be at least 2 characters")
    .max(100, "Title is too long"),
  examDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Exam date must be formatted as YYYY-MM-DD"),
  maxMarks: z
    .number()
    .min(1, "Maximum marks must be greater than 0")
    .max(1000, "Maximum marks cannot exceed 1000")
    .default(100),
});

export type CreateExamInput = z.infer<typeof CreateExamSchema>;

// 12. Bulk Save Marks Schema
export const BulkSaveMarksSchema = z.object({
  examId: MongoIdSchema,
  marks: z
    .array(
      z.object({
        studentId: MongoIdSchema,
        marksObtained: z.number().min(0, "Marks cannot be negative").nullable().optional(),
        isAbsent: z.boolean().default(false),
        remarks: z.string().trim().max(200, "Remarks too long").optional().nullable(),
      })
    )
    .min(1, "At least one student mark record is required"),
});

export type BulkSaveMarksInput = z.infer<typeof BulkSaveMarksSchema>;
