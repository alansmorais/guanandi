/**
 * @file Reservations.gs
 * Lógica de negócio, validação anti-conflito, cálculo de preços e gravação de reservas
 */

/**
 * Verifica se os equipamentos solicitados estão disponíveis na data do evento
 * @param {string} eventDate Data no formato YYYY-MM-DD
 * @param {Array<{productId: string, quantity: number}>} requestedItems
 * @return {Object} { available: boolean, conflictedItem?: string, message?: string }
 */
function checkAvailability(eventDate, requestedItems) {
  if (!eventDate || !requestedItems || !requestedItems.length) {
    return { available: true };
  }

  var ss = getTargetSpreadsheet();
  var sheetReservas = ss.getSheetByName('RESERVAS');
  var sheetItens = ss.getSheetByName('ITENS_RESERVA');
  var productsMap = getProductsMapById();

  var reservasRecords = getSheetRecords(sheetReservas);
  var itensRecords = getSheetRecords(sheetItens);

  // Filtra as reservas ativas na mesma data
  var activeReservationIds = {};
  for (var i = 0; i < reservasRecords.length; i++) {
    var r = reservasRecords[i];
    var rDate = normalizeDateString(r.Data_Evento);
    var rStatus = String(r.Status || '').toLowerCase();
    
    // Ignora reservas canceladas
    if (rDate === eventDate && rStatus !== 'cancelada') {
      activeReservationIds[String(r.ID)] = true;
    }
  }

  // Soma a quantidade já alocada por produto nessa data
  var reservedCounts = {};
  for (var j = 0; j < itensRecords.length; j++) {
    var item = itensRecords[j];
    var resId = String(item.ID_Reserva);
    if (activeReservationIds[resId]) {
      var prodId = String(item.ID_Produto);
      reservedCounts[prodId] = (reservedCounts[prodId] || 0) + Number(item.Quantidade || 0);
    }
  }

  // Compara os itens solicitados com o estoque disponível
  for (var k = 0; k < requestedItems.length; k++) {
    var req = requestedItems[k];
    var pid = String(req.productId);
    var pInfo = productsMap[pid];

    if (pInfo && pInfo.stock > 0) {
      var alreadyBooked = reservedCounts[pid] || 0;
      var remaining = pInfo.stock - alreadyBooked;

      if (req.quantity > remaining) {
        return {
          available: false,
          conflictedItem: pInfo.name,
          remaining: remaining,
          message: 'O item "' + pInfo.name + '" possui apenas ' + Math.max(0, remaining) + ' unidade(s) disponível(is) para a data ' + formatDateBR(eventDate) + '. Por favor, ajuste a quantidade ou escolha outra data.'
        };
      }
    }
  }

  return { available: true };
}

/**
 * Recalcula de forma segura o total da reserva com base no catálogo da planilha
 * @param {Array<{productId: string, quantity: number}>} clientItems
 * @param {string} selectedCity
 * @return {Object}
 */
function calculateAuthoritativePrice(clientItems, selectedCity) {
  var productsMap = getProductsMapById();
  var subtotal = 0;
  var itemsWithDetails = [];

  for (var i = 0; i < clientItems.length; i++) {
    var item = clientItems[i];
    var pid = String(item.productId);
    var qty = Math.max(1, Number(item.quantity) || 1);
    var pInfo = productsMap[pid];

    if (pInfo) {
      var lineSubtotal = pInfo.price * qty;
      subtotal += lineSubtotal;
      itemsWithDetails.push({
        productId: pInfo.id,
        name: pInfo.name,
        category: pInfo.category,
        volumeL: pInfo.volumeL,
        quantity: qty,
        unitPrice: pInfo.price,
        subtotal: lineSubtotal
      });
    }
  }

  // Cálculo da taxa de entrega
  var deliveryFee = 0;
  var regions = getDeliveryRegions();
  for (var j = 0; j < regions.length; j++) {
    if (regions[j].city === selectedCity) {
      deliveryFee = Number(regions[j].fee || 0);
      break;
    }
  }

  var total = subtotal + deliveryFee;

  return {
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: total,
    items: itemsWithDetails
  };
}

/**
 * Cria uma nova reserva de forma transacional e anti-double booking
 * @param {Object} order Dados enviados pelo formulário do cliente
 * @return {Object} Resultado com ID da reserva e link do WhatsApp
 */
