/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Servidor Express Full-Stack da Cervejaria Guanandi
 * - Autenticação Segura com Roles ADMIN e DEVELOPER
 * - API de Reservas com Proteção contra Adulteração de Preço e Duplo Clique
 * - Serviço de Disparo de E-mails Transacionais com SMTP e Log de Auditoria
 * - Middleware Vite Integrado
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  authenticateUser, 
  getSessionFromToken, 
  revokeSession, 
  requireAdmin, 
  requireDeveloper, 
  ROLE_PERMISSIONS, 
  AuthenticatedRequest 
} from "./server/auth";
import { 
  sendReservationEmails, 
  sentEmailsLog, 
  getAdminEmailAddress, 
  getMailTransporter,
  ReservationEmailPayload 
} from "./server/email";
import { 
  OFFICIAL_BEERS, 
  calculateVerifiedPrice, 
  getBeerById 
} from "./server/catalog";

const app = express();
const PORT = 3000;

// Middleware de parsing
app.use(express.json());

// In-memory store de reservas no backend
export interface StoredReservation {
  id: string;
  reservationCode: string;
  customerName: string;
  customerWhatsApp: string;
  customerEmail: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  location: {
    city: string;
    neighborhood: string;
    address: string;
  };
  beerId: string;
  beerName: string;
  kegSize: 30 | 50;
  quantity: number;
  firstBeerPrice: number;
  secondBeerAdded: boolean;
  secondBeer?: {
    beerId: string;
    beerName: string;
    kegSize: 30 | 50;
    price: number;
    quantity: number;
  } | null;
  secondBeerPrice: number;
  extractorOption: string;
  extractorFee: number;
  logisticsFee: number;
  totalPrice: number;
  notes?: string;
  status: "pendente" | "confirmada" | "cancelada" | "concluida";
  createdAt: string;
  emailNotificationSent: boolean;
}

const reservationsStore: StoredReservation[] = [
  {
    id: "res_init_1",
    reservationCode: "#GN-48920",
    customerName: "Mariana Costa",
    customerWhatsApp: "(12) 99765-4321",
    customerEmail: "mariana.costa@exemplo.com.br",
    eventDate: "2026-10-15",
    eventTime: "13:00",
    guestCount: 45,
    location: {
      city: "São Sebastião",
      neighborhood: "Maresias",
      address: "Av. Dr. Francisco Loup, 800",
    },
    beerId: "pilsen",
    beerName: "Pilsen",
    kegSize: 50,
    quantity: 1,
    firstBeerPrice: 750,
    secondBeerAdded: true,
    secondBeer: {
      beerId: "american-ipa",
      beerName: "American IPA",
      kegSize: 30,
      price: 660,
      quantity: 1,
    },
    secondBeerPrice: 660,
    extractorOption: "Padrão Slink / Euro Sankey (S)",
    extractorFee: 0,
    logisticsFee: 120,
    totalPrice: 1530,
    notes: "Entregar até as 11h para gelar o chopp.",
    status: "confirmada",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    emailNotificationSent: true,
  }
];

// Anti-duplo clique / idempotência (chave -> timestamp)
const recentSubmissions = new Map<string, number>();

// ==========================================
// 1. ROTAS DE AUTENTICAÇÃO E SESSÃO
// ==========================================

// Login de Admin ou Developer
app.post("/api/auth/login", (req, res) => {
  const { username, password, targetRole } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Informe usuário e senha." });
  }

  const result = authenticateUser(username, password, targetRole);
  if (!result.success || !result.user || !result.token) {
    return res.status(401).json({ error: result.error || "Credenciais inválidas." });
  }

  const permissions = ROLE_PERMISSIONS[result.user.role];

  return res.json({
    success: true,
    token: result.token,
    user: {
      id: result.user.id,
      username: result.user.username,
      name: result.user.name,
      role: result.user.role,
    },
    permissions,
  });
});

// Verificação de sessão ativa
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  const token = authHeader.substring(7).trim();
  const session = getSessionFromToken(token);

  if (!session) {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }

  return res.json({
    user: {
      id: session.id,
      username: session.username,
      name: session.name,
      role: session.role,
    },
    permissions: ROLE_PERMISSIONS[session.role],
  });
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    revokeSession(authHeader.substring(7).trim());
  }
  return res.json({ success: true });
});

