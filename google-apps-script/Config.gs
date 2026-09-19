/**
 * @file Config.gs
 * Gerenciamento de configurações e regras da aplicação
 */

var SPREADSHEET_ID_PROPERTY = 'SPREADSHEET_ID';

/**
 * Obtém a planilha ativa associada ao script ou pela ID salva em ScriptProperties
 * @return {Spreadsheet}
 */
function getTargetSpreadsheet() {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {
    // Pode ocorrer se o script não estiver container-bound
  }
  
  var propId = PropertiesService.getScriptProperties().getProperty(SPREADSHEET_ID_PROPERTY);
  if (propId) {
    return SpreadsheetApp.openById(propId);
  }
  
  throw new Error('Nenhuma planilha vinculada. Execute a função setupDatabase() ou configure SPREADSHEET_ID nas Propriedades do Script.');
}

/**
 * Lê todas as chaves e valores da aba CONFIG
 * @return {Object} Mapeamento chave/valor
 */
function getConfigMap() {
  var ss = getTargetSpreadsheet();
  var sheet = ss.getSheetByName('CONFIG');
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName('CONFIG');
  }

  var data = sheet.getDataRange().getValues();
  var config = {};
  
  // Pula o cabeçalho (linha 1)
  for (var i = 1; i < data.length; i++) {
    var key = String(data[i][0]).trim();
    var val = data[i][1];
    if (key) {
      config[key] = val;
    }
  }
  return config;
}

/**
 * Retorna as regiões e valores de frete configurados
 * @return {Array<{city: string, fee: number}>}
 */
function getDeliveryRegions() {
  var config = getConfigMap();
  var defaultRegions = [
    { city: 'São Sebastião - Centro / Costa Norte', fee: 0 },
    { city: 'São Sebastião - Costa Sul (Maresias, Cambury, Juquehy)', fee: 120 },
    { city: 'Caraguatatuba - Todas as regiões', fee: 220 },
    { city: 'Ilhabela (balsa inclusa)', fee: 350 },
    { city: 'Ubatuba - Centro / Sul', fee: 380 },
    { city: 'Retirada no Local (sem taxa de entrega)', fee: 0 }
  ];

  if (config.REGIOES_ENTREGA_JSON) {
    try {
      var parsed = JSON.parse(config.REGIOES_ENTREGA_JSON);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn('Falha ao processar REGIOES_ENTREGA_JSON:', e);
    }
  }
  return defaultRegions;
}
