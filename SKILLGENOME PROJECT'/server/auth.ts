import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./db";

export const JWT_SECRET = process.env.JWT_SECRET || "skillgenome_secret_quantum_signature_99x";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "skillgenome_refresh_quantum_signature_11z";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// 1. Password Helper Functions
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 2. Token Helpers
export function generateAccessToken(payload: { id: string; email: string; username: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function generateRefreshToken(payload: { id: string; email: string; username: string }) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

// 3. Authentication Middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token missing from authorization header." });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired access token." });
    }
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    };
    next();
  });
}

// 4. Activity Tracker Helper
export async function logActivity(userId: string, action: string, ip: string, device: string, status: "SUCCESS" | "FAILED" | "SUSPICIOUS") {
  try {
    // We can save simple audits inside User achievements or print to stdout securely
    console.log(`[AUDIT EVENT] User: ${userId} | Action: ${action} | IP: ${ip} | UserAgent: ${device} | Status: ${status}`);
  } catch (e) {
    console.error("Failed to log activity event:", e);
  }
}
