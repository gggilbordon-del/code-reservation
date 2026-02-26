export type Currency = "EUR";

export type EmpresaExtra = {
  id: string;
  label: string;
  price: number;
};

export type EmpresaConfig = {
  id: string;
  nombre: string;
  logoUrl: string;
  precioBase: number;
  precioPorPersona: number;
  moneda: Currency;
  stripePublishableKey: string;
  stripeSecretKeyEnv?: string;
  extras: EmpresaExtra[];
};

export const DICCIONARIO_EMPRESAS: Record<string, EmpresaConfig> = {
  empresa1: {
    id: "empresa1",
    nombre: "BlueWave Gran Canaria",
    logoUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop",
    precioBase: 149,
    precioPorPersona: 39,
    moneda: "EUR",
    stripePublishableKey:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_EMPRESA1 || "",
    stripeSecretKeyEnv: "STRIPE_SECRET_KEY_EMPRESA1",
    extras: [
      { id: "seguro-premium", label: "Seguro Premium", price: 19 },
      { id: "catering", label: "Catering", price: 45 },
    ],
  },
  empresa2: {
    id: "empresa2",
    nombre: "Atlantic Boat Club",
    logoUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop",
    precioBase: 179,
    precioPorPersona: 44,
    moneda: "EUR",
    stripePublishableKey:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_EMPRESA2 || "",
    stripeSecretKeyEnv: "STRIPE_SECRET_KEY_EMPRESA2",
    extras: [
      { id: "seguro-premium", label: "Seguro Premium", price: 25 },
      { id: "catering", label: "Catering", price: 59 },
    ],
  },
};

export const EMPRESA_DEFAULT_ID = "empresa1";

export function getEmpresaById(id: string) {
  return DICCIONARIO_EMPRESAS[id] || DICCIONARIO_EMPRESAS[EMPRESA_DEFAULT_ID];
}
