/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Beer {
  id: string;
  name: string;
  style: string;
  description: string;
  abv: string;
  ibu: number;
  price30L: number;
  price50L: number;
  tag?: string;
  image: string;
  badge?: string;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  capacity: string;
  power: string;
  taps: string;
  idealFor: string;
  category: string;
  image: string;
  price?: number;
  specs: {
    label: string;
    value: string;
  }[];
}

export interface Reservation {
  id?: string;
  reservationCode?: string;
  beerId: string;
  beerName: string;
  kegSize: 30 | 50;
  quantity: number;
  totalPrice: number;
  logisticsFee: number;
  extractorOption?: string;
  extractorFee?: number;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  notes?: string;
  secondBeerAdded?: boolean;
  secondBeer?: {
    beerId: string;
    beerName: string;
    kegSize: 30 | 50;
    price: number;
    quantity: number;
  } | null;
  secondBeerPrice?: number;
  customerName: string;
  customerWhatsApp: string;
  customerEmail: string;
  location: {
    city: string;
    neighborhood: string;
    address: string;
  };
  status: "pendente" | "confirmada" | "cancelada" | "concluida";
  createdAt: any;
  emailNotificationSent?: boolean;
}

export interface Lead {
  id?: string;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  contactPreference: "whatsapp" | "email" | "phone";
  eventType: "casamento" | "aniversário" | "corporativo" | "particular" | "formatura" | "festival" | "outro";
  eventDate: string;
  location: {
    city: string;
    neighborhood: string;
    address: string;
    cep?: string;
  };
  guestCount: number;
  services: string[];
  additionalInfo?: string;
  status: "novo" | "em_contato" | "orcamento_enviado" | "confirmado" | "concluido" | "cancelado";
  createdAt: any;
  updatedAt?: any;
}

export interface BusinessSetting {
  whatsappNumber: string;
  companyName: string;
  contactEmail: string;
  instagramUrl: string;
  address: string;
}

export interface CalculationResult {
  liters: number;
  cups: number;
  kegSetup: string;
  machineSetup: string;
  estimatedPrice: number;
  logisticsFee?: number;
}
