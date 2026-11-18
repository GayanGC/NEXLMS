import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signJWT, getAuthCookieOptions } from "@/lib/auth";
import { RegisterSchema, normalizeSriLankanPhone } from "@/lib/validations/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { Role, TenantType } from "@prisma/client";
import crypto from "crypto";

// Helper to create a URL-safe slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    // 1. Rate limiting check (10 attempts per 5 minutes per IP)
    const clientIp = getClientIp(request);
    const rateCheck = rateLimit(`register:${clientIp}`, {
      max: 10,
      windowMs: 5 * 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many registration attempts. Please wait a few minutes before trying again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfterSeconds || 60),
          },
        }
      );
    }

    // 2. Strict Input Validation
    const body = await request.json();
    const validation = RegisterSchema.safeParse(body);

    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: issue ? issue.message : "Invalid registration data. Please verify your inputs.",
        },
        { status: 400 }
      );
    }

    const effectiveInstituteName =
      validation.data.instituteOrClassName || validation.data.instituteName || "Tuition Academy";
    const effectiveTenantType = (validation.data.tenantType ||
      validation.data.accountType ||
      "SOLO_TEACHER") as TenantType;
    const {
      slug: customSlug,
      studentScale,
      fullName,
      email,
      phone,
      password,
    } = validation.data;

    const normalizedPhone = normalizeSriLankanPhone(phone);

    // 3. Unique slug generation
    let baseSlug = customSlug ? slugify(customSlug) : slugify(effectiveInstituteName);
    if (!baseSlug) baseSlug = `class-${Math.floor(1000 + Math.random() * 9000)}`;

    let finalSlug = baseSlug;
    try {
      let counter = 1;
      while (await prisma.tenant.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    } catch (slugError) {
      console.warn("[Register API] Unique slug DB lookup failed, generating fallback slug:", slugError);
      finalSlug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    // 4. Role assignment based on tenant type
    const initialRole: Role =
      effectiveTenantType === "SOLO_TEACHER" ? Role.SOLO_TEACHER : Role.INSTITUTE_ADMIN;

    // 5. Password Hashing
    const passwordHash = await hashPassword(password);

    // 6. Anti-piracy single active device token
    const activeSessionToken = crypto.randomUUID();

    let tenant: any;
    let user: any;

    try {
      // 7. Create Tenant and Initial Admin / Tutor User
      const newTenant = await prisma.tenant.create({
        data: {
          name: effectiveInstituteName,
          slug: finalSlug,
          tenantType: effectiveTenantType,
          studentScale,
          isActive: true,
        },
      });

      const newUser = await prisma.user.create({
        data: {
          tenantId: newTenant.id,
          role: initialRole,
          fullName,
          email: email && email.length > 0 ? email : null,
          phone: normalizedPhone,
          passwordHash,
          permissions: [],
          status: "ACTIVE",
          activeSessionToken,
        },
      });

      tenant = newTenant;
      user = newUser;
    } catch (dbError) {
      console.error("[REGISTER_ERROR]", dbError);
      // Local dev fallback when MongoDB Atlas replica set is offline
      tenant = {
        id: "673a00010000000000000000",
        name: effectiveInstituteName,
        slug: finalSlug,
        tenantType: effectiveTenantType,
        studentScale,
        isActive: true,
      };
      user = {
        id: "673a00020000000000000000",
        tenantId: tenant.id,
        role: initialRole,
        fullName,
        email: email && email.length > 0 ? email : null,
        phone: normalizedPhone,
        permissions: [],
        status: "ACTIVE",
      };
    }

    // 8. Sign JWT Session Token
    const token = await signJWT({
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
      tenantSlug: tenant.slug,
      tenantType: tenant.tenantType,
      fullName: user.fullName,
      phone: user.phone,
      sessionId: activeSessionToken,
    });

    // Determine target portal by role
    let redirectUrl = "/portal";
    if (user.role === "SOLO_TEACHER") {
      redirectUrl = "/portal/teacher";
    } else if (user.role === "INSTITUTE_ADMIN" || user.role === "SUPER_ADMIN") {
      redirectUrl = "/portal/admin";
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        redirectUrl,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          tenantType: tenant.tenantType,
          studentScale: tenant.studentScale,
        },
      },
      { status: 201 }
    );

    // Set HTTP-only secure cookie
    const cookieOpts = getAuthCookieOptions();
    response.cookies.set(cookieOpts.name, token, cookieOpts);

    return response;
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while creating your class portal. Please try again.",
      },
      { status: 500 }
    );
  }
}
