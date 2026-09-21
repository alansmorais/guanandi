/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Contexto de Autenticação e Sessão — Cervejaria Guanandi
 * - Integra autenticação backend com controle de acesso de dois níveis (ADMIN e DEVELOPER)
 * - Nenhuma senha armazenada no cliente ou no localStorage
 * - Tokens de sessão validados pelo servidor
 * - Isolamento rígido de papéis: ADMIN não acessa funções de DEVELOPER
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db, doc, getDoc } from "../lib/firebase";
import { 
  loginToBackend, 
  fetchCurrentSession, 
  logoutFromBackend, 
  SessionUser, 
  UserRolePermissions,
  getStoredToken 
} from "../lib/api";

export interface AdminSlotUser {
  slot?: number;
  username: string;
  name: string;
  mustChangePassword?: boolean;
  role: "admin" | "developer";
}

interface FirebaseContextType {
  user: User | null;
  adminUser: AdminSlotUser | null;
  sessionUser: SessionUser | null;
  permissions: UserRolePermissions | null;
  role: "admin" | "developer" | null;
  loading: boolean;
  isAdmin: boolean;
  isDeveloper: boolean;
  loginWithCredentials: (
    username: string, 
    password: string, 
    targetRole?: "admin" | "developer"
  ) => Promise<{ success: boolean; error?: string; role?: "admin" | "developer" }>;
  loginAdminSession: (admin: AdminSlotUser) => void;
  logoutAdminSession: () => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [permissions, setPermissions] = useState<UserRolePermissions | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicializa sessão a partir do token no backend
  useEffect(() => {
    async function initSession() {
      try {
        const token = getStoredToken();
        if (token) {
          const res = await fetchCurrentSession();
          if (res.user) {
            setSessionUser(res.user);
            setPermissions(res.permissions);
          }
        }
      } catch (e) {
        console.warn("Falha ao restaurar sessão backend:", e);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    // Listener opcional do Firebase Auth (se aplicável)
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Login via API backend com hash seguro
  const loginWithCredentials = async (
    username: string,
    password: string,
    targetRole?: "admin" | "developer"
  ) => {
    const res = await loginToBackend(username, password, targetRole);
    if (res.success && res.user) {
      setSessionUser(res.user);
      setPermissions(res.permissions || null);
      return { success: true, role: res.user.role };
    }
    return { success: false, error: res.error || "Credenciais inválidas." };
  };

  const loginAdminSession = (admin: AdminSlotUser) => {
    setSessionUser({
      id: admin.username,
      username: admin.username,
      name: admin.name,
      role: admin.role || "admin",
    });
  };

  const logoutAdminSession = async () => {
    await logoutFromBackend();
    setSessionUser(null);
    setPermissions(null);
  };

  const role = sessionUser?.role || null;
  const isAdmin = role === "admin" || role === "developer";
  const isDeveloper = role === "developer";

  const legacyAdminUser: AdminSlotUser | null = sessionUser ? {
    username: sessionUser.username,
    name: sessionUser.name,
    role: sessionUser.role,
    slot: sessionUser.role === "developer" ? 99 : 1,
    mustChangePassword: false,
  } : null;

  return (
    <FirebaseContext.Provider 
      value={{ 
        user, 
        adminUser: legacyAdminUser, 
        sessionUser,
        permissions,
        role,
        loading, 
        isAdmin, 
        isDeveloper,
        loginWithCredentials,
        loginAdminSession, 
        logoutAdminSession 
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
}
