/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Camada de Integração Frontend <-> Backend Express (API Client)
 * - Nenhuma senha exposta no frontend
 * - Proteção com token de sessão (sessionStorage / headers)
 * - Comunicação estrita com as rotas do servidor
 */

import { Reservation } from "../types";

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: "admin" | "developer";
}

export interface UserRolePermissions {
  canManageReservations: boolean;
  canManageProducts: boolean;
  canViewReports: boolean;
  canAccessDeveloperConsole: boolean;
  canManageServerSettings: boolean;
}

const TOKEN_KEY = "guanandi_auth_token";

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // noop
  }
}

export function clearStoredToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // noop
  }
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// 1. Criar Reserva (Público)
export async function submitReservationToApi(data: Partial<Reservation>): Promise<{
  success: boolean;
  reservation?: Reservation;
  adminEmailTarget?: string;
  error?: string;
}> {
  try {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || "Erro ao registrar reserva." };
    }

    return {
      success: true,
      reservation: json.reservation,
      adminEmailTarget: json.adminEmailTarget,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Falha na comunicação com o servidor." };
  }
}

// 2. Login Seguro no Backend (ADMIN ou DEVELOPER)
export async function loginToBackend(
  username: string,
  password: string,
  targetRole?: "admin" | "developer"
): Promise<{
  success: boolean;
  token?: string;
  user?: SessionUser;
  permissions?: UserRolePermissions;
  error?: string;
}> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, targetRole }),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || "Falha na autenticação." };
    }

    if (json.token) {
      setStoredToken(json.token);
    }

    return {
      success: true,
      token: json.token,
      user: json.user,
      permissions: json.permissions,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro de conexão ao servidor." };
  }
}

// 3. Obter Sessão Atual
export async function fetchCurrentSession(): Promise<{
  user: SessionUser | null;
  permissions: UserRolePermissions | null;
}> {
  const token = getStoredToken();
  if (!token) return { user: null, permissions: null };

  try {
    const res = await fetch("/api/auth/me", {
      headers: authHeaders(),
    });
    if (!res.ok) {
      clearStoredToken();
      return { user: null, permissions: null };
    }
    const json = await res.json();
    return { user: json.user, permissions: json.permissions };
  } catch {
    return { user: null, permissions: null };
  }
}

// 4. Logout
export async function logoutFromBackend(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: authHeaders(),
    });
  } finally {
    clearStoredToken();
  }
}

// 5. Gestão de Reservas (ADMIN & DEVELOPER)
export async function fetchAdminReservations(params?: {
  status?: string;
  search?: string;
  date?: string;
}): Promise<{ reservations: Reservation[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "todos") query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.date) query.set("date", params.date);

    const res = await fetch(`/api/admin/reservations?${query.toString()}`, {
      headers: authHeaders(),
    });
    if (!res.ok) return { reservations: [], total: 0 };
    const json = await res.json();
    return {
      reservations: json.reservations || [],
      total: json.total || 0,
    };
  } catch {
    return { reservations: [], total: 0 };
  }
}

export async function updateReservationStatusApi(
  id: string,
  status: Reservation["status"]
): Promise<{ success: boolean; reservation?: Reservation; error?: string }> {
  try {
    const res = await fetch(`/api/admin/reservations/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error || "Falha ao alterar status." };
    return { success: true, reservation: json.reservation };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro ao conectar ao servidor." };
  }
}

export const updateReservationStatusOnBackend = updateReservationStatusApi;

export async function deleteReservationApi(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/reservations/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error || "Falha ao excluir reserva." };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro de conexão ao servidor." };
  }
}

export const deleteReservationOnBackend = deleteReservationApi;

// 6. Diagnóstico Técnico (Exclusivo DEVELOPER)
export async function fetchDeveloperDiagnostics(): Promise<any> {
  try {
    const res = await fetch("/api/admin/developer/diagnostics", {
      headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Acesso negado.");
    }
    return json;
  } catch (err: any) {
    throw new Error(err?.message || "Erro ao consultar diagnóstico.");
  }
}

export async function testDeveloperEmail(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch("/api/admin/developer/test-email", {
      method: "POST",
      headers: authHeaders(),
    });
    const json = await res.json();
    return {
      success: json.success,
      message: json.message,
      error: json.error,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Falha ao enviar e-mail de teste." };
  }
}

export const sendDeveloperTestEmail = testDeveloperEmail;

// 7. Auditoria de E-mails
export async function fetchLastEmailsLog(): Promise<{
  adminEmailTarget: string;
  smtpConfigured: boolean;
  emails: any[];
}> {
  try {
    const res = await fetch("/api/admin/last-emails", {
      headers: authHeaders(),
    });
    if (!res.ok) return { adminEmailTarget: "", smtpConfigured: false, emails: [] };
    return await res.json();
  } catch {
    return { adminEmailTarget: "", smtpConfigured: false, emails: [] };
  }
}
