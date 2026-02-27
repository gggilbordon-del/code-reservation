import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const BONO_PRICE_EUR = 95.0;
const SERVICE_NAME = "Excursión de 4 horas";
const COMPANY_PREFIX = "MONDRA";
const COMPANY_PHONE = "602 65 00 70";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const voucherType: "regalo" | "ticket_abierto" = body?.voucherType;
    const quantity = Number(body?.quantity ?? 1);
    const buyer = body?.buyer ?? {};
    const recipient = body?.recipient ?? {};

    if (!["regalo", "ticket_abierto"].includes(voucherType)) {
      return NextResponse.json({ error: "Tipo de bono no válido" }, { status: 400 });
    }
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      return NextResponse.json({ error: "Cantidad no válida" }, { status: 400 });
    }
    if (!buyer?.fullName || !buyer?.email) {
      return NextResponse.json({ error: "Faltan datos de comprador/a" }, { status: 400 });
    }
    if (voucherType === "regalo" && !recipient?.fullName) {
      return NextResponse.json({ error: "Falta nombre de destinatario/a del regalo" }, { status: 400 });
    }

    const successUrl = new URL("/actividades/mondragon-dream/exito", req.url);
    successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl.toString(),
      cancel_url: new URL("/actividades/mondragon-dream", req.url).toString(),
      customer_email: buyer.email,
      line_items: [
        {
          quantity,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(BONO_PRICE_EUR * 100),
            product_data: {
              name: `${voucherType === "regalo" ? "Bono Regalo" : "Ticket Abierto"} · ${SERVICE_NAME}`,
              description: "Bono digital válido 12 meses con código único y QR de canje",
            },
          },
        },
      ],
      metadata: {
        voucherType,
        quantity: String(quantity),
        buyerName: String(buyer.fullName ?? ""),
        buyerEmail: String(buyer.email ?? ""),
        buyerPhone: String(buyer.phone ?? ""),
        recipientName: String(recipient.fullName ?? ""),
        giftMessage: String(recipient.message ?? ""),
        companyPrefix: COMPANY_PREFIX,
        serviceName: SERVICE_NAME,
        companyPhone: COMPANY_PHONE,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creando checkout /mondragon:", error);
    return NextResponse.json({ error: "No se pudo crear la sesión de pago" }, { status: 500 });
  }
}
