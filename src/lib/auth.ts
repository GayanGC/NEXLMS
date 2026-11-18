import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Role, TenantType } from "@prisma/client";

export const AUTH_COOKIE_NAME = "nexlms_token";

// Production Security Guard: Refuse fallback secret in production
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error(
    "CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET environment variable is missing in production environment."
  );
}

const rawSecret = (process.env.JWT_SECRET || "nexlms-secure-jwt-signing-key-production-sri-lanka-2026-edtech")
  .replace(/^["']|["']$/g, "")
  .trim();

const SECRET_KEY = new TextEncoder().encode(rawSecret);

export interface TokenPayload {
  userId: string;
  tenantId: string;
  role: Role;
  tenantSlug: string;
  tenantType: TenantType;
  fullName: string;
  phone: string;
  sessionId?: string;
  [key: string]: unknown;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT signing & verification (compatible with Node runtime & Edge middleware)
export async function signJWT(payload: TokenPayload, expiresIn: string = "7d"): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_KEY);
}

export async function verifyJWT(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// Session helper for Server Components & Route Handlers
export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJWT(token);
  } catch {
    return null;
  }
}

// Strict Cookie Security configuration
export function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}
