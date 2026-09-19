/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * @file Admin.gs
 * Controle de acesso administrativo seguro no backend (Google Apps Script)
 * - Armazenamento de senhas exclusivo em ScriptProperties (sem exposição em código cliente ou planilhas)
 * - Regra de no máximo 2 usuários administradores
 * - Primeiro acesso obriga alteração imediata da senha principal
 * - Painel de Diagnóstico do Desenvolvedor (ASM Solutions - https://alansmsolutions.com/)
 */

var ADMIN_STORAGE_KEY = 'SECURE_ADMIN_ACCOUNTS_V2';
var MASTER_INITIAL_PASSWORD_DEFAULT = 'Guanandi@2026';

/**
 * Gera hash SHA-256 de uma string para evitar armazenamento de senhas em texto puro
 * @param {string} input
 * @return {string} Hash hexadecimal
 */
function hashString_(input) {
  var rawBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(input), Utilities.Charset.UTF_8);
  var hex = '';
  for (var i = 0; i < rawBytes.length; i++) {
    var b = rawBytes[i];
    if (b < 0) b += 256;
    var byteHex = b.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    hex += byteHex;
  }
  return hex;
}

/**
 * Obtém ou inicializa o repositório seguro de administradores no backend (ScriptProperties)
 * Garante estritamente o limite de NO MÁXIMO 2 USUÁRIOS
 * @return {Object}
 */
function getAdminRepository_() {
  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty(ADMIN_STORAGE_KEY);
  
  if (raw) {
    try {
      var repo = JSON.parse(raw);
      if (repo && Array.isArray(repo.users) && repo.users.length > 0) {
        return repo;
      }
    } catch (e) {
      console.warn('Falha ao interpretar ADMIN_STORAGE_KEY. Reinicializando com segurança...', e);
    }
  }

  // Inicialização do backend seguro com 2 slots de administradores
  var initialMasterHash = hashString_(MASTER_INITIAL_PASSWORD_DEFAULT);
  var defaultRepo = {
    maxUsers: 2,
    users: [
      {
        slot: 1,
        username: 'admin1',
        name: 'Administrador Principal (Slot 1)',
        passwordHash: initialMasterHash,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
        lastLogin: null
      },
      {
        slot: 2,
        username: 'admin2',
        name: 'Administrador Secundário (Slot 2)',
        passwordHash: initialMasterHash,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
        lastLogin: null
      }
    ],
    secretSalt: Utilities.getUuid(),
    developer: {
      provider: 'ASM Solutions',
      website: 'https://alansmsolutions.com/',
      contact: 'suporte@alansmsolutions.com'
    }
  };

  props.setProperty(ADMIN_STORAGE_KEY, JSON.stringify(defaultRepo));
  return defaultRepo;
}

/**
 * Salva o repositório atualizado de volta no ScriptProperties
 * @param {Object} repo
 */
function saveAdminRepository_(repo) {
  // Limita estritamente a 2 usuários antes de persistir
  if (repo.users && repo.users.length > 2) {
    repo.users = repo.users.slice(0, 2);
  }
  PropertiesService.getScriptProperties().setProperty(ADMIN_STORAGE_KEY, JSON.stringify(repo));
}

/**
 * Login administrativo no backend
 * - Senha ocultada e validada no backend via SHA-256
 * - Verifica se é primeiro acesso (exige troca obrigatória antes de liberar o painel)
 * - Respeita o teto de 2 usuários
 * @param {string} username
 * @param {string} password
 * @return {Object}
 */