// ==========================================
// 2. ROTAS PÚBLICAS DE RESERVAS
// ==========================================

// Criação de nova reserva pelo cliente
app.post("/api/reservations", async (req, res) => {
  try {
    const {
      customerName,
      customerWhatsApp,
      customerEmail,
      eventDate,
      eventTime,
      guestCount,
      location,
      beerId,
      kegSize,
      quantity,
      secondBeerAdded,
      secondBeer,
      extractorOption,
      extractorFee,
      notes,
    } = req.body;

    // Validações obrigatórias
    if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
      return res.status(400).json({ error: "Nome do cliente é obrigatório (mínimo 2 caracteres)." });
    }

    if (!customerWhatsApp || typeof customerWhatsApp !== "string" || customerWhatsApp.trim().length < 8) {
      return res.status(400).json({ error: "Telefone / WhatsApp de contato é obrigatório." });
    }

    if (!customerEmail || typeof customerEmail !== "string" || !customerEmail.includes("@")) {
      return res.status(400).json({ error: "E-mail válido é obrigatório para confirmação da reserva." });
    }

    if (!eventDate || typeof eventDate !== "string") {
      return res.status(400).json({ error: "Data da reserva é obrigatória." });
    }

    if (!beerId || (kegSize !== 30 && kegSize !== 50)) {
      return res.status(400).json({ error: "Selecione uma cerveja válida e o tamanho do barril (30L ou 50L)." });
    }

    // Proteção contra duplo clique e submissão duplicada (30 segundos de janela)
    const idempotencyKey = `${customerEmail.trim().toLowerCase()}_${eventDate}_${beerId}_${secondBeerAdded ? secondBeer?.beerId : "none"}`;
    const lastTime = recentSubmissions.get(idempotencyKey);
    const now = Date.now();
    if (lastTime && now - lastTime < 30000) {
      return res.status(429).json({
        error: "Uma reserva idêntica foi enviada recentemente. Aguarde alguns segundos antes de tentar novamente.",
      });
    }
    recentSubmissions.set(idempotencyKey, now);

    // Validação estrita de preço calculada exclusivamente pelo servidor
    const priceCalculation = calculateVerifiedPrice({
      beerId,
      kegSize,
      quantity: Math.max(1, Number(quantity) || 1),
      secondBeerAdded: Boolean(secondBeerAdded),
      secondBeer: secondBeerAdded && secondBeer ? {
        beerId: secondBeer.beerId,
        kegSize: secondBeer.kegSize === 50 ? 50 : 30,
        quantity: Math.max(1, Number(secondBeer.quantity) || 1),
      } : null,
      extractorFee: Number(extractorFee) || 0,
      cityName: location?.city,
    });

    if (!priceCalculation.valid) {
      return res.status(400).json({ error: priceCalculation.error || "Erro ao calcular preço oficial dos produtos." });
    }

    const beer1 = getBeerById(beerId);
    const beer2 = secondBeerAdded && secondBeer ? getBeerById(secondBeer.beerId) : null;

    const reservationCode = `#GN-${Math.floor(Math.random() * 90000) + 10000}`;
    const createdAtIso = new Date().toISOString();

    const newReservation: StoredReservation = {
      id: "res_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      reservationCode,
      customerName: customerName.trim(),
      customerWhatsApp: customerWhatsApp.trim(),
      customerEmail: customerEmail.trim(),
      eventDate: eventDate.trim(),
      eventTime: (eventTime || "A combinar").trim(),
      guestCount: Math.max(1, Number(guestCount) || 30),
      location: {
        city: location?.city || "São Sebastião",
        neighborhood: location?.neighborhood || "",
        address: location?.address || "",
      },
      beerId,
      beerName: beer1?.name || beerId,
      kegSize,
      quantity: Math.max(1, Number(quantity) || 1),
      firstBeerPrice: priceCalculation.firstBeerPrice,
      secondBeerAdded: Boolean(secondBeerAdded),
      secondBeer: secondBeerAdded && beer2 ? {
        beerId: beer2.id,
        beerName: beer2.name,
        kegSize: secondBeer.kegSize === 50 ? 50 : 30,
        price: priceCalculation.secondBeerPrice,
        quantity: Math.max(1, Number(secondBeer.quantity) || 1),
      } : null,
      secondBeerPrice: priceCalculation.secondBeerPrice,
      extractorOption: extractorOption || "Padrão Slink / Euro Sankey (Tipo S)",
      extractorFee: priceCalculation.extractorFee,
      logisticsFee: priceCalculation.logisticsFee,
      totalPrice: priceCalculation.totalPrice,
      notes: notes ? String(notes).trim() : "",
      status: "pendente",
      createdAt: createdAtIso,
      emailNotificationSent: false,
    };

    // 3. Disparo de E-mails Transacionais
    const emailPayload: ReservationEmailPayload = {
      reservationCode,
      customerName: newReservation.customerName,
      customerWhatsApp: newReservation.customerWhatsApp,
      customerEmail: newReservation.customerEmail,
      eventDate: newReservation.eventDate,
      eventTime: newReservation.eventTime,
      guestCount: newReservation.guestCount,
      location: newReservation.location,
      beerName: newReservation.beerName,
      kegSize: newReservation.kegSize,
      quantity: newReservation.quantity,
      secondBeerAdded: newReservation.secondBeerAdded,
      secondBeer: newReservation.secondBeer,
      extractorOption: newReservation.extractorOption,
      extractorFee: newReservation.extractorFee,
      logisticsFee: newReservation.logisticsFee,
      totalPrice: newReservation.totalPrice,
      notes: newReservation.notes,
      createdAt: new Date().toLocaleString("pt-BR"),
    };

    const emailResult = await sendReservationEmails(emailPayload);
    newReservation.emailNotificationSent = emailResult.success;

    // Salva na memória do servidor
    reservationsStore.unshift(newReservation);

    return res.status(201).json({
      success: true,
      message: "Reserva realizada com sucesso.",
      reservation: newReservation,
      emailSent: emailResult.success,
      adminEmailTarget: getAdminEmailAddress(),
    });
  } catch (err: any) {
    console.error("Erro ao criar reserva:", err);
    return res.status(500).json({ error: "Erro interno ao processar a reserva." });
  }
});

