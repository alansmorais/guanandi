/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Gerenciador de Acesso Administrativo
 * - Regra de no máximo 2 usuários administradores
 * - Primeiro acesso com a senha principal exige troca obrigatória imediata
 * - Telemetria e dados para o Developer Console
 */

import { safeStorage } from "./storage";

export interface AdminAccount {
  slot: number;
  username: string;
  name: string;
  passwordHash: string;
  mustChangePassword: boolean;
  createdAt: string;
  lastLogin: string | null;
}

const STORAGE_KEY = "guanandi_admin_accounts_v2";
const MASTER_INITIAL_PASSWORD = "Guanandi@2026";

// Função simples de hash para segurança básica do lado do cliente/armazenamento
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "GN_HASH_" + Math.abs(hash).toString(36) + "_" + str.length;
}

export function getInitialAdminAccounts(): AdminAccount[] {
  const saved = safeStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 2); // Garante no máximo 2 usuários
      }
    } catch {
      console.warn("Erro ao ler contas admin locais.");
    }
  }

  // Inicializa com exatamente 2 slots de administradores
  const initialAccounts: AdminAccount[] = [
    {
      slot: 1,
      username: "admin1",
      name: "Administrador 1",
      passwordHash: simpleHash(MASTER_INITIAL_PASSWORD),
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
      lastLogin: null
    },
    {
      slot: 2,
      username: "admin2",
      name: "Administrador 2",
      passwordHash: simpleHash(MASTER_INITIAL_PASSWORD),
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
      lastLogin: null
    }
  ];

  safeStorage.setItem(STORAGE_KEY, JSON.stringify(initialAccounts));
  return initialAccounts;
}

export function verifyAdminLogin(username: string, password: string): {
  success: boolean;
  mustChangePassword?: boolean;
  user?: AdminAccount;
  error?: string;
} {
  const accounts = getInitialAdminAccounts();
  const cleanUsername = username.trim().toLowerCase();
  const user = accounts.find((a) => a.username.toLowerCase() === cleanUsername);

  if (!user) {
    return {
      success: false,
      error: "Usuário não encontrado. O sistema suporta no máximo 2 administradores cadastrados."
    };
  }

  const hashInput = simpleHash(password);
  if (user.passwordHash !== hashInput) {
    return {
      success: false,
      error: "Senha incorreta. Verifique suas credenciais."
    };
  }

  if (user.mustChangePassword) {
    return {
      success: true,
      mustChangePassword: true,
      user
    };
  }

  // Atualiza data do último login
  user.lastLogin = new Date().toISOString();
  saveAdminAccounts(accounts);

  return {
    success: true,
    mustChangePassword: false,
    user
  };
}

export function updateAdminPassword(username: string, newPassword: string): {
  success: boolean;
  user?: AdminAccount;
  error?: string;
} {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "A nova senha deve ter no mínimo 6 caracteres." };
  }

  if (newPassword === MASTER_INITIAL_PASSWORD) {
    return { success: false, error: "A nova senha deve ser diferente da senha principal inicial." };
  }

  const accounts = getInitialAdminAccounts();
  const cleanUsername = username.trim().toLowerCase();
  const userIndex = accounts.findIndex((a) => a.username.toLowerCase() === cleanUsername);

  if (userIndex === -1) {
    return { success: false, error: "Usuário não encontrado." };
  }

  accounts[userIndex].passwordHash = simpleHash(newPassword);
  accounts[userIndex].mustChangePassword = false;
  accounts[userIndex].lastLogin = new Date().toISOString();

  saveAdminAccounts(accounts);

  return {
    success: true,
    user: accounts[userIndex]
  };
}

function saveAdminAccounts(accounts: AdminAccount[]) {
  // Limita estritamente a 2 usuários
  const limited = accounts.slice(0, 2);
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
}

export function resetAllAdminPasswordsForDev(): void {
  safeStorage.removeItem(STORAGE_KEY);
  getInitialAdminAccounts();
}