function createReservation(order) {
  var lock = LockService.getScriptLock();
  try {
    // Trava de simultaneidade para garantir que duas pessoas não reservem o último barril/equipamento juntas
    lock.waitLock(15000);

    var config = getConfigMap();
    var minDays = parseInt(config.ANTECEDENCIA_MIN_DIAS || '7', 10);
    var eventDateStr = String(order.eventDate || '');

    // 1. Validação de Antecedência Mínima
    if (!eventDateStr) {
      return { success: false, error: 'A data do evento é obrigatória.' };
    }
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var evtDate = new Date(eventDateStr + 'T00:00:00');
    var diffTime = evtDate.getTime() - today.getTime();
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < minDays) {
      return { 
        success: false, 
        error: 'É necessário um mínimo de ' + minDays + ' dias de antecedência para reservas. Escolha uma data a partir de ' + formatDateBR(getMinEventDateString(minDays)) + '.' 
      };
    }

    // 2. Validação de Disponibilidade Anti-Double Booking
    var availCheck = checkAvailability(eventDateStr, order.items || []);
    if (!availCheck.available) {
      return { success: false, error: availCheck.message };
    }

    // 3. Recálculo Autorizado no Backend (Segurança)
    var calculation = calculateAuthoritativePrice(order.items || [], order.city);

    // 4. Geração de ID Único Sequencial
    var ss = getTargetSpreadsheet();
    var sheetReservas = ss.getSheetByName('RESERVAS');
    var sheetItens = ss.getSheetByName('ITENS_RESERVA');
    var sheetClientes = ss.getSheetByName('CLIENTES');

    var nextNum = 101 + sheetReservas.getLastRow();
    var reservationId = '#GN-' + String(nextNum).padStart(5, '0');
    var nowTimestamp = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss');

    // 5. Inserção na aba RESERVAS
    sheetReservas.appendRow([
      reservationId,
      eventDateStr,
      order.startTime || '16:00',
      order.endTime || '23:00',
      order.customerName,
      order.customerWhatsApp,
      order.customerEmail,
      order.needInvoice ? 'SIM' : 'NAO',
      order.invoiceDoc || '',
      order.invoiceName || '',
      order.cep || '',
      order.address || '',
      order.number || '',
      order.complement || '',
      order.neighborhood || '',
      order.city || '',
      order.state || 'SP',
      order.guests || 'Não especificado',
      calculation.subtotal,
      calculation.deliveryFee,
      calculation.total,
      'Pendente',
      order.notes || '',
      nowTimestamp
    ]);

    // 6. Inserção na aba ITENS_RESERVA
    for (var i = 0; i < calculation.items.length; i++) {
      var it = calculation.items[i];
      sheetItens.appendRow([
        reservationId,
        it.productId,
        it.name,
        it.category,
        it.volumeL,
        it.quantity,
        it.unitPrice,
        it.subtotal
      ]);
    }

    // 7. Registro ou Atualização do Cliente
    sheetClientes.appendRow([
      'CLI-' + Date.now().toString().slice(-6),
      order.customerName,
      order.customerWhatsApp,
      order.customerEmail,
      order.needInvoice ? 'SIM' : 'NAO',
      order.invoiceDoc || '',
      nowTimestamp
    ]);

    // 8. Mensagem Formatada para WhatsApp
    var waNumber = String(config.WHATSAPP_CONTATO || '5512999990000').replace(/\D/g, '');
    var waMessage = formatWhatsAppOrderMessage(reservationId, order, calculation, config);
    var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(waMessage);

    return {
      success: true,
      reservationId: reservationId,
      total: calculation.total,
      subtotal: calculation.subtotal,
      deliveryFee: calculation.deliveryFee,
      whatsappUrl: waUrl,
      eventDateFormatted: formatDateBR(eventDateStr)
    };

  } catch (err) {
    return { success: false, error: 'Erro ao processar reserva: ' + err.message };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Formata a mensagem do WhatsApp conforme o requisito do usuário
 */
function formatWhatsAppOrderMessage(resId, order, calc, config) {
  var lines = [];
  lines.push('🍺 *SOLICITAÇÃO DE RESERVA - ' + (config.NOME_EMPRESA || 'CERVEJARIA GUANANDI') + '*');
  lines.push('Número da Reserva: *' + resId + '*');
  lines.push('');
  lines.push('👤 *Cliente:* ' + order.customerName);
  lines.push('📱 *WhatsApp:* ' + order.customerWhatsApp);
  lines.push('📅 *Data:* ' + formatDateBR(order.eventDate));
  lines.push('🕐 *Horário:* ' + (order.startTime || '16:00') + ' às ' + (order.endTime || '23:00'));
  lines.push('📍 *Local:* ' + (order.neighborhood || '') + ' - ' + (order.city || '') + ' / ' + (order.state || 'SP'));
  lines.push('👥 *Convidados:* ' + (order.guests || 'Não informado'));
  lines.push('');
  lines.push('📋 *ITENS RESERVADOS:*');

  for (var i = 0; i < calc.items.length; i++) {
    var item = calc.items[i];
    var volStr = item.volumeL > 0 ? ' (' + item.volumeL + 'L)' : '';
    lines.push(' • ' + item.quantity + 'x ' + item.name + volStr + ' - R$ ' + formatMoney(item.subtotal));
  }

  if (calc.deliveryFee > 0) {
    lines.push(' • Taxa de Entrega (' + order.city + ') - R$ ' + formatMoney(calc.deliveryFee));
  }

  lines.push('');
  lines.push('💰 *TOTAL:* R$ ' + formatMoney(calc.total));
  lines.push('⚡ *Status:* Reserva Recebida (Aguardando Confirmação)');
  if (order.notes) {
    lines.push('📝 *Obs:* ' + order.notes);
  }
  lines.push('');
  lines.push('Por favor, confirme a disponibilidade e instruções de pagamento.');

  return lines.join('\n');
}

// Helpers de Data e Moeda
function normalizeDateString(dateVal) {
  if (!dateVal) return '';
  if (dateVal instanceof Date) {
    return Utilities.formatDate(dateVal, 'America/Sao_Paulo', 'yyyy-MM-dd');
  }
  var str = String(dateVal).split('T')[0];
  return str;
}

function formatDateBR(dateVal) {
  if (!dateVal) return '';
  var parts = normalizeDateString(dateVal).split('-');
  if (parts.length === 3) {
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  return String(dateVal);
}

function formatMoney(num) {
  return Number(num || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getMinEventDateString(days) {
  var d = new Date();
  d.setDate(d.getDate() + (days || 7));
  return Utilities.formatDate(d, 'America/Sao_Paulo', 'yyyy-MM-dd');
}
