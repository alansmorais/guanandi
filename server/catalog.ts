/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Catálogo Oficial de Chopes e Preços do Servidor
 * Usado para validação obrigatória contra alterações maliciosas de preço no frontend.
 */

export interface BeerProduct {
  id: string;
  name: string;
  style: string;
  description: string;
  abv: string;
  ibu: number;
  price30L: number;
  price50L: number;
  available: boolean;
}

export const OFFICIAL_BEERS: BeerProduct[] = [
  {
    id: "pilsen",
    name: "Pilsen",
    style: "Cerveja clara e leve",
    description: "Nossa Pilsen é uma cerveja clara, leve e extremamente refrescante. Ideal para todos os tipos de celebrações.",
    abv: "4.8%",
    ibu: 12,
    price30L: 450,
    price50L: 750,
    available: true,
  },
  {
    id: "american-ipa",
    name: "American IPA",
    style: "Lúpulos Americanos",
    description: "Cerveja com lúpulos americanos selecionados, trazendo aroma cítrico e amargor equilibrado.",
    abv: "6.2%",
    ibu: 45,
    price30L: 660,
    price50L: 1100,
    available: true,
  },
  {
    id: "cream-ale",
    name: "Cream Ale",
    style: "Com limão siciliano",
    description: "Refrescante e leve, com a adição de limão siciliano. Abv 4,8% Ibu 12.",
    abv: "4.8%",
    ibu: 12,
    price30L: 540,
    price50L: 900,
    available: true,
  },
  {
    id: "weiss",
    name: "WEISS",
    style: "Cerveja com malte de trigo",
    description: "Cerveja de trigo tradicional, com notas características de cravo e banana.",
    abv: "5.0%",
    ibu: 12,
    price30L: 540,
    price50L: 900,
    available: true,
  },
  {
    id: "red-ale",
    name: "Chope Red Ale",
    style: "Maltes levemente tostados",
    description: "Cerveja avermelhada com complexidade de maltes levemente tostados.",
    abv: "5.4%",
    ibu: 18,
    price30L: 540,
    price50L: 900,
    available: true,
  },
  {
    id: "morango",
    name: "Chope de Morango",
    style: "Frutada & Doce",
    description: "Chopp frutado com sabor intenso de morango, perfeito para quem busca doçura e frescor.",
    abv: "4.5%",
    ibu: 8,
    price30L: 540,
    price50L: 900,
    available: true,
  },
];

export const REGIONS_FEES: Record<string, number> = {
  "Caraguatatuba": 80,
  "São Sebastião": 120,
  "Ilhabela": 220,
  "Ubatuba": 160,
};

export function getBeerById(id: string): BeerProduct | undefined {
  return OFFICIAL_BEERS.find((b) => b.id === id);
}

export function calculateVerifiedPrice(payload: {
  beerId: string;
  kegSize: 30 | 50;
  quantity: number;
  secondBeerAdded?: boolean;
  secondBeer?: { beerId: string; kegSize: 30 | 50; quantity?: number } | null;
  extractorFee?: number;
  cityName?: string;
}): {
  valid: boolean;
  totalPrice: number;
  firstBeerPrice: number;
  secondBeerPrice: number;
  logisticsFee: number;
  extractorFee: number;
  error?: string;
} {
  const beer1 = getBeerById(payload.beerId);
  if (!beer1) {
    return { valid: false, totalPrice: 0, firstBeerPrice: 0, secondBeerPrice: 0, logisticsFee: 0, extractorFee: 0, error: "Cerveja principal não encontrada no catálogo." };
  }
  if (!beer1.available) {
    return { valid: false, totalPrice: 0, firstBeerPrice: 0, secondBeerPrice: 0, logisticsFee: 0, extractorFee: 0, error: `A cerveja ${beer1.name} está temporariamente indisponível.` };
  }

  const unitPrice1 = payload.kegSize === 50 ? beer1.price50L : beer1.price30L;
  const firstBeerPrice = unitPrice1 * (payload.quantity || 1);

  let secondBeerPrice = 0;
  if (payload.secondBeerAdded && payload.secondBeer) {
    const beer2 = getBeerById(payload.secondBeer.beerId);
    if (!beer2) {
      return { valid: false, totalPrice: 0, firstBeerPrice: 0, secondBeerPrice: 0, logisticsFee: 0, extractorFee: 0, error: "Segunda cerveja não encontrada no catálogo." };
    }
    if (!beer2.available) {
      return { valid: false, totalPrice: 0, firstBeerPrice: 0, secondBeerPrice: 0, logisticsFee: 0, extractorFee: 0, error: `A cerveja ${beer2.name} está indisponível.` };
    }
    const unitPrice2 = payload.secondBeer.kegSize === 50 ? beer2.price50L : beer2.price30L;
    secondBeerPrice = unitPrice2 * (payload.secondBeer.quantity || 1);
  }

  const logisticsFee = payload.cityName && REGIONS_FEES[payload.cityName] !== undefined
    ? REGIONS_FEES[payload.cityName]
    : 80;

  const extractorFee = Math.max(0, Number(payload.extractorFee) || 0);
  const totalPrice = firstBeerPrice + secondBeerPrice + logisticsFee + extractorFee;

  return {
    valid: true,
    totalPrice,
    firstBeerPrice,
    secondBeerPrice,
    logisticsFee,
    extractorFee,
  };
}
