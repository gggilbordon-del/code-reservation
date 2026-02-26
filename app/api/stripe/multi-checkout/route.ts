import { NextResponse } from "next/server";
import Stripe from "stripe";
import { DICCIONARIO_EMPRESAS } from "@/lib/empresas";

type Body = {
  empresaId: string;
  fecha: string;
  personas: number;
  extrasSeleccionados: string[];
  returnUrl?: string;
};

function getSecretKeyByEmpresa(empresaId: string, fallbackEnvKey?: string) {
  const rawMap = process.env.STRIPE_SECRET_KEYS_JSON;
  if (rawMap) {
    try {
      const parsed = JSON.parse(rawMap) as Record<string, string>;
      if (parsed[empresaId]) return parsed[empresaId];
    } catch {
      // Ignora JSON invalido y sigue con fallback.
    }
  }

  if (fallbackEnvKey && process.env[fallbackEnvKey]) {
    return process.env[fallbackEnvKey];
  }

  return "";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { empresaId, fecha, personas, extrasSeleccionados, returnUrl } = body;

    if (!empresaId || !fecha || !Array.isArray(extrasSeleccionados) || personas < 1) {
      return NextResponse.json({ error: "Datos invalidos." }, { status: 400 });
    }

    const empresa = DICCIONARIO_EMPRESAS[empresaId];
    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada." }, { status: 404 });
    }

    const secretKey = getSecretKeyByEmpresa(empresaId, empresa.stripeSecretKeyEnv);
    if (!secretKey) {
      return NextResponse.json(
        { error: `No hay Secret Key configurada para ${empresaId}.` },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const line_items: Array<{
      price_data: {
        currency: "eur";
        product_data: { name: string };
        unit_amount: number;
      };
      quantity: number;
    }> = [
      {
        price_data: {
          currency: "eur",
          product_data: { name: `${empresa.nombre} - Reserva base` },
          unit_amount: Math.round(empresa.precioBase * 100),
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "eur",
          product_data: { name: `${empresa.nombre} - Precio por persona` },
          unit_amount: Math.round(empresa.precioPorPersona * 100),
        },
        quantity: personas,
      },
    ];

    for (const extraId of extrasSeleccionados) {
      const extra = empresa.extras.find((item) => item.id === extraId);
      if (!extra) continue;
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: { name: `${empresa.nombre} - ${extra.label}` },
          unit_amount: Math.round(extra.price * 100),
        },
        quantity: 1,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL_RETORNO || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const safeReturn = returnUrl || `${baseUrl}/${empresaId}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${safeReturn}?pago=ok&fecha=${encodeURIComponent(fecha)}`,
      cancel_url: `${safeReturn}?pago=cancel`,
      metadata: {
        empresaId,
        fecha,
        personas: String(personas),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch {
    return NextResponse.json({ error: "Error creando la sesion de Stripe." }, { status: 500 });
  }
}