// ==========================================
// 3. ROTAS DE GESTÃO ADMINISTRATIVA (ADMIN & DEVELOPER)
// ==========================================

// Listar todas as reservas com filtros
app.get("/api/admin/reservations", requireAdmin, (req, res) => {
  const { status, search, date } = req.query;

  let filtered = [...reservationsStore];

  if (status && status !== "todos") {
    filtered = filtered.filter((r) => r.status === status);
  }

  if (date && typeof date === "string") {
    filtered = filtered.filter((r) => r.eventDate === date);
  }

  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    filtered = filtered.filter((r) =>
      r.customerName.toLowerCase().includes(q) ||
      r.beerName.toLowerCase().includes(q) ||
      r.reservationCode.toLowerCase().includes(q) ||
      r.customerEmail.toLowerCase().includes(q)
    );
  }

  return res.json({
    total: filtered.length,
    reservations: filtered,
  });
});

// Atualizar status de uma reserva
app.patch("/api/admin/reservations/:id/status", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pendente", "confirmada", "cancelada", "concluida"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Status inválido." });
  }

  const reservation = reservationsStore.find((r) => r.id === id || r.reservationCode === id);
  if (!reservation) {
    return res.status(404).json({ error: "Reserva não encontrada." });
  }

  reservation.status = status;
  return res.json({ success: true, reservation });
});

// Cancelar/excluir reserva
app.delete("/api/admin/reservations/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const index = reservationsStore.findIndex((r) => r.id === id || r.reservationCode === id);

  if (index === -1) {
    return res.status(404).json({ error: "Reserva não encontrada." });
  }

  const deleted = reservationsStore.splice(index, 1);
  return res.json({ success: true, deleted: deleted[0] });
});

