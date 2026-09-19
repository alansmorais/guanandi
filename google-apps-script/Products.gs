/**
 * @file Products.gs
 * Gerenciamento de catálogo, cervejas, equipamentos e serviços
 */

/**
 * Retorna todos os produtos ativos para o formulário de reserva do cliente
 * @return {Array<Object>}
 */
function getActiveProducts() {
  var ss = getTargetSpreadsheet();
  var sheet = ss.getSheetByName('PRODUTOS');
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName('PRODUTOS');
  }

  var records = getSheetRecords(sheet);
  var active = [];

  for (var i = 0; i < records.length; i++) {
    var p = records[i];
    if (String(p.Ativo).toUpperCase() === 'SIM') {
      active.push({
        id: String(p.ID),
        name: String(p.Nome),
        category: String(p.Categoria).toLowerCase(),
        description: String(p.Descricao || ''),
        volumeL: Number(p.Volume_L || 0),
        price: Number(p.Preco || 0),
        stock: Number(p.Estoque_Total || 0)
      });
    }
  }

  return active;
}

/**
 * Retorna o mapa de produtos indexado por ID para lookup rápido e recálculo seguro no backend
 * @return {Object.<string, Object>}
 */
function getProductsMapById() {
  var ss = getTargetSpreadsheet();
  var sheet = ss.getSheetByName('PRODUTOS');
  var records = getSheetRecords(sheet);
  var map = {};

  for (var i = 0; i < records.length; i++) {
    var p = records[i];
    map[String(p.ID)] = {
      id: String(p.ID),
      name: String(p.Nome),
      category: String(p.Categoria).toLowerCase(),
      description: String(p.Descricao || ''),
      volumeL: Number(p.Volume_L || 0),
      price: Number(p.Preco || 0),
      stock: Number(p.Estoque_Total || 0),
      active: String(p.Ativo).toUpperCase() === 'SIM',
      rowIndex: p._rowIndex
    };
  }
  return map;
}

/**
 * Retorna todos os produtos (incluindo inativos) para o painel de administração
 * @return {Array<Object>}
 */
function getAllProductsAdmin() {
  var ss = getTargetSpreadsheet();
  var sheet = ss.getSheetByName('PRODUTOS');
  var records = getSheetRecords(sheet);

  return records.map(function(p) {
    return {
      id: String(p.ID),
      name: String(p.Nome),
      category: String(p.Categoria).toLowerCase(),
      description: String(p.Descricao || ''),
      volumeL: Number(p.Volume_L || 0),
      price: Number(p.Preco || 0),
      stock: Number(p.Estoque_Total || 0),
      active: String(p.Ativo).toUpperCase() === 'SIM'
    };
  });
}

/**
 * Salva ou atualiza um produto na aba PRODUTOS
 * @param {Object} item Dados do produto
 * @return {Object} Resultado
 */
function saveProduct(item) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var ss = getTargetSpreadsheet();
    var sheet = ss.getSheetByName('PRODUTOS');
    var records = getSheetRecords(sheet);
    var existing = null;

    if (item.id) {
      for (var i = 0; i < records.length; i++) {
        if (String(records[i].ID) === String(item.id)) {
          existing = records[i];
          break;
        }
      }
    }

    var activeText = item.active ? 'SIM' : 'NAO';

    if (existing) {
      // Atualiza linha existente
      sheet.getRange(existing._rowIndex, 2, 1, 7).setValues([[
        item.name,
        item.category,
        item.description || '',
        Number(item.volumeL || 0),
        Number(item.price || 0),
        Number(item.stock || 0),
        activeText
      ]]);
      return { success: true, message: 'Produto atualizado com sucesso!', id: item.id };
    } else {
      // Cria novo produto
      var newId = item.id || ('PRD-' + (records.length + 1));
      sheet.appendRow([
        newId,
        item.name,
        item.category,
        item.description || '',
        Number(item.volumeL || 0),
        Number(item.price || 0),
        Number(item.stock || 0),
        activeText
      ]);
      return { success: true, message: 'Produto cadastrado com sucesso!', id: newId };
    }
  } catch (err) {
    return { success: false, error: err.message };
  } finally {
    lock.releaseLock();
  }
}
