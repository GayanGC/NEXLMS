// Shared in-memory mock store for Solo Tutor development & local fallback testing

export interface MockTuitionClass {
  id: string;
  tenantId: string;
  title: string;
  subject: string;
  grade: string;
  monthlyFee: number;
  scheduleText: string;
  enableTutes: boolean;
  activeNotice?: string | null;
  createdAt: string;
}

export interface MockStudent {
  id: string;
  tenantId: string;
  classId: string;
  studentCode: string;
  fullName: string;
  parentName?: string | null;
  parentPhone: string;
  isFreeCard: boolean;
  createdAt: string;
}

export interface MockAttendanceRecord {
  id: string;
  tenantId: string;
  classId: string;
  studentId: string;
  date: string;
  status: "PRESENT" | "ABSENT";
  method: "MANUAL_TAP" | "QR_SCAN";
  createdAt: string;
}

export interface MockFeePayment {
  id: string;
  tenantId: string;
  classId: string;
  studentId: string;
  month: string;
  amount: number;
  status: "PAID" | "UNPAID";
  paidAt?: string | null;
}

export interface MockClassTute {
  id: string;
  tenantId: string;
  classId: string;
  title: string;
  month: string;
  fileUrl: string;
  createdAt: string;
}

export interface MockTuteRequest {
  id: string;
  tenantId: string;
  classId: string;
  studentId: string;
  tuteId: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface MockFinancialAllocation {
  id: string;
  tenantId: string;
  month: string;
  title: string;
  category: "CLASS_EXPENSE" | "PERSONAL_GOAL" | "SAVINGS";
  allocatedAmount: number;
  createdAt: string;
}

export interface MockParentAppointment {
  id: string;
  tenantId: string;
  classId: string;
  studentId: string;
  initiatedBy: "PARENT" | "TEACHER";
  requestedDate: string;
  confirmedDate?: string | null;
  confirmedTime?: string | null;
  reason: string;
  teacherNote?: string | null;
  status: "PENDING" | "APPROVED" | "RESCHEDULED" | "COMPLETED";
  createdAt: string;
}

export interface MockClassAssistant {
  id: string;
  tenantId: string;
  fullName: string;
  phone: string;
  permissions: ("ATTENDANCE" | "FEES" | "TUTES")[];
  createdAt: string;
}

export interface MockClassExam {
  id: string;
  tenantId: string;
  classId: string;
  title: string;
  examDate: string;
  maxMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockExamMark {
  id: string;
  tenantId: string;
  examId: string;
  classId: string;
  studentId: string;
  marksObtained: number | null;
  isAbsent: boolean;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Global In-Memory Singleton
const globalStore = globalThis as unknown as {
  mockClasses?: MockTuitionClass[];
  mockStudents?: MockStudent[];
  mockAttendance?: MockAttendanceRecord[];
  mockFees?: MockFeePayment[];
  mockTutes?: MockClassTute[];
  mockTuteRequests?: MockTuteRequest[];
  mockAllocations?: MockFinancialAllocation[];
  mockAppointments?: MockParentAppointment[];
  mockAssistants?: MockClassAssistant[];
  mockExams?: MockClassExam[];
  mockExamMarks?: MockExamMark[];
};

if (!globalStore.mockClasses) {
  globalStore.mockClasses = [
    {
      id: "673a11111111111111110001",
      tenantId: "673a00010000000000000000",
      title: "Grade 8 - English",
      subject: "English Literature & Grammar",
      grade: "Grade 8",
      monthlyFee: 2500,
      scheduleText: "Sundays 08:30 AM - 11:30 AM",
      enableTutes: true,
      activeNotice: "Unit 3 Mid-term Revision Paper will be discussed this Sunday. Bring all past notes.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "673a11111111111111110002",
      tenantId: "673a00010000000000000000",
      title: "Grade 9 - Maths",
      subject: "Mathematics Theory",
      grade: "Grade 9",
      monthlyFee: 3000,
      scheduleText: "Saturdays 01:30 PM - 04:30 PM",
      enableTutes: false,
      activeNotice: null,
      createdAt: new Date().toISOString(),
    },
  ];
}

if (!globalStore.mockStudents) {
  globalStore.mockStudents = [
    {
      id: "673a22222222222222220001",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001",
      studentCode: "STU-1041",
      fullName: "Kasun Sandaruwan",
      parentName: "Nihal Sandaruwan",
      parentPhone: "077 123 4567",
      isFreeCard: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "673a22222222222222220002",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001",
      studentCode: "STU-1042",
      fullName: "Dinithi Jayasinghe",
      parentName: "Sunethra Jayasinghe",
      parentPhone: "071 987 6543",
      isFreeCard: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "673a22222222222222220003",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001",
      studentCode: "STU-1043",
      fullName: "Tharindu Perera",
      parentName: "Sarath Perera",
      parentPhone: "075 223 3445",
      isFreeCard: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "673a22222222222222220004",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110002",
      studentCode: "STU-1044",
      fullName: "Anuki Wickramasinghe",
      parentName: "Rohan Wickramasinghe",
      parentPhone: "078 887 7665",
      isFreeCard: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

if (!globalStore.mockFees) {
  globalStore.mockFees = [
    {
      id: "fee-01",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220001",
      month: "2026-11",
      amount: 2500,
      status: "PAID",
      paidAt: new Date().toISOString(),
    },
    {
      id: "fee-02",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220002",
      month: "2026-11",
      amount: 2500,
      status: "UNPAID",
      paidAt: null,
    },
    {
      id: "fee-03",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220003",
      month: "2026-11",
      amount: 0,
      status: "PAID",
      paidAt: new Date().toISOString(),
    },
  ];
}

if (!globalStore.mockAttendance) {
  const today = new Date().toISOString().split("T")[0];
  globalStore.mockAttendance = [
    {
      id: "att-01",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220001",
      date: today,
      status: "PRESENT",
      method: "MANUAL_TAP",
      createdAt: new Date().toISOString(),
    },
    {
      id: "att-02",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220002",
      date: today,
      status: "ABSENT",
      method: "MANUAL_TAP",
      createdAt: new Date().toISOString(),
    },
  ];
}

if (!globalStore.mockTutes) {
  globalStore.mockTutes = [
    {
      id: "673a33333333333333330001",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001",
      title: "Unit 03: Poetry Analysis & Creative Essay Writing",
      month: "November 2026",
      fileUrl: "https://example.com/tutes/g8-english-unit03.pdf",
      createdAt: new Date().toISOString(),
    },
  ];
}

if (!globalStore.mockTuteRequests) {
  globalStore.mockTuteRequests = [
    {
      id: "req-01",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220002",
      tuteId: "673a33333333333333330001",
      reason: "Dinithi was down with viral fever on Sunday and missed the live tutorial discussion.",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    },
  ];
}

if (!globalStore.mockAllocations) {
  globalStore.mockAllocations = [
    {
      id: "alloc-01",
      tenantId: "673a00010000000000000000",
      month: "2026-11",
      title: "Apex Hall Rent (Sundays)",
      category: "CLASS_EXPENSE",
      allocatedAmount: 25000,
      createdAt: new Date().toISOString(),
    },
    {
      id: "alloc-02",
      tenantId: "673a00010000000000000000",
      month: "2026-11",
      title: "Tute & Worksheet Offset Printing",
      category: "CLASS_EXPENSE",
      allocatedAmount: 18500,
      createdAt: new Date().toISOString(),
    },
    {
      id: "alloc-03",
      tenantId: "673a00010000000000000000",
      month: "2026-11",
      title: "Vehicle Lease - Axio 2020",
      category: "PERSONAL_GOAL",
      allocatedAmount: 45000,
      createdAt: new Date().toISOString(),
    },
    {
      id: "alloc-04",
      tenantId: "673a00010000000000000000",
      month: "2026-11",
      title: "Monthly High-Yield Savings",
      category: "SAVINGS",
      allocatedAmount: 30000,
      createdAt: new Date().toISOString(),
    },
  ];
}

if (!globalStore.mockAppointments) {
  globalStore.mockAppointments = [
    {
      id: "app-01",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220002",
      initiatedBy: "PARENT",
      requestedDate: "2026-11-22",
      confirmedDate: "2026-11-22",
      confirmedTime: "11:45 AM (Post-Class)",
      reason: "Discuss Dinithi's midterm essay marks and grammar term improvement.",
      teacherNote: "Please bring her second term school report card.",
      status: "APPROVED",
      createdAt: new Date().toISOString(),
    },
    {
      id: "app-02",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220001",
      initiatedBy: "TEACHER",
      requestedDate: "2026-11-29",
      confirmedDate: "2026-11-29",
      confirmedTime: "11:30 AM",
      reason: "Kasun has missed 2 consecutive homework submissions; discipline alignment needed.",
      teacherNote: "Official Teacher Summon notice issued to Parent Portal.",
      status: "APPROVED",
      createdAt: new Date().toISOString(),
    },
  ];
}

if (!globalStore.mockAssistants) {
  globalStore.mockAssistants = [
    {
      id: "asst-01",
      tenantId: "673a00010000000000000000",
      fullName: "Malith Bandara",
      phone: "077 443 3221",
      permissions: ["ATTENDANCE", "FEES"],
      createdAt: new Date().toISOString(),
    },
  ];
}

if (!globalStore.mockExams) {
  globalStore.mockExams = [
    {
      id: "673a55555555555555550001",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001", // Grade 8 - English
      title: "1st Term Mid Evaluation Test",
      examDate: "2026-11-10",
      maxMarks: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "673a55555555555555550002",
      tenantId: "673a00010000000000000000",
      classId: "673a11111111111111110001", // Grade 8 - English
      title: "Grammar & Vocabulary Spot Test 01",
      examDate: "2026-11-17",
      maxMarks: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

if (!globalStore.mockExamMarks) {
  globalStore.mockExamMarks = [
    // Exam 1
    {
      id: "673a66666666666666660001",
      tenantId: "673a00010000000000000000",
      examId: "673a55555555555555550001",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220001", // Kasun Sandaruwan
      marksObtained: 84,
      isAbsent: false,
      remarks: "Great essay structure and vocabulary usage.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "673a66666666666666660002",
      tenantId: "673a00010000000000000000",
      examId: "673a55555555555555550001",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220002", // Dinithi Jayasinghe
      marksObtained: 92,
      isAbsent: false,
      remarks: "Outstanding performance! Top score in class.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "673a66666666666666660003",
      tenantId: "673a00010000000000000000",
      examId: "673a55555555555555550001",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220003", // Tharindu Perera
      marksObtained: null,
      isAbsent: true,
      remarks: "Absent due to viral flu; medical submitted.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Exam 2
    {
      id: "673a66666666666666660004",
      tenantId: "673a00010000000000000000",
      examId: "673a55555555555555550002",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220001", // Kasun Sandaruwan
      marksObtained: 41,
      isAbsent: false,
      remarks: "Solid understanding of tenses.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "673a66666666666666660005",
      tenantId: "673a00010000000000000000",
      examId: "673a55555555555555550002",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220002", // Dinithi Jayasinghe
      marksObtained: 47,
      isAbsent: false,
      remarks: "Perfect punctuation and spelling.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "673a66666666666666660006",
      tenantId: "673a00010000000000000000",
      examId: "673a55555555555555550002",
      classId: "673a11111111111111110001",
      studentId: "673a22222222222222220003", // Tharindu Perera
      marksObtained: 38,
      isAbsent: false,
      remarks: "Good effort, revise prepositions.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export const mockStore = {
  classes: globalStore.mockClasses,
  students: globalStore.mockStudents,
  attendance: globalStore.mockAttendance,
  fees: globalStore.mockFees,
  tutes: globalStore.mockTutes,
  tuteRequests: globalStore.mockTuteRequests,
  allocations: globalStore.mockAllocations,
  appointments: globalStore.mockAppointments,
  assistants: globalStore.mockAssistants,
  exams: globalStore.mockExams!,
  examMarks: globalStore.mockExamMarks!,
};