function loginAdmin(username, password) {
  try {
    if (!username || !password) {
      return { success: false, error: 'Usuário e senha são obrigatórios.' };
    }

    var cleanUsername = String(username).trim().toLowerCase();
    var repo = getAdminRepository_();
    var enteredHash = hashString_(password);

    var user = null;
    for (var i = 0; i < repo.users.length; i++) {
      if (repo.users[i].username.toLowerCase() === cleanUsername) {
        user = repo.users[i];
        break;
      }
    }

    if (!user) {
      return { success: false, error: 'Usuário não encontrado. O sistema suporta no máximo 2 administradores.' };
    }

    if (user.passwordHash !== enteredHash) {
      return { success: false, error: 'Senha incorreta.' };
    }

    // Se o usuário ainda precisa trocar a senha principal (primeiro acesso)
    if (user.mustChangePassword) {
      var tempToken = Utilities.base64Encode('TEMP_CHANGE:' + user.username + ':' + Date.now() + ':' + repo.secretSalt);
      return {
        success: true,
        mustChangePassword: true,
        tempToken: tempToken,
        username: user.username,
        message: 'Primeiro acesso detectado com a senha principal. Por segurança, defina sua nova senha pessoal antes de continuar.'
      };
    }

    // Login com sucesso para usuário já com senha própria
    user.lastLogin = new Date().toISOString();
    saveAdminRepository_(repo);

    var authToken = Utilities.base64Encode('AUTH:' + user.username + ':' + Date.now() + ':' + repo.secretSalt);

    return {
      success: true,
      mustChangePassword: false,
      token: authToken,
      user: {
        username: user.username,
        name: user.name,
        slot: user.slot
      }
    };
  } catch (err) {
    return { success: false, error: 'Erro no servidor: ' + err.message };
  }
}

/**
 * Troca obrigatória de senha no backend
 * @param {string} tempToken Token temporário de alteração de senha
 * @param {string} newPassword Nova senha escolhida pelo usuário
 * @return {Object}
 */
function changeAdminPassword(tempToken, newPassword) {
  try {
    if (!tempToken || !newPassword) {
      return { success: false, error: 'Dados incompletos para redefinição.' };
    }

    if (String(newPassword).length < 6) {
      return { success: false, error: 'A nova senha deve possuir no mínimo 6 caracteres.' };
    }

    var decoded = Utilities.newBlob(Utilities.base64Decode(tempToken)).getDataAsString();
    var parts = decoded.split(':');
    
    // Formato: TEMP_CHANGE:username:timestamp:salt ou AUTH:username:...
    if (parts[0] !== 'TEMP_CHANGE' && parts[0] !== 'AUTH') {
      return { success: false, error: 'Sessão expirada ou token inválido.' };
    }

    var username = parts[1];
    var repo = getAdminRepository_();
    var userIndex = -1;

    for (var i = 0; i < repo.users.length; i++) {
      if (repo.users[i].username.toLowerCase() === username.toLowerCase()) {
        userIndex = i;
        break;
      }
    }

    if (userIndex === -1) {
      return { success: false, error: 'Usuário não localizado no repositório.' };
    }

    // Não permite reutilizar a senha padrão inicial
    if (newPassword === MASTER_INITIAL_PASSWORD_DEFAULT) {
      return { success: false, error: 'Por favor, crie uma senha personalizada diferente da senha inicial.' };
    }

    // Atualiza a senha no backend de forma segura
    repo.users[userIndex].passwordHash = hashString_(newPassword);
    repo.users[userIndex].mustChangePassword = false;
    repo.users[userIndex].updatedAt = new Date().toISOString();
    repo.users[userIndex].lastLogin = new Date().toISOString();
    saveAdminRepository_(repo);

    var newToken = Utilities.base64Encode('AUTH:' + repo.users[userIndex].username + ':' + Date.now() + ':' + repo.secretSalt);

    return {
      success: true,
      message: 'Senha alterada com sucesso! Acesso liberado.',
      token: newToken,
      user: {
        username: repo.users[userIndex].username,
        name: repo.users[userIndex].name,
        slot: repo.users[userIndex].slot
      }
    };
  } catch (err) {
    return { success: false, error: 'Falha ao alterar senha: ' + err.message };
  }
}

/**
 * Validação de sessão do token
 * @param {string} token
 * @return {boolean}
 */
