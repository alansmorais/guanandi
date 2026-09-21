/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sistema de Envio de E-mails Transacionais de Reserva
 * - Dispara e-mail para o administrador (ADMIN_EMAIL)
 * - Dispara cópia de confirmação para o cliente
 * - Não expõe credenciais SMTP ao frontend
 * - Mantém buffer histórico para auditoria no painel administrativo
 */

import nodemailer from "nodemailer";

export interface ReservationEmailPayload {
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
  beerName: string;
  kegSize: number;
  quantity: number;
  secondBeerAdded?: boolean;
  secondBeer?: {
    beerName: string;
    kegSize: number;
    price: number;
    quantity: number;
  } | null;
  extractorOption?: string;
  extractorFee?: number;
  logisticsFee?: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

export interface SentEmailRecord {
  id: string;
  to: string;
  subject: string;
  customerName: string;
  reservationCode: string;
  sentAt: string;
  status: "delivered" | "queued" | "simulated";
  previewText: string;
}

// In-memory buffer of last 50 sent emails for inspection
export const sentEmailsLog: SentEmailRecord[] = [];

export function getAdminEmailAddress(): string {
  return process.env.ADMIN_EMAIL || "marcelopontal@yahoo.com.br";
}

export function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
}

export async function sendReservationEmails(data: ReservationEmailPayload): Promise<{
  success: boolean;
  adminSent: boolean;
  clientSent: boolean;
  mode: "smtp" | "logged";
  error?: string;
}> {
  const adminEmail = getAdminEmailAddress();
  const subject = `Nova Reserva — ${data.customerName} — ${data.eventDate}`;

  const downPayment = Math.round(data.totalPrice * 0.5);
  const remainingPayment = data.totalPrice - downPayment;

  const secondBeerHtml = data.secondBeerAdded && data.secondBeer
    ? `
      <div style="background-color: #1A1A1A; border-left: 4px solid #F59E0B; padding: 12px; margin-top: 8px; border-radius: 4px;">
        <p style="margin: 0; color: #F59E0B; font-weight: bold; font-size: 13px;">★ SEGUNDA CERVEJA ADICIONADA (UPSELL PÓS-VENDA):</p>
        <p style="margin: 4px 0 0 0; color: #FFFFFF; font-size: 14px;"><strong>${data.secondBeer.beerName}</strong> — Barril ${data.secondBeer.kegSize}L (x${data.secondBeer.quantity || 1})</p>
        <p style="margin: 4px 0 0 0; color: #D1D5DB; font-size: 13px;">Valor da 2ª Cerveja: R$ ${data.secondBeer.price?.toLocaleString('pt-BR')},00</p>
      </div>
    `
    : `<p style="color: #9CA3AF; font-size: 13px; font-style: italic; margin: 4px 0;">Nenhuma segunda cerveja adicionada.</p>`;

  const secondBeerText = data.secondBeerAdded && data.secondBeer
    ? `\n- SEGUNDA CERVEJA (UPSELL): ${data.secondBeer.beerName} — ${data.secondBeer.kegSize}L (x${data.secondBeer.quantity || 1}) — R$ ${data.secondBeer.price?.toLocaleString('pt-BR')},00`
    : `\n- SEGUNDA CERVEJA: Não adicionada`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1F2937; background-color: #0F0F0F; margin: 0; padding: 24px;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #141414; border: 1px solid #2D2D2D; border-radius: 8px; overflow: hidden; color: #E5E7EB;">
        
        <!-- Header -->
        <div style="background-color: #000000; padding: 24px; border-bottom: 2px solid #EAB308; text-align: center;">
          <h1 style="color: #FACC15; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px;">Cervejaria Guanandi</h1>
          <p style="color: #9CA3AF; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase;">Notificação de Reserva de Chopp & Infraestrutura</p>
          <div style="display: inline-block; background-color: #27272A; color: #FACC15; font-family: monospace; font-size: 14px; font-weight: bold; padding: 4px 12px; border-radius: 4px; margin-top: 12px;">
            Código: ${data.reservationCode}
          </div>
        </div>

        <div style="padding: 24px;">
          <!-- Informações do Cliente -->
          <h3 style="color: #FACC15; font-size: 15px; text-transform: uppercase; border-bottom: 1px solid #27272A; padding-bottom: 6px; margin-top: 0;">
            1. Dados do Cliente
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #9CA3AF; width: 35%;">Nome:</td><td style="color: #FFFFFF; font-weight: bold;">${data.customerName}</td></tr>
            <tr><td style="padding: 6px 0; color: #9CA3AF;">Telefone / WhatsApp:</td><td style="color: #FFFFFF;">${data.customerWhatsApp}</td></tr>
            <tr><td style="padding: 6px 0; color: #9CA3AF;">E-mail:</td><td style="color: #FFFFFF;"><a href="mailto:${data.customerEmail}" style="color: #FACC15; text-decoration: none;">${data.customerEmail}</a></td></tr>
          </table>

          <!-- Dados do Evento -->
          <h3 style="color: #FACC15; font-size: 15px; text-transform: uppercase; border-bottom: 1px solid #27272A; padding-bottom: 6px;">
            2. Detalhes do Evento & Localização
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #9CA3AF; width: 35%;">Data do Evento:</td><td style="color: #FFFFFF; font-weight: bold;">${data.eventDate}</td></tr>
            <tr><td style="padding: 6px 0; color: #9CA3AF;">Horário:</td><td style="color: #FFFFFF; font-weight: bold;">${data.eventTime || "A combinar / Manhã"}</td></tr>
            <tr><td style="padding: 6px 0; color: #9CA3AF;">Número de Pessoas:</td><td style="color: #FFFFFF;">${data.guestCount || "Não informado"} convidados</td></tr>
            <tr><td style="padding: 6px 0; color: #9CA3AF;">Cidade / Região:</td><td style="color: #FFFFFF;">${data.location?.city}</td></tr>
            <tr><td style="padding: 6px 0; color: #9CA3AF;">Endereço de Entrega:</td><td style="color: #FFFFFF;">${data.location?.address}, ${data.location?.neighborhood}</td></tr>
            <tr><td style="padding: 6px 0; color: #9CA3AF;">Observações:</td><td style="color: #FFFFFF;">${data.notes || "Nenhuma observação informada"}</td></tr>
            <tr><td style="padding: 6px 0; color: #9CA3AF;">Criado em:</td><td style="color: #9CA3AF;">${data.createdAt}</td></tr>
          </table>

          <!-- Produtos & Cervejas -->
          <h3 style="color: #FACC15; font-size: 15px; text-transform: uppercase; border-bottom: 1px solid #27272A; padding-bottom: 6px;">
            3. Chopes & Equipamentos Selecionados
          </h3>
          <div style="background-color: #1A1A1A; padding: 12px; border-radius: 4px; margin-bottom: 12px;">
            <p style="margin: 0; color: #FFFFFF; font-size: 14px;"><strong>Cerveja Principal:</strong> ${data.beerName}</p>
            <p style="margin: 4px 0 0 0; color: #D1D5DB; font-size: 13px;">Barril ${data.kegSize} Litros (Quantidade: ${data.quantity})</p>
          </div>

          ${secondBeerHtml}

          <div style="background-color: #1A1A1A; padding: 12px; border-radius: 4px; margin-top: 12px; margin-bottom: 20px;">
            <p style="margin: 0; color: #FFFFFF; font-size: 13px;"><strong>Válvula / Extratora:</strong> ${data.extractorOption || "Padrão Slink / Euro Sankey (Tipo S) — Inclusa"}</p>
            ${data.extractorFee ? `<p style="margin: 2px 0 0 0; color: #9CA3AF; font-size: 12px;">Adicional Válvula: R$ ${data.extractorFee},00</p>` : ""}
            <p style="margin: 4px 0 0 0; color: #FFFFFF; font-size: 13px;"><strong>Taxa Logística (${data.location?.city}):</strong> R$ ${(data.logisticsFee || 0).toLocaleString('pt-BR')},00</p>
          </div>

          <!-- Valores Financeiros -->
          <div style="background-color: #27272A; border: 1px solid #3F3F46; border-radius: 6px; padding: 16px; margin-top: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 16px;">
              <span style="color: #FFFFFF; font-weight: bold;">VALOR TOTAL:</span>
              <span style="color: #FACC15; font-weight: bold; font-size: 18px;">R$ ${data.totalPrice.toLocaleString('pt-BR')},00</span>
            </div>
            <div style="border-top: 1px dashed #52525B; padding-top: 8px; font-size: 13px; color: #D1D5DB;">
              <p style="margin: 2px 0;">Sinal de 50% (Reserva de Data): <strong>R$ ${downPayment.toLocaleString('pt-BR')},00</strong></p>
              <p style="margin: 2px 0;">Saldo restante (Na Entrega/Instalação): <strong>R$ ${remainingPayment.toLocaleString('pt-BR')},00</strong></p>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #0A0A0A; padding: 16px; text-align: center; border-top: 1px solid #27272A; font-size: 12px; color: #71717A;">
          Cervejaria Guanandi • Litoral Norte SP (São Sebastião • Ilhabela • Caraguatatuba • Ubatuba)<br>
          Este e-mail é gerado automaticamente pelo sistema de reservas.
        </div>
      </div>
    </body>
    </html>
  `;

  const plainText = `
NOVA RESERVA - CERVEJARIA GUANANDI
Código: ${data.reservationCode}
Criado em: ${data.createdAt}

DADOS DO CLIENTE:
- Nome: ${data.customerName}
- Telefone / WhatsApp: ${data.customerWhatsApp}
- E-mail: ${data.customerEmail}

DADOS DO EVENTO:
- Data: ${data.eventDate}
- Horário: ${data.eventTime || "A combinar"}
- Convidados: ${data.guestCount || "Não informado"}
- Cidade: ${data.location?.city}
- Endereço: ${data.location?.address}, ${data.location?.neighborhood}
- Observações: ${data.notes || "Nenhuma"}

PRODUTOS SELECIONADOS:
- Cerveja Principal: ${data.beerName} (${data.kegSize}L x${data.quantity})
${secondBeerText}
- Válvula / Extratora: ${data.extractorOption || "Padrão Slink (S)"}
- Taxa Logística: R$ ${(data.logisticsFee || 0).toLocaleString('pt-BR')},00

VALORES:
- Total: R$ ${data.totalPrice.toLocaleString('pt-BR')},00
- Sinal 50%: R$ ${downPayment.toLocaleString('pt-BR')},00
- Saldo na entrega: R$ ${remainingPayment.toLocaleString('pt-BR')},00
`;

  const transporter = getMailTransporter();

  // Log in-memory record
  const logRecord: SentEmailRecord = {
    id: "mail_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    to: adminEmail,
    subject,
    customerName: data.customerName,
    reservationCode: data.reservationCode,
    sentAt: new Date().toISOString(),
    status: transporter ? "delivered" : "simulated",
    previewText: `Reserva ${data.reservationCode} para ${data.customerName} em ${data.eventDate}. Total: R$ ${data.totalPrice},00`,
  };
  sentEmailsLog.unshift(logRecord);
  if (sentEmailsLog.length > 50) sentEmailsLog.pop();

  if (!transporter) {
    console.log(`[EMAIL DISPATCH - SIMULATED MODE]`);
    console.log(`To: ${adminEmail} and ${data.customerEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reservation Code: ${data.reservationCode}`);
    console.log(`Total Price: R$ ${data.totalPrice},00`);
    return {
      success: true,
      adminSent: true,
      clientSent: true,
      mode: "logged",
    };
  }

  try {
    // 1. Send to Admin
    await transporter.sendMail({
      from: `"Cervejaria Guanandi Reservas" <${process.env.SMTP_USER || adminEmail}>`,
      to: adminEmail,
      subject,
      text: plainText,
      html: htmlContent,
    });

    // 2. Send confirmation to Customer
    if (data.customerEmail && data.customerEmail.includes("@")) {
      await transporter.sendMail({
        from: `"Cervejaria Guanandi" <${process.env.SMTP_USER || adminEmail}>`,
        to: data.customerEmail,
        subject: `Confirmação de Reserva de Chopp — ${data.reservationCode} — Cervejaria Guanandi`,
        text: plainText,
        html: htmlContent,
      });
    }

    return {
      success: true,
      adminSent: true,
      clientSent: true,
      mode: "smtp",
    };
  } catch (error: any) {
    console.error("Erro ao enviar e-mail via SMTP:", error);
    logRecord.status = "queued";
    return {
      success: true, // Do not fail customer reservation on SMTP transient issue
      adminSent: false,
      clientSent: false,
      mode: "smtp",
      error: error?.message || "Falha na conexão SMTP.",
    };
  }
}
