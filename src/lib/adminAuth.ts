/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Gerenciador de Sessão e Credenciais — Cervejaria Guanandi
 * - NENHUMA senha exposta no código frontend ou no bundle do navegador.
 * - Toda autenticação é delegada e validada no backend seguro via API (/api/auth).
 * - Sessões protegidas com tokens de autorização.
 */

import { loginToBackend, logoutFromBackend, getStoredToken } from "./api";

export interface AdminAccount {
  slot: number;
  username: string;
  name: string;
  role: "admin" | "developer";
}

/**
 * Retorna as contas de sistema configuradas para exibição de perfil
 */
export function getInitialAdminAccounts(): AdminAccount[] {
  return [
    {
      slot: 1,
      username: "admin",
      name: "Administrador Operacional",
      role: "admin",
    },
    {
      slot: 2,
      username: "developer",
      name: "Desenvolvedor Técnico",
      role: "developer",
    },
  ];
}

/**
 * Validação de login delegada ao backend seguro (PBKDF2/SHA-512)
 */
export async function verifyAdminLogin(
  username: string, 
  password: string, 
  role?: "admin" | "developer"
) {
  try {
    const res = await loginToBackend(username, password, role);
    if (res.success && res.user) {
      return {
        success: true,
        user: {
          slot: res.user.role === "developer" ? 2 : 1,
          username: res.user.username,
          name: res.user.name,
          role: res.user.role,
        },
      };
    }
    return {
      success: false,
      error: res.error || "Credenciais inválidas.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Erro de conexão com o servidor de autenticação.",
    };
  }
}

export function resetAllAdminPasswordsForDev() {
  console.log("As credenciais administrativas são gerenciadas pelas variáveis de ambiente do backend (.env).");
}
