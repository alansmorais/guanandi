/**
 * @file Code.gs
 * Ponto de entrada e roteador da Web App (Google Apps Script)
 * Suporta o fluxo do cliente (reserva) e o painel administrativo (?page=admin)
 */

/**
 * Função principal doGet para servir a aplicação web
 * @param {Object} e Parâmetros da requisição HTTP GET
 * @return {HtmlOutput}
 */
function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) ? e.parameter.page.toLowerCase() : 'client';
  
  var template;
  var title;
  
  if (page === 'admin') {
    template = HtmlService.createTemplateFromFile('Admin');
    title = 'Painel Administrativo | Reservas de Eventos';
  } else {
    template = HtmlService.createTemplateFromFile('Index');
    title = 'Reserva de Chopp & Equipamentos para Eventos';
  }

  return template.evaluate()
    .setTitle(title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Utilitário para incluir arquivos HTML parciais (CSS e JS) nos templates
 * @param {string} filename Nome do arquivo sem extensão
 * @return {string} Conteúdo do arquivo
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Retorna os dados iniciais para o carregamento rápido do frontend
 * @return {Object} Configurações, produtos ativos e regiões
 */
function getInitialClientData() {
  try {
    var config = getConfigMap();
    var products = getActiveProducts();
    var regions = getDeliveryRegions();
    
    return {
      success: true,
      config: {
        companyName: config.NOME_EMPRESA || 'Cervejaria Guanandi',
        whatsapp: config.WHATSAPP_CONTATO || '',
        minLeadDays: parseInt(config.ANTECEDENCIA_MIN_DIAS || '7', 10),
        currency: 'BRL'
      },
      products: products,
      regions: regions
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
