import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

type Body = {
  voucherType: "regalo" | "ticket_abierto";
  quantity: number;
  buyer: {
    fullName: string;
    email: string;
    phone?: string;
  };
  recipient?: {
    fullName: string;
    message?: string;
  };
};

const BONO_PRICE_EUR = 149;
const SERVICE_NAME = "Paseos en Barco, Zodiac, Parascending y Motos de agua";
const COMPANY_PREFIX = "SAGI";
const COMPANY_PHONE = "639 61 90 29";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { voucherType, quantity, buyer, recipient } = body;
    const isGift = voucherType === "regalo";

    if (
      !buyer?.fullName?.trim() ||
      !buyer?.email?.trim() ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      quantity > 20 ||
      (voucherType !== "regalo" && voucherType !== "ticket_abierto") ||
      (isGift && !recipient?.fullName?.trim())
    ) {
      return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const safeName = encodeURIComponent(buyer.fullName.trim());
    const safeEmail = encodeURIComponent(buyer.email.trim());
    const safeType = encodeURIComponent(voucherType);
    const safeRecipient = encodeURIComponent(recipient?.fullName?.trim() || "");
    const safeMessage = encodeURIComponent(recipient?.message?.trim() || "");
    const safeService = encodeURIComponent(SERVICE_NAME);
    const safePhone = encodeURIComponent(COMPANY_PHONE);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: voucherType === "regalo" ? `Bono Regalo - ${SERVICE_NAME}` : `Ticket Abierto - ${SERVICE_NAME}`,
            },
            unit_amount: BONO_PRICE_EUR * 100,
          },
          quantity,
        },
      ],
      customer_email: buyer.email.trim(),
      success_url: `${baseUrl}/aventura-sagitarius-star/exito?session_id={CHECKOUT_SESSION_ID}&tipo=${safeType}&cantidad=${quantity}&nombre=${safeName}&email=${safeEmail}&para=${safeRecipient}&mensaje=${safeMessage}&prefijo=${COMPANY_PREFIX}&servicio=${safeService}&phone=${safePhone}`,
      cancel_url: `${baseUrl}/aventura-sagitarius-star?status=cancel`,
      metadata: {
        bookingType: "bono_sagitarius_star",
        voucherType,
        quantity: String(quantity),
        serviceName: SERVICE_NAME,
        contactName: buyer.fullName.trim(),
        contactEmail: buyer.email.trim(),
        contactPhone: buyer.phone?.trim() || "",
        recipientName: recipient?.fullName?.trim() || "",
        recipientMessage: recipient?.message?.trim() || "",
        codePrefix: COMPANY_PREFIX,
        companyPhone: COMPANY_PHONE,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Error creando sesion Stripe" }, { status: 500 });
  }
}