function isTokenValid(token) {
  if (!token) return false;
  try {
    var decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    var parts = decoded.split(':');
    if (parts[0] !== 'AUTH') return false;

    var username = parts[1];
    var salt = parts[3];

    var repo = getAdminRepository_();
    if (salt !== repo.secretSalt) return false;

    for (var i = 0; i < repo.users.length; i++) {
      if (repo.users[i].username.toLowerCase() === username.toLowerCase()) {
        return !repo.users[i].mustChangePassword; // Bloqueia se ainda não alterou senha
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Retorna dados consolidados para o Painel do Desenvolvedor (ASM Solutions)
 * @param {string} token
 * @return {Object}
 */
function getDeveloperDiagnostics(token) {
  if (!isTokenValid(token)) {
    return { success: false, error: 'Acesso restrito a administradores autorizados.' };
  }

  try {
    var ss = getTargetSpreadsheet();
    var sheetReservas = ss.getSheetByName('RESERVAS');
    var sheetProdutos = ss.getSheetByName('PRODUTOS');
    var sheetConfig = ss.getSheetByName('CONFIG');
    var sheetItens = ss.getSheetByName('ITENS_RESERVA');

    var repo = getAdminRepository_();

    // Sanitiza usuários para o painel (NUNCA expõe senhas ou hashes)
    var userSlots = repo.users.map(function(u) {
      return {
        slot: u.slot,
        username: u.username,
        name: u.name,
        mustChangePassword: u.mustChangePassword,
        status: u.mustChangePassword ? 'Primeiro Acesso Pendente' : 'Ativo & Protegido',
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
      };
    });

    return {
      success: true,
      environment: {
        runtime: 'Google Apps Script V8',
        serverTime: new Date().toISOString(),
        timeZone: Session.getScriptTimeZone(),
        userLocale: Session.getActiveUserLocale(),
        spreadsheetId: ss.getId(),
        spreadsheetName: ss.getName(),
        storageEngine: 'ScriptProperties (Segurança Backend)',
        maxAdminsAllowed: 2
      },
      counts: {
        reservations: sheetReservas ? Math.max(0, sheetReservas.getLastRow() - 1) : 0,
        products: sheetProdutos ? Math.max(0, sheetProdutos.getLastRow() - 1) : 0,
        configRows: sheetConfig ? Math.max(0, sheetConfig.getLastRow() - 1) : 0,
        itemsRows: sheetItens ? Math.max(0, sheetItens.getLastRow() - 1) : 0
      },
      adminSlots: userSlots,
      partner: {
        name: 'ASM Solutions',
        website: 'https://alansmsolutions.com/',
        support: 'suporte@alansmsolutions.com',
        copyright: '© ' + new Date().getFullYear() + ' Cervejaria Guanandi. Desenvolvido por ASM Solutions.'
      }
    };
  } catch (err) {
    return { success: false, error: 'Erro nos diagnósticos: ' + err.message };
  }
}

/**
 * Retorna as reservas para o painel administrativo
 * @param {string} token
 * @return {Object}
 */
function getAdminReservations(token) {
  if (!isTokenValid(token)) {
    return { success: false, error: 'Não autorizado.' };
  }

  var ss = getTargetSpreadsheet();
  var sheetReservas = ss.getSheetByName('RESERVAS');
  var sheetItens = ss.getSheetByName('ITENS_RESERVA');

  var reservas = getSheetRecords(sheetReservas);
  var itens = getSheetRecords(sheetItens);

  // Mapeia itens por ID de reserva
  var itemsByResId = {};
  for (var i = 0; i < itens.length; i++) {
    var it = itens[i];
    var rid = String(it.ID_Reserva);
    if (!itemsByResId[rid]) itemsByResId[rid] = [];
    itemsByResId[rid].push({
      productId: it.ID_Produto,
      name: it.Nome_Produto,
      category: it.Categoria,
      volumeL: it.Volume_L,
      quantity: it.Quantidade,
      unitPrice: it.Preco_Unitario,
      subtotal: it.Subtotal
    });
  }

  // Agrega reservas
  var list = [];
  for (var j = 0; j < reservas.length; j++) {
    var r = reservas[j];
    var id = String(r.ID);
    list.push({
      id: id,
      eventDate: normalizeDateString(r.Data_Evento),
      startTime: r.Hora_Inicio,
      endTime: r.Hora_Termino,
      customerName: r.Cliente_Nome,
      customerWhatsApp: r.Cliente_WhatsApp,
      customerEmail: r.Cliente_Email,
      needInvoice: r.Precisa_NF === 'SIM',
      invoiceDoc: r.Documento_NF,
      address: r.Endereco + (r.Numero ? ', ' + r.Numero : '') + (r.Bairro ? ' - ' + r.Bairro : ''),
      city: r.Cidade,
      state: r.Estado,
      cep: r.CEP,
      guests: r.Convidados,
      subtotal: r.Subtotal_Produtos,
      deliveryFee: r.Taxa_Entrega,
      total: r.Total_Geral,
      status: r.Status || 'Pendente',
      notes: r.Observacoes,
      createdAt: r.Criado_Em,
      items: itemsByResId[id] || []
    });
  }

  // Ordena por data decrescente
  list.sort(function(a, b) {
    return (b.id > a.id ? 1 : -1);
  });

  return {
    success: true,
    reservations: list
  };
}

/**
 * Atualiza o status de uma reserva (ex: Confirmada, Paga, Cancelada, etc.)
 */
function updateReservationStatus(token, reservationId, newStatus) {
  if (!isTokenValid(token)) {
    return { success: false, error: 'Não autorizado.' };
  }

  var validStatuses = [
    'Pendente', 'Confirmada', 'Paga', 'Em Preparação', 'Entregue', 'Finalizada', 'Cancelada'
  ];
  if (validStatuses.indexOf(newStatus) === -1) {
    return { success: false, error: 'Status inválido.' };
  }

  var ss = getTargetSpreadsheet();
  var sheet = ss.getSheetByName('RESERVAS');
  var records = getSheetRecords(sheet);

  for (var i = 0; i < records.length; i++) {
    if (String(records[i].ID) === String(reservationId)) {
      sheet.getRange(records[i]._rowIndex, 22).setValue(newStatus);
      return { success: true, message: 'Status atualizado para ' + newStatus };
    }
  }

  return { success: false, error: 'Reserva não encontrada.' };
}

/**
 * Retorna visão consolidada de datas para o calendário anti-double booking
 */
function getCalendarEvents(token) {
  if (!isTokenValid(token)) {
    return { success: false, error: 'Não autorizado.' };
  }

  var resObj = getAdminReservations(token);
  if (!resObj.success) return resObj;

  var dateMap = {};

  for (var i = 0; i < resObj.reservations.length; i++) {
    var r = resObj.reservations[i];
    if (r.status === 'Cancelada') continue;

    var dt = r.eventDate;
    if (!dt) continue;

    if (!dateMap[dt]) {
      dateMap[dt] = {
        date: dt,
        count: 0,
        reservations: [],
        equipmentCounts: {
          chopeiras: 0,
          beertruck: 0,
          tendas: 0,
          barris: 0
        }
      };
    }

    dateMap[dt].count++;
    dateMap[dt].reservations.push({
      id: r.id,
      customer: r.customerName,
      status: r.status,
      city: r.city,
      total: r.total
    });

    for (var k = 0; k < r.items.length; k++) {
      var it = r.items[k];
      var cat = String(it.category || '').toLowerCase();
      var qty = Number(it.quantity || 1);

      if (cat === 'chopeira') dateMap[dt].equipmentCounts.chopeiras += qty;
      else if (cat === 'beertruck') dateMap[dt].equipmentCounts.beertruck += qty;
      else if (cat === 'tenda') dateMap[dt].equipmentCounts.tendas += qty;
      else if (cat === 'cerveja') dateMap[dt].equipmentCounts.barris += qty;
    }
  }

  var calendarList = [];
  for (var key in dateMap) {
    calendarList.push(dateMap[key]);
  }

  calendarList.sort(function(a, b) {
    return a.date.localeCompare(b.date);
  });

  return {
    success: true,
    calendar: calendarList
  };
}
