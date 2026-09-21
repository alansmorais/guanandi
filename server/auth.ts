/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Backend Authentication & Dual-Level Access Control (ADMIN & DEVELOPER)
 * - Hashes and checks credentials exclusively on the server side
 * - Zero credentials or hashes exposed to the client
 * - Enforces strict role isolation: ADMIN cannot access DEVELOPER features
 */

import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: "admin" | "developer";
  createdAt: number;
  lastActive: number;
}

export interface UserRolePermissions {
  reservations: boolean;
  clients: boolean;
  products: boolean;
  prices: boolean;
  basicSettings: boolean;
  technicalSettings: boolean;
  developerConsole: boolean;
  systemMaintenance: boolean;
}

export const ROLE_PERMISSIONS: Record<"admin" | "developer", UserRolePermissions> = {
  admin: {
    reservations: true,
    clients: true,
    products: true,
    prices: true,
    basicSettings: true,
    technicalSettings: false,
    developerConsole: false,
    systemMaintenance: false,
  },
  developer: {
    reservations: true,
    clients: true,
    products: true,
    prices: true,
    basicSettings: true,
    technicalSettings: true,
    developerConsole: true,
    systemMaintenance: true,
  },
};

// In-memory token store (Token -> SessionUser)
const activeSessions = new Map<string, SessionUser>();

// Salt for PBKDF2 hashing
const SYSTEM_SALT = process.env.SYSTEM_AUTH_SALT || "guanandi_secure_production_salt_2026";

export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SYSTEM_SALT, 10000, 64, "sha512").toString("hex");
}

export function getExpectedCredentials() {
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "GuanandiAdmin@2026";

  const devUsername = (process.env.DEVELOPER_USERNAME || "developer").trim().toLowerCase();
  const devPassword = process.env.DEVELOPER_PASSWORD || "GuanandiDev@2026";

  return {
    admin: {
      username: adminUsername,
      passwordHash: hashPassword(adminPassword),
      name: "Administrador Operacional",
      role: "admin" as const,
    },
    developer: {
      username: devUsername,
      passwordHash: hashPassword(devPassword),
      name: "Engenheiro Desenvolvedor (ASM)",
      role: "developer" as const,
    },
  };
}

export function authenticateUser(
  usernameInput: string,
  passwordInput: string,
  targetRole?: "admin" | "developer"
): { success: boolean; user?: SessionUser; token?: string; error?: string } {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const inputHash = hashPassword(passwordInput);
  const creds = getExpectedCredentials();

  let matchedRole: "admin" | "developer" | null = null;
  let matchedName = "";

  if (cleanUsername === creds.developer.username && inputHash === creds.developer.passwordHash) {
    if (targetRole && targetRole !== "developer") {
      return { success: false, error: "Credenciais de desenvolvedor não são aceitas para login de admin comum." };
    }
    matchedRole = "developer";
    matchedName = creds.developer.name;
  } else if (cleanUsername === creds.admin.username && inputHash === creds.admin.passwordHash) {
    if (targetRole && targetRole === "developer") {
      return { success: false, error: "Acesso negado: O usuário ADMIN não possui autorização técnica de DEVELOPER." };
    }
    matchedRole = "admin";
    matchedName = creds.admin.name;
  }

  if (!matchedRole) {
    return { success: false, error: "Usuário ou senha incorretos." };
  }

  const token = "gn_tok_" + crypto.randomBytes(32).toString("hex");
  const sessionUser: SessionUser = {
    id: cleanUsername,
    username: cleanUsername,
    name: matchedName,
    role: matchedRole,
    createdAt: Date.now(),
    lastActive: Date.now(),
  };

  activeSessions.set(token, sessionUser);

  return {
    success: true,
    user: sessionUser,
    token,
  };
}

export function getSessionFromToken(token: string): SessionUser | null {
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;

  // Check expiration: 24 hours
  const SESSION_MAX_AGE = 24 * 60 * 60 * 1000;
  if (Date.now() - session.lastActive > SESSION_MAX_AGE) {
    activeSessions.delete(token);
    return null;
  }

  session.lastActive = Date.now();
  return session;
}

export function revokeSession(token: string): void {
  activeSessions.delete(token);
}

// Express Auth Middleware
export interface AuthenticatedRequest extends Request {
  user?: SessionUser;
}

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  return null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Token de autenticação não fornecido." });
  }

  const session = getSessionFromToken(token);
  if (!session) {
    return res.status(401).json({ error: "Sessão expirada ou inválida. Faça login novamente." });
  }

  req.user = session;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "developer")) {
      return res.status(403).json({ error: "Acesso restrito a administradores." });
    }
    next();
  });
}

export function requireDeveloper(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: "Autenticação necessária." });
    }
    if (req.user.role !== "developer") {
      return res.status(403).json({
        error: "Acesso negado: Este recurso requer privilégios exclusivos de DEVELOPER. Usuários ADMIN não possuem acesso.",
      });
    }
    next();
  });
}