// Catálogo de produtos/cervejas
app.get("/api/products", (req, res) => {
  return res.json({ beers: OFFICIAL_BEERS });
});

// Atualizar preço ou disponibilidade (ADMIN & DEVELOPER)
app.patch("/api/admin/products/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { price30L, price50L, available } = req.body;

  const beer = OFFICIAL_BEERS.find((b) => b.id === id);
  if (!beer) {
    return res.status(404).json({ error: "Cerveja não encontrada." });
  }

  if (price30L !== undefined) beer.price30L = Number(price30L);
  if (price50L !== undefined) beer.price50L = Number(price50L);
  if (available !== undefined) beer.available = Boolean(available);

  return res.json({ success: true, beer });
});

// Histórico de e-mails disparados (Auditoria)
app.get("/api/admin/last-emails", requireAdmin, (req, res) => {
  return res.json({
    adminEmailTarget: getAdminEmailAddress(),
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    emails: sentEmailsLog,
  });
});

// ==========================================
// 4. ROTAS EXCLUSIVAS DO DEVELOPER
// (ADMIN É ESTRITAMENTE BARRADO AQUI)
// ==========================================

app.get("/api/admin/developer/diagnostics", requireDeveloper, (req: AuthenticatedRequest, res) => {
  const transporter = getMailTransporter();

  return res.json({
    system: "Cervejaria Guanandi Core Server",
    authenticatedUser: req.user?.username,
    role: req.user?.role,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: {
      ADMIN_EMAIL: getAdminEmailAddress(),
      SMTP_HOST: process.env.SMTP_HOST || "Não configurado",
      SMTP_PORT: process.env.SMTP_PORT || "587",
      SMTP_USER_CONFIGURED: Boolean(process.env.SMTP_USER),
      SMTP_PASS_CONFIGURED: Boolean(process.env.SMTP_PASSWORD),
      SMTP_READY: Boolean(transporter),
      ADMIN_USERNAME: process.env.ADMIN_USERNAME || "admin",
      DEVELOPER_USERNAME: process.env.DEVELOPER_USERNAME || "developer",
    },
    metrics: {
      totalReservationsInMemory: reservationsStore.length,
      totalEmailsLogged: sentEmailsLog.length,
    },
  });
});

// Teste de disparo de e-mail exclusivo do Developer
app.post("/api/admin/developer/test-email", requireDeveloper, async (req, res) => {
  const adminEmail = getAdminEmailAddress();
  const testPayload: ReservationEmailPayload = {
    reservationCode: "#GN-TEST-DEV",
    customerName: "Teste Diagnóstico Developer",
    customerWhatsApp: "(12) 99999-0000",
    customerEmail: adminEmail,
    eventDate: "2026-12-31",
    eventTime: "12:00",
    guestCount: 20,
    location: {
      city: "São Sebastião",
      neighborhood: "Centro",
      address: "Rua do Teste Técnico, 100",
    },
    beerName: "Pilsen (Teste)",
    kegSize: 30,
    quantity: 1,
    secondBeerAdded: true,
    secondBeer: {
      beerName: "American IPA (Teste Upsell)",
      kegSize: 30,
      price: 660,
      quantity: 1,
    },
    extractorOption: "Padrão Slink (S)",
    extractorFee: 0,
    logisticsFee: 120,
    totalPrice: 1230,
    notes: "E-mail de verificação técnica do Developer Console.",
    createdAt: new Date().toLocaleString("pt-BR"),
  };

  const result = await sendReservationEmails(testPayload);
  return res.json({
    success: result.success,
    mode: result.mode,
    adminSent: result.adminSent,
    error: result.error,
    message: result.mode === "smtp" ? "E-mail de teste enviado via SMTP com sucesso." : "E-mail registrado no log do servidor (SMTP não configurado em .env).",
  });
});

// ==========================================
// 5. CONFIGURAÇÃO DO VITE MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Cervejaria Guanandi] Servidor rodando em http://localhost:${PORT}`);
    console.log(`[Email Target] ADMIN_EMAIL configurado para: ${getAdminEmailAddress()}`);
  });
}

startServer();
