/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dados Estruturados e Conteúdo Local Autêntico para SEO
 * Cidades do Litoral Norte de SP: Caraguatatuba, São Sebastião, Ilhabela, Ubatuba
 */

export interface LocalCityData {
  slug: string;
  cityName: string;
  title: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  logisticsInfo: {
    baseDistance: string;
    deliveryFeeInfo: string;
    leadTimeNotice: string;
    keyNeighborhoods: string[];
    logisticsDescription: string;
  };
  eventTypes: {
    title: string;
    description: string;
  }[];
  equipmentHighlights: {
    name: string;
    badge: string;
    detail: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  localTip: string;
}

export const LOCAL_CITIES: Record<string, LocalCityData> = {
  caraguatatuba: {
    slug: "chope-caraguatatuba",
    cityName: "Caraguatatuba",
    title: "Chope Artesanal & Aluguel de Chopeiras em Caraguatatuba | Cervejaria Guanandi",
    metaDescription: "Locação de chopeiras elétricas 2 vias, barris de chopp 30L e 50L e Beer Truck em Caraguatatuba. Atendimento pontual em condomínios e praias da região.",
    heroHeadline: "Chope Artesanal e Estrutura para Festas em Caraguatatuba",
    heroSubheadline: "Atendemos casamentos, aniversários e confraternizações em Caraguatatuba com chope fresco direto dos barris, dispensadores elétricos profissionais e suporte completo na montagem.",
    logisticsInfo: {
      baseDistance: "Aprox. 25 a 35 km da base de produção",
      deliveryFeeInfo: "Frete tabelado para Caraguatatuba (R$ 220,00 entrega e recolhimento)",
      leadTimeNotice: "Recomendamos reserva com no mínimo 7 dias de antecedência para garantir chopp recém-embarrilado.",
      keyNeighborhoods: [
        "Mococa",
        "Tabatinga (Condomínios Costa Verde)",
        "Cocanha e Massaguaçu",
        "Martim de Sá",
        "Indaiá e Prainha",
        "Centro e Porto Novo"
      ],
      logisticsDescription: "Nossa equipe sobe a rodovia Rio-Santos com antecedência no dia do evento, posicionando a chopeira com nivelamento adequado, fazendo a regulagem do manômetro de CO2 e deixando a primeira sangria no ponto ideal de temperatura."
    },
    eventTypes: [
      {
        title: "Casamentos e Recepções em Tabatinga e Mococa",
        description: "Eventos em casas de praia e condomínios fechados exigem chopp estável e dispensadores silenciosos de alta vazão para atender grupos de 40 a 250 pessoas."
      },
      {
        title: "Churrascos e Confraternizações Familiares",
        description: "Barris de 30L ou 50L de Pilsen Puro Malte acompanhados de torneira belga com controle preciso de colarinho, evitando desperdício e espuma excessiva sob o calor litorâneo."
      },
      {
        title: "Eventos Corporativos e Esportivos em Caraguá",
        description: "Opção de estrutura com Beer Truck ou tendas reforçadas para festivais na praia, feiras náuticas e torneios de beach tennis."
      }
    ],
    equipmentHighlights: [
      {
        name: "Chopeira Elétrica 2 Vias (45 a 55 L/h)",
        badge: "Mais Pedida",
        detail: "Permite servir dois estilos diferentes simultaneamente (ex: Pilsen + IPA) mantendo saída entre 0°C e 2°C."
      },
      {
        name: "Barris de Chopp 30L e 50L Gelados",
        badge: "Produção Fresca",
        detail: "Chopp não pasteurizado, mantido sob refrigeração até o momento do transporte na rodovia."
      },
      {
        name: "The Beer Truck Guanandi",
        badge: "Eventos Grandes",
        detail: "Unidade móvel estilizada com até 6 bicos para grandes comemorações e festivais em Caraguatatuba."
      }
    ],
    faqs: [
      {
        question: "Como funciona a entrega de chopp em condomínios fechados de Caraguatatuba?",
        answer: "Solicitamos apenas o envio prévio da autorização de entrada na portaria com placa do veículo. Entregamos e instalamos diretamente na área gourmet ou salão de festas da residência."
      },
      {
        question: "Qual voltagem é necessária para a chopeira elétrica em Caraguatatuba?",
        answer: "A maioria das nossas chopeiras profissionais opera em 220V para garantir resfriamento ultra-rápido mesmo em dias quentes de verão. Caso o imóvel disponha apenas de 110V, fornecemos autotransformador de alta potência mediante aviso prévio."
      },
      {
        question: "Quantos litros de chope devo calcular por convidado em uma festa em Caraguá?",
        answer: "No clima litorâneo, a média segura recomendada é de 1,5 a 2 litros por adulto para eventos de 4 a 6 horas de duração. Se houver outras bebidas ou for churrasco de dia todo, calcule 2,5 litros por pessoa."
      }
    ],
    localTip: "Em condomínios na Tabatinga e Cocanha, o agendamento de entrega matinal garante que a chopeira atinja a temperatura de congelamento antes do horário de almoço dos convidados."
  },

  "sao-sebastiao": {
    slug: "chope-sao-sebastiao",
    cityName: "São Sebastião",
    title: "Chope Artesanal & Aluguel de Chopeiras em São Sebastião | Guanandi",
    metaDescription: "Cervejaria local em São Sebastião. Aluguel de chopeiras elétricas e barris de chopp artesanal do Centro até Maresias, Juquehy e Cambury. Atendimento ágil.",
    heroHeadline: "Chopp Fresco da Cervejaria Guanandi em São Sebastião",
    heroSubheadline: "Produzido e distribuído no próprio município. Entregamos chopp artesanal vivo, chopeiras elétricas reguladas e suporte local imediato do Centro histórico às praias da Costa Sul.",
    logisticsInfo: {
      baseDistance: "Base Local em São Sebastião (Centro / Costa Norte)",
      deliveryFeeInfo: "Taxa Zero no Centro e Costa Norte; Frete especial para praias da Costa Sul (Maresias, Cambury, Juquehy, Sahy).",
      leadTimeNotice: "Por estarmos sediados em São Sebastião, atendemos demandas com facilidade e reposição rápida de barris adicionais.",
      keyNeighborhoods: [
        "Centro Histórico e São Francisco",
        "Maresias e Paúba",
        "Cambury e Camburizinho",
        "Juquehy e Barra do Una",
        "Barra do Sahy e Baleia",
        "Enseada e Cigarras"
      ],
      logisticsDescription: "Nossa base operacional fica em São Sebastião, o que garante menor tempo de trânsito para o chopp, máxima retenção de frescor e aromas dos lúpulos, além de assistência presencial expressa durante o final de semana."
    },
    eventTypes: [
      {
        title: "Casamentos pé na areia em Maresias e Juquehy",
        description: "Recepções elegantes exigem apresentação impecável. Nossas chopeiras com acabamento preto fosco combinam perfeitamente com a decoração rústico-chique de casamentos no litoral."
      },
      {
        title: "Temporada de Verão e Finais de Semana",
        description: "Aluguel semanal ou de fim de semana para casas de veraneio. Instalamos a chopeira na sexta-feira e recolhemos no domingo ou segunda, sem complicações."
      },
      {
        title: "Festas Tradicionais e Encontros no Centro",
        description: "Atendimento direto para empresas, marinas do Canal e eventos comunitários com torneiras adicionais e barris extras em consignação programada."
      }
    ],
    equipmentHighlights: [
      {
        name: "Dispensadores Elétricos 2 Vias",
        badge: "Base Local",
        detail: "Termostato digital regulado para manter o chopp entre 0°C e 1°C mesmo ao ar livre sob sol forte."
      },
      {
        name: "Linha Completa de Estilos Artesanais",
        badge: "Direto da Fábrica",
        detail: "Pilsen refrescante, Session IPA tropical, German Weiss de trigo, APA cítrica e Stout encorpada."
      },
      {
        name: "Tendas Sanfonadas 3x3m com Calhas",
        badge: "Proteção Solar",
        detail: "Estrutura para proteger a estação de chopp da maresia, vento e incidência solar direta."
      }
    ],
    faqs: [
      {
        question: "Vocês atendem toda a Costa Sul de São Sebastião?",
        answer: "Sim! Cobrimos desde Toque-Toque, Maresias, Boiçucanga até Cambury, Barra do Sahy, Baleia, Juquehy e Barra do Una, com horário agendado de entrega e retirada."
      },
      {
        question: "Se o chope acabar durante a festa em São Sebastião, posso pedir outro barril?",
        answer: "Como nossa base fica no município, mantemos barris de reserva sob consulta. Se você antecipar essa possibilidade na reserva, deixamos um barril extra consignado lacrado."
      },
      {
        question: "Vocês realizam a instalação no local?",
        answer: "Sim. Nossos técnicos posicionam o equipamento, conectam o barril, acoplam a válvula extratora tipo S/G, testam a pressão do gás e demonstram como tirar o chope perfeitamente."
      }
    ],
    localTip: "Em casas na Costa Sul (Juquehy e Cambury), a maresia e umidade pedem que a chopeira fique em área coberta e bem arejada para otimizar a condensação do bloco de gelo interno."
  },

  ilhabela: {
    slug: "chope-ilhabela",
    cityName: "Ilhabela",
    title: "Aluguel de Chopeiras & Chopp Artesanal em Ilhabela | Guanandi",
    metaDescription: "Locação de chopeiras elétricas e barris de chopp artesanal em Ilhabela. Logística com travessia de balsa programada para casamentos e vilas na ilha.",
    heroHeadline: "Chope Artesanal para Casamentos e Eventos em Ilhabela",
    heroSubheadline: "Especialistas na logística de Ilhabela. Planejamos a travessia de balsa, montamos chopeiras profissionais 2 vias e entregamos barris gelados em hotéis, pousadas e residências.",
    logisticsInfo: {
      baseDistance: "Travessia de Balsa São Sebastião ↔ Ilhabela",
      deliveryFeeInfo: "Taxa de frete inclui custo de balsa com hora marcada e transporte especial na ilha.",
      leadTimeNotice: "Reserva essencial com 10 a 14 dias de antecedência para agendamento da travessia de veículos pesados.",
      keyNeighborhoods: [
        "Vila Histórica (Centro de Ilhabela)",
        "Perequê e Itaguassu",
        "Praia da Feiticeira e Julião",
        "Praia do Curral",
        "Armação e Siriúba",
        "Ilhabela Sul e Ponta da Sela"
      ],
      logisticsDescription: "Eventos em Ilhabela demandam rigor logístico. Utilizamos travessia prioritária agendada para evitar filas, transportamos os barris em isolamento térmico reforçado e garantimos que tudo esteja operando horas antes do início da cerimônia."
    },
    eventTypes: [
      {
        title: "Destination Weddings e Mini-Weddings",
        description: "Ilhabela é a capital nacional dos casamentos na praia. Levamos torneiras belgas refinadas com acabamento em aço inox e chopp artesanal premiado que impressiona noivos e convidados."
      },
      {
        title: "Festas em Pousadas, Iates e Marinas",
        description: "Abastecimento para finais de semana de regatas, aniversários à beira-mar e comemorações privadas com chopeiras compactas de alta capacidade."
      },
      {
        title: "Almoços e Luais de Boas-Vindas (Welcome Drinks)",
        description: "Barril de 30L ou 50L de chope leve e aromático para recepcionar amigos que chegam à ilha no dia anterior ao evento principal."
      }
    ],
    equipmentHighlights: [
      {
        name: "Chopeira Elétrica Bivolt Especial / 220V",
        badge: "Wedding Ready",
        detail: "Visual sóbrio, torneiras duplas italianas com controle fino de vazão e silêncio absoluto na refrigeração."
      },
      {
        name: "Cilindro de CO2 Grau Alimentício Cheio",
        badge: "Autonomia 100%",
        detail: "Capacidade de extração para até 4 barris sem perda de pressão ou descarbonatação da cerveja."
      },
      {
        name: "Beer Truck para Espaços Abertos",
        badge: "Exclusivo",
        detail: "Ideal para pousadas e praias com espaço gramado amplo que comportam veículo clássico de chopp."
      }
    ],
    faqs: [
      {
        question: "Como é calculada a logística e travessia da balsa para Ilhabela?",
        answer: "O valor do frete já inclui o agendamento de balsa com horário marcado (hora marcada da DERSA) tanto na ida quanto na volta, garantindo pontualidade britânica sem risco de atraso por fila."
      },
      {
        question: "Posso alugar para casamentos em locais de difícil acesso na ilha?",
        answer: "Sim, atendemos locais no extremo sul e norte da ilha. Caso o acesso envolva muitas escadarias ou terreno irregular, nossa equipe avalia previamente para escalar o número correto de operadores."
      },
      {
        question: "Qual chopp é mais recomendado para casamentos de dia na praia em Ilhabela?",
        answer: "Recomendamos a combinação de 1 barril de Pilsen Puro Malte (leve, dourado e super refrescante) com 1 barril de Session IPA ou German Weiss (aromáticos e frutados), agradando a todos os paladares."
      }
    ],
    localTip: "Para casamentos ao ar livre na Feiticeira ou Curral, instale a chopeira próxima a uma tomada dedicada e protegida do sol da tarde para preservar a vazão contínua a 1°C."
  },

  ubatuba: {
    slug: "chope-ubatuba",
    cityName: "Ubatuba",
    title: "Chope Artesanal & Aluguel de Chopeiras em Ubatuba | Guanandi",
    metaDescription: "Locação de chopeiras elétricas e barris de chopp artesanal em Ubatuba. Do Centro e Itaguá até Itamambuca e Praia Grande. Chopp gelado garantido.",
    heroHeadline: "Chope Artesanal de Verdade para Eventos em Ubatuba",
    heroSubheadline: "Levamos a experiência da fábrica para a capital do surfe. Chopeiras profissionais de 2 torneiras, chope vivo e refrescante para churrascos, festas de surf e casamentos em Ubatuba.",
    logisticsInfo: {
      baseDistance: "Aprox. 60 a 75 km via Rodovia Rio-Santos",
      deliveryFeeInfo: "Frete programado para Ubatuba com rotas matinais pré-agendadas.",
      leadTimeNotice: "Agendamento com 7 a 10 dias de antecedência para consolidação de rota na Rio-Santos.",
      keyNeighborhoods: [
        "Itaguá e Centro",
        "Praia Grande e Tenório",
        "Enseada e Santa Rita",
        "Maranduba e Sapê",
        "Itamambuca e Vermelha do Norte",
        "Félix e Prumirim"
      ],
      logisticsDescription: "Transportamos os equipamentos devidamente acondicionados em veículos de carga com amortecimento especial, assegurando que os barris cheguem sem agitação excessiva para evitar espuma na primeira tiragem."
    },
    eventTypes: [
      {
        title: "Festas e Churrascos de Temporada em Ubatuba",
        description: "Reunir a galera em casas de temporada na Praia Grande ou Enseada com barril de 50L de chope gelado sai muito mais em conta e prático do que carregar fardos de latas."
      },
      {
        title: "Comemorações Pós-Surf e Campeonatos",
        description: "Em praias como Itamambuca e Vermelha, nosso chopp artesanal Puro Malte e Session IPA combinam perfeitamente com a energia esportiva e o clima praiano."
      },
      {
        title: "Casamentos e Bodas à Beira-Mar em Ubatuba",
        description: "Estrutura completa com chopeira 2 vias, mesas de apoio, copos e consultoria de estilos cervejeiros para noivos que valorizam qualidade artesanal autêntica."
      }
    ],
    equipmentHighlights: [
      {
        name: "Chopeira Elétrica 2 Vias de Alto Rendimento",
        badge: "Alta Vazão",
        detail: "Capaz de abastecer grupos contínuos sem elevar a temperatura da cerveja no copo."
      },
      {
        name: "Barris de Chopp com Lacre de Segurança",
        badge: "Pureza 100%",
        detail: "Cerveja viva com maltes selecionados e lúpulos importados, sem conservantes químicos."
      },
      {
        name: "Kits de Conexão Rápida e Suporte Telefônico",
        badge: "Praticidade",
        detail: "Manual ilustrado e canal WhatsApp direto com nosso mestre cervejeiro durante todo o evento."
      }
    ],
    faqs: [
      {
        question: "Vocês atendem praias do norte de Ubatuba, como Itamambuca e Félix?",
        answer: "Sim, realizamos entregas tanto no sul (Maranduba, Enseada) quanto no centro (Itaguá) e praias do norte (Itamambuca, Félix e Prumirim)."
      },
      {
        question: "Qual é o procedimento se chover no dia do evento em Ubatuba?",
        answer: "Ubatuba tem clima tropical dinâmico. Recomendamos posicionar a chopeira em varandas ou áreas com cobertura. Também disponibilizamos locação de tendas sanfonadas impermeáveis caso necessário."
      },
      {
        question: "Quanto tempo dura um barril de chope conectado na chopeira em Ubatuba?",
        answer: "Como o sistema é pressurizado por CO2 alimentar e mantido gelado, o chopp mantém frescor e características originais perfeitas por até 48 a 72 horas após conectado."
      }
    ],
    localTip: "Para eventos no Itaguá ou Praia Grande em feriados prolongados, reserve sua rota de entrega na véspera para contornar o tráfego da rodovia Rio-Santos com tranquilidade."
  }
};
