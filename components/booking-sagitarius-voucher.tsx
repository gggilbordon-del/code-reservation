"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Gift, Sparkles, Ticket } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type EmpresaConfig = {
  nombreComercial: string;
  subtitulo: string;
  etiqueta: string;
  claim: string;
  descripcion: string;
  servicioEstrella: string;
  prefijoCodigo: string;
  precioBono: number;
  validezMeses: number;
  telefonoReserva: string;
};

const CONFIG_EMPRESA: EmpresaConfig = {
  nombreComercial: "Aventura Sagitarius Star",
  subtitulo: "Bonos digitales para Paseos en Barco, Zodiac, Parascending y Motos de agua",
  etiqueta: "Gran Canaria Water Adventures",
  claim: "Vende experiencias acuaticas top en venta directa",
  descripcion: "Checkout rapido, ticket digital y canje flexible para tus clientes.",
  servicioEstrella: "Paseos en Barco, Zodiac, Parascending y Motos de agua",
  prefijoCodigo: "SAGI",
  precioBono: 149,
  validezMeses: 12,
  telefonoReserva: "639 61 90 29",
};

export function BookingSagitariusVoucher() {
  const [voucherType, setVoucherType] = useState<"regalo" | "ticket_abierto">("regalo");
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "info" | "error" } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTestMode = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_") ?? false;
  const demoCardText = "4242 4242 4242 4242 | 12/26 | 123 | 35001";

  const showToast = (message: string, type: "info" | "error" = "info") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const total = useMemo(() => quantity * CONFIG_EMPRESA.precioBono, [quantity]);

  const applyDemoAutofill = async () => {
    setBuyerName("Demo Buyer");
    setBuyerEmail("demo+sagitarius@grancanaria.test");
    setBuyerPhone("600123456");
    setQuantity(1);

    if (voucherType === "regalo") {
      setRecipientName("Demo Recipient");
      setGiftMessage("Prepárate para la adrenalina en las costas de Puerto Rico, en Gran Canaria.");
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(demoCardText);
        showToast("Datos demo rellenados. Tarjeta de prueba copiada al portapapeles.", "info");
        return;
      } catch {
        // Ignore clipboard failures and fallback to toast only
      }
    }

    showToast(`Datos demo rellenados. Usa esta tarjeta: ${demoCardText}`, "info");
  };

  const payNow = async () => {
    if (!buyerName.trim() || !buyerEmail.trim()) {
      showToast("Completa los datos de quien compra.", "error");
      return;
    }
    if (voucherType === "regalo" && !recipientName.trim()) {
      showToast("En bono regalo debes indicar para quien es.", "error");
      return;
    }

    try {
      setLoading(true);

      if (isTestMode) {
        const qs = new URLSearchParams({
          simulated: "1",
          tipo: voucherType,
          cantidad: String(quantity),
          nombre: buyerName.trim(),
          email: buyerEmail.trim(),
          para: recipientName.trim(),
          mensaje: giftMessage.trim(),
          prefijo: CONFIG_EMPRESA.prefijoCodigo,
          servicio: CONFIG_EMPRESA.servicioEstrella,
          phone: CONFIG_EMPRESA.telefonoReserva,
        });
        window.location.href = `/aventura-sagitarius-star/exito?${qs.toString()}`;
        return;
      }

      const res = await fetch("/api/stripe/checkout/sagitarius", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherType,
          quantity,
          buyer: {
            fullName: buyerName.trim(),
            email: buyerEmail.trim(),
            phone: buyerPhone.trim(),
          },
          recipient: voucherType === "regalo" ? { fullName: recipientName.trim(), message: giftMessage.trim() } : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo iniciar el pago");
      window.location.href = data.url;
    } catch {
      showToast("Estamos configurando Stripe. En produccion, aqui te redirigiriamos al checkout seguro automaticamente.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto w-full space-y-4">
        <div className="relative h-52 w-full overflow-hidden rounded-3xl border border-cyan-200/70 shadow-2xl sm:h-64">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://thisisgrancanaria.com/wp-content/uploads/2024/09/maxresdefault-7.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/85 via-cyan-900/25 to-cyan-950/5" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">{CONFIG_EMPRESA.etiqueta}</p>
            <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{CONFIG_EMPRESA.nombreComercial}</h1>
            <p className="mt-1 max-w-2xl text-sm text-cyan-100 sm:text-base">{CONFIG_EMPRESA.subtitulo}</p>
          </div>
        </div>

        <Card className="w-full border-cyan-200/70 bg-gradient-to-b from-sky-100 via-cyan-50 to-white shadow-2xl">
          <CardContent className="space-y-4">
            <div className="pt-5">
              <CardTitle className="text-xl text-cyan-900">{CONFIG_EMPRESA.nombreComercial}</CardTitle>
              <CardDescription className="mt-1 text-cyan-700">{CONFIG_EMPRESA.subtitulo}</CardDescription>
            </div>

            <div className="rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-600 to-sky-700 p-4 text-white">
              <p className="mt-1 text-lg font-semibold">{CONFIG_EMPRESA.claim}</p>
              <p className="text-sm text-cyan-100">{CONFIG_EMPRESA.descripcion}</p>
            </div>

            <div className="rounded-xl border border-cyan-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Servicio estrella</p>
              <p className="mt-1 text-lg font-semibold text-cyan-900">{CONFIG_EMPRESA.servicioEstrella}</p>
              <p className="mt-2 text-sm text-slate-600">
                Bono valido por {CONFIG_EMPRESA.validezMeses} meses. Recibiras codigo y QR para canjear cuando quieras.
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Contacto directo para canje: <span className="font-semibold">{CONFIG_EMPRESA.telefonoReserva}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setVoucherType("regalo")}
                className={`rounded-xl border p-3 text-left transition ${
                  voucherType === "regalo" ? "border-cyan-500 bg-cyan-50 shadow-sm" : "border-cyan-200 bg-white hover:bg-cyan-50/50"
                }`}
              >
                <div className="flex items-center gap-2 text-cyan-800">
                  <Gift className="h-4 w-4" />
                  <p className="font-semibold">Bono regalo</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">Ideal para regalar paseos en barco, parascending o motos de agua.</p>
              </button>

              <button
                type="button"
                onClick={() => setVoucherType("ticket_abierto")}
                className={`rounded-xl border p-3 text-left transition ${
                  voucherType === "ticket_abierto"
                    ? "border-cyan-500 bg-cyan-50 shadow-sm"
                    : "border-cyan-200 bg-white hover:bg-cyan-50/50"
                }`}
              >
                <div className="flex items-center gap-2 text-cyan-800">
                  <Ticket className="h-4 w-4" />
                  <p className="font-semibold">Ticket abierto</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">Compra hoy y elige luego entre barco, zodiac, parascending o motos de agua.</p>
              </button>
            </div>

            <div>
              <Label htmlFor="quantity-sagi">Cantidad de bonos</Label>
              <Input
                id="quantity-sagi"
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="mt-1 bg-white"
              />
            </div>

            <div className="space-y-2 rounded-xl border bg-white p-3">
              <Label>Datos de quien compra</Label>
              <Input placeholder="Nombre completo" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
              <Input type="email" placeholder="Email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
              <Input placeholder="Telefono (opcional)" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} />
            </div>

            {voucherType === "regalo" ? (
              <div className="space-y-2 rounded-xl border bg-white p-3">
                <Label>Datos de para quien es el bono</Label>
                <Input
                  placeholder="Nombre de la persona que recibe el regalo"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
                <Textarea placeholder="Mensaje de regalo (opcional)" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} />
              </div>
            ) : null}

            <Separator />
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Tipo</span>
                <span>{voucherType === "regalo" ? "Bono regalo" : "Ticket abierto"}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm text-slate-600">
                <span>Precio unitario</span>
                <span>{CONFIG_EMPRESA.precioBono.toFixed(2)} EUR</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm text-slate-600">
                <span>Cantidad</span>
                <span>{quantity}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-700">Total</span>
                <span className="text-2xl font-bold text-cyan-800">{total.toFixed(2)} EUR</span>
              </div>
            </div>

            {isTestMode ? (
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-xs text-cyan-900">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  Modo test activo
                </div>
                <p>Demo 1-click habilitada. Tarjeta de prueba: 4242 4242 4242 4242 / 12-26 / 123 / 35001.</p>
              </div>
            ) : null}

            {isTestMode ? (
              <button
                type="button"
                onClick={() => void applyDemoAutofill()}
                className="w-full rounded-lg border border-cyan-300 bg-white px-3 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-50"
              >
                Probar con tarjeta de prueba
              </button>
            ) : null}

            <Button className="w-full bg-cyan-700 hover:bg-cyan-800" onClick={payNow} disabled={loading || total <= 0}>
              {loading ? "Redirigiendo..." : isTestMode ? "Simular compra de bono" : "Pagar ahora con Stripe"}
            </Button>
            {isTestMode ? (
              <p className="text-center text-xs font-medium text-cyan-900">Estas en modo DEMO. No se realizara ningun cargo real en tu tarjeta.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-in slide-in-from-bottom-2 fade-in">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${
              toast.type === "error" ? "border-rose-200 bg-white/95 text-rose-700" : "border-emerald-200 bg-white/95 text-emerald-700"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </>
  );
}
