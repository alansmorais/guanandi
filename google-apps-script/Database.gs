/**
 * @file Database.gs
 * Camada de acesso e inicialização do banco de dados no Google Sheets
 */

/**
 * Cria e configura todas as abas e cabeçalhos necessários caso ainda não existam.
 * Pode ser executada manualmente no editor do Apps Script para dar bootstrap no sistema.
 */
function setupDatabase() {
  var ss = getTargetSpreadsheet();
  
  // 1. CONFIG
  var sheetConfig = getOrCreateSheet(ss, 'CONFIG', [
    'Chave', 'Valor', 'Descricao'
  ]);
  if (sheetConfig.getLastRow() <= 1) {
    sheetConfig.appendRow(['NOME_EMPRESA', 'Cervejaria Guanandi', 'Nome de exibição da empresa']);
    sheetConfig.appendRow(['WHATSAPP_CONTATO', '5512999990000', 'Número do WhatsApp (DDI + DDD + Telefone)']);
    sheetConfig.appendRow(['ANTECEDENCIA_MIN_DIAS', '7', 'Mínimo de dias de antecedência para reservas']);
    sheetConfig.appendRow(['SENHA_ADMIN', 'admin123', 'Senha de acesso ao painel administrativo']);
    sheetConfig.appendRow(['CHAVE_PIX', 'contato@cervejariaguanandi.com.br', 'Chave Pix para pagamentos']);
    sheetConfig.appendRow(['REGIOES_ENTREGA_JSON', JSON.stringify([
      { city: 'São Sebastião - Centro / Costa Norte', fee: 0 },
      { city: 'São Sebastião - Costa Sul (Maresias, Camburi, Juquehy)', fee: 120 },
      { city: 'Caraguatatuba - Centro / Geral', fee: 220 },
      { city: 'Ilhabela (inclui taxa balsa)', fee: 350 },
      { city: 'Ubatuba - Centro / Sul', fee: 380 },
      { city: 'Retirada no Local (Cervejaria)', fee: 0 }
    ]), 'Regiões e taxas de deslocamento']);
  }

  // 2. PRODUTOS
  var sheetProd = getOrCreateSheet(ss, 'PRODUTOS', [
    'ID', 'Nome', 'Categoria', 'Descricao', 'Volume_L', 'Preco', 'Estoque_Total', 'Ativo'
  ]);
  if (sheetProd.getLastRow() <= 1) {
    // Serviços principais / Equipamentos
    sheetProd.appendRow(['CHO-01', 'Chopeira Elétrica 2 Vias', 'chopeira', 'Capacidade 70L/h, 220V com cilindro de CO2 e pingadeira', 0, 150.00, 5, 'SIM']);
    sheetProd.appendRow(['CHO-02', 'Chopeira a Gelo (Caixa Térmica)', 'chopeira', 'Ideal para praia ou locais sem tomada, com serpentina inox', 0, 90.00, 4, 'SIM']);
    sheetProd.appendRow(['TRK-01', 'The Beer Truck Guanandi', 'beertruck', 'Estrutura completa estilizada com 4 a 6 torneiras de chopp', 0, 800.00, 1, 'SIM']);
    sheetProd.appendRow(['TEN-01', 'Tenda Sanfonada 3x3m', 'tenda', 'Tenda articulada reforçada impermeável com laterais opcionais', 0, 250.00, 4, 'SIM']);
    sheetProd.appendRow(['TEN-02', 'Tenda Grande 6x3m', 'tenda', 'Cobertura ampla para grandes eventos e área de chopeira', 0, 450.00, 2, 'SIM']);
    sheetProd.appendRow(['PAC-01', 'Pacote Festa Completa', 'pacote', 'Beer Truck + Tenda 6x3 + 20 Jogos de Mesa + Som Básico', 0, 1500.00, 1, 'SIM']);

    // Cervejas e Chopp em Barris (Valores do cardápio de referência)
    sheetProd.appendRow(['CER-01', 'Pilsen Puro Malte', 'cerveja', 'Cerveja clara, leve, refrescante e muito equilibrada', 30, 450.00, 25, 'SIM']);
    sheetProd.appendRow(['CER-02', 'Pilsen Puro Malte', 'cerveja', 'Cerveja clara, leve, refrescante e muito equilibrada', 50, 750.00, 30, 'SIM']);
    sheetProd.appendRow(['CER-03', 'American IPA', 'cerveja', 'Aroma cítrico intenso com lúpulos americanos selecionados', 30, 660.00, 15, 'SIM']);
    sheetProd.appendRow(['CER-04', 'American IPA', 'cerveja', 'Aroma cítrico intenso com lúpulos americanos selecionados', 50, 1100.00, 15, 'SIM']);
    sheetProd.appendRow(['CER-05', 'Cream Ale com Limão Siciliano', 'cerveja', 'Extremamente refrescante, Abv 4,8% Ibu 12 com toque cítrico', 30, 540.00, 15, 'SIM']);
    sheetProd.appendRow(['CER-06', 'Cream Ale com Limão Siciliano', 'cerveja', 'Extremamente refrescante, Abv 4,8% Ibu 12 com toque cítrico', 50, 900.00, 15, 'SIM']);
    sheetProd.appendRow(['CER-07', 'Weissbier Trigo Especial', 'cerveja', 'Cerveja tradicional de trigo, aromas de banana e cravo', 30, 540.00, 12, 'SIM']);
    sheetProd.appendRow(['CER-08', 'Weissbier Trigo Especial', 'cerveja', 'Cerveja tradicional de trigo, aromas de banana e cravo', 50, 900.00, 12, 'SIM']);
    sheetProd.appendRow(['CER-09', 'Chope Red Ale Maltado', 'cerveja', 'Coloração avermelhada, notas tostadas e caramelo suave', 30, 540.00, 10, 'SIM']);
    sheetProd.appendRow(['CER-10', 'Chope Red Ale Maltado', 'cerveja', 'Coloração avermelhada, notas tostadas e caramelo suave', 50, 900.00, 10, 'SIM']);
    sheetProd.appendRow(['CER-11', 'Chope Artesanal de Morango', 'cerveja', 'Frutado, aroma intenso da fruta, leve acidez e dulçor harmônico', 30, 540.00, 10, 'SIM']);
    sheetProd.appendRow(['CER-12', 'Chope Artesanal de Morango', 'cerveja', 'Frutado, aroma intenso da fruta, leve acidez e dulçor harmônico', 50, 900.00, 10, 'SIM']);

    // Itens Adicionais e Serviços
    sheetProd.appendRow(['EXT-01', 'Jogo de Mesa de Madeira (1 mesa + 4 cadeiras)', 'adicional', 'Conjunto bistrô/bar dobrável de madeira maciça', 0, 35.00, 30, 'SIM']);
    sheetProd.appendRow(['EXT-02', 'Copo de Acrílico Personalizado 400ml (Pct 50 un)', 'adicional', 'Copos reutilizáveis rígidos de alta qualidade', 0, 75.00, 50, 'SIM']);
    sheetProd.appendRow(['EXT-03', 'Balcão de Atendimento Móvel em Madeira', 'adicional', 'Bancada charmosa rústica para apoiar a chopeira', 0, 120.00, 3, 'SIM']);
    sheetProd.appendRow(['SRV-01', 'Serviço de Montagem & Calibração Especializada', 'servico', 'Técnico prepara a chopeira, temperatura e pressão do gás', 0, 80.00, 10, 'SIM']);
    sheetProd.appendRow(['SRV-02', 'Tirador de Chopp / Bartender Dedicado (4 horas)', 'servico', 'Profissional treinado para servir chopp com colarinho perfeito', 0, 250.00, 4, 'SIM']);
  }

  // 3. RESERVAS
  getOrCreateSheet(ss, 'RESERVAS', [
    'ID', 'Data_Evento', 'Hora_Inicio', 'Hora_Termino', 'Cliente_Nome', 
    'Cliente_WhatsApp', 'Cliente_Email', 'Precisa_NF', 'Documento_NF', 'Razao_Social_NF',
    'CEP', 'Endereco', 'Numero', 'Complemento', 'Bairro', 'Cidade', 'Estado',
    'Convidados', 'Subtotal_Produtos', 'Taxa_Entrega', 'Total_Geral', 
    'Status', 'Observacoes', 'Criado_Em'
  ]);

  // 4. ITENS_RESERVA
  getOrCreateSheet(ss, 'ITENS_RESERVA', [
    'ID_Reserva', 'ID_Produto', 'Nome_Produto', 'Categoria', 'Volume_L', 'Quantidade', 'Preco_Unitario', 'Subtotal'
  ]);

  // 5. CLIENTES
  getOrCreateSheet(ss, 'CLIENTES', [
    'ID', 'Nome', 'WhatsApp', 'Email', 'Precisa_NF', 'Documento_NF', 'Criado_Em'
  ]);

  // 6. PAGAMENTOS
  getOrCreateSheet(ss, 'PAGAMENTOS', [
    'ID_Reserva', 'Valor', 'Metodo', 'Status', 'Data_Pagamento', 'Comprovante_Obs'
  ]);

  return { success: true, message: 'Banco de dados configurado com sucesso!' };
}

/**
 * Cria uma aba se ela não existir e formata o cabeçalho
 */
function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#1a1a1a')
      .setFontColor('#f59e0b');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Converte os dados de uma aba em um array de objetos usando o cabeçalho como chaves
 * @param {Sheet} sheet
 * @return {Array<Object>}
 */
function getSheetRecords(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var records = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var item = { _rowIndex: i + 1 };
    for (var j = 0; j < headers.length; j++) {
      var key = String(headers[j]).trim();
      item[key] = row[j];
    }
    records.push(item);
  }
  return records;
}
