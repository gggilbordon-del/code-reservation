"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Gift, Sparkles, Ticket } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const CONFIG_EMPRESA = {
  nombreComercial: "Mondragon’s Dream",
  subtitulo: "Navegación premium desde Puerto de Mogán con experiencias auténticas y memorables.",
  etiqueta: "Costa Sur · Puerto de Mogán",
  claim: "Bono Experiencia en Catamarán",
  descripcion:
    "Ideal para regalar mar, calma y aventura. Incluye navegación, parada de baño y el estilo único de Mondragón’s Dream.",
  servicioEstrella: "Excursión de 4 horas",
  prefijoCodigo: "MONDRA",
  precioBono: 95.0,
  validezMeses: 12,
  telefonoReserva: "602 65 00 70",
};

export function BookingMondragonVoucher() {
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

  const applyDemoAutofill = () => {
    setBuyerName("Cliente Demo");
    setBuyerEmail("demo+mondragon@grancanaria.test");
    setBuyerPhone("600123456");
    setQuantity(1);
    if (voucherType === "regalo") {
      setRecipientName("Persona Invitada");
      setGiftMessage("Te regalo una travesía inolvidable por la costa de Mogán.");
    }
    showToast("Datos de prueba aplicados. Tarjeta demo: 4242 4242 4242 4242.", "info");
  };

  const payNow = async () => {
    if (!buyerName.trim() || !buyerEmail.trim()) {
      showToast("Completa los datos de la persona compradora.", "error");
      return;
    }
    if (voucherType === "regalo" && !recipientName.trim()) {
      showToast("Indica para quién es el bono regalo.", "error");
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
        window.location.href = `/actividades/mondragon-dream/exito?${qs.toString()}`;
        return;
      }

      const res = await fetch("/api/stripe/checkout/mondragon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherType,
          quantity,
          buyer: { fullName: buyerName.trim(), email: buyerEmail.trim(), phone: buyerPhone.trim() },
          recipient: voucherType === "regalo" ? { fullName: recipientName.trim(), message: giftMessage.trim() } : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo iniciar el pago");
      window.location.href = data.url;
    } catch {
      showToast("Estamos configurando Stripe. En producción te redirigimos al pago automático.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto w-full space-y-4">
        <div className="relative h-52 w-full overflow-hidden rounded-3xl border border-[#8c885d]/40 shadow-2xl sm:h-64">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1d1e20]/85 via-[#1d1e20]/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.16em] text-[#d7d3b4]">{CONFIG_EMPRESA.etiqueta}</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{CONFIG_EMPRESA.nombreComercial}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-100 sm:text-base">{CONFIG_EMPRESA.subtitulo}</p>
          </div>
        </div>

        <Card className="w-full border-[#8c885d]/20 bg-gradient-to-b from-[#f5f4ea] via-white to-slate-50 shadow-2xl">
          <CardContent className="space-y-4">
            <div className="pt-5">
              <div className="mb-3 inline-flex rounded-xl border border-[#8c885d]/30 bg-white px-3 py-2 shadow-sm">
                <img src="/api/assets/mondragon-logo" alt="Logo Mondragon’s Dream" className="h-14 w-auto object-contain" />
              </div>
              <CardTitle className="text-xl text-[#1d1e20]">{CONFIG_EMPRESA.nombreComercial}</CardTitle>
              <CardDescription className="mt-1 text-slate-700">{CONFIG_EMPRESA.subtitulo}</CardDescription>
            </div>

            <div className="rounded-xl border border-[#8c885d]/20 bg-gradient-to-r from-[#8c885d] to-[#1d1e20] p-4 text-white">
              <p className="mt-1 text-lg font-semibold">{CONFIG_EMPRESA.claim}</p>
              <p className="text-sm text-[#f1efde]">{CONFIG_EMPRESA.descripcion}</p>
            </div>

            <div className="rounded-xl border border-[#8c885d]/20 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8c885d]">Servicio estrella</p>
              <p className="mt-1 text-lg font-semibold text-[#1d1e20]">{CONFIG_EMPRESA.servicioEstrella}</p>
              <p className="mt-1 text-sm text-slate-600">
                También disponible: Sunset Tour de 2 horas y excursión privada exclusiva.
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Bono válido por {CONFIG_EMPRESA.validezMeses} meses. Incluye código único y QR de canje.
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Contacto canje: <span className="font-semibold">{CONFIG_EMPRESA.telefonoReserva}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setVoucherType("regalo")}
                className={`rounded-xl border p-3 text-left transition ${
                  voucherType === "regalo" ? "border-[#8c885d] bg-[#f7f5eb] shadow-sm" : "border-[#d8d2ab] bg-white hover:bg-[#faf8ef]"
                }`}
              >
                <div className="flex items-center gap-2 text-[#8c885d]">
                  <Gift className="h-4 w-4" />
                  <p className="font-semibold">Bono regalo</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">Regala mar, calma y paisaje volcánico inolvidable.</p>
              </button>

              <button
                type="button"
                onClick={() => setVoucherType("ticket_abierto")}
                className={`rounded-xl border p-3 text-left transition ${
                  voucherType === "ticket_abierto"
                    ? "border-[#8c885d] bg-[#f7f5eb] shadow-sm"
                    : "border-[#d8d2ab] bg-white hover:bg-[#faf8ef]"
                }`}
              >
                <div className="flex items-center gap-2 text-[#8c885d]">
                  <Ticket className="h-4 w-4" />
                  <p className="font-semibold">Ticket abierto</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">Compra ahora y elige tu fecha más adelante.</p>
              </button>
            </div>

            <div>
              <Label htmlFor="quantity-mondragon">Cantidad de bonos</Label>
              <Input
                id="quantity-mondragon"
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
              <Input placeholder="Teléfono (opcional)" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} />
            </div>

            {voucherType === "regalo" ? (
              <div className="space-y-2 rounded-xl border bg-white p-3">
                <Label>Datos de para quién es el bono</Label>
                <Input placeholder="Nombre de la persona que recibe el regalo" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                <Textarea placeholder="Mensaje de regalo (opcional)" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} />
              </div>
            ) : null}

            <Separator />
            <div className="rounded-xl border border-[#d8d2ab] bg-[#faf8ef] p-4">
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
                <span className="text-2xl font-bold text-[#1d1e20]">{total.toFixed(2)} EUR</span>
              </div>
            </div>

            {isTestMode ? (
              <div className="rounded-xl border border-[#d8d2ab] bg-[#faf8ef] p-3 text-xs text-[#1d1e20]">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  Modo test activo
                </div>
                <p>Tarjeta de prueba: 4242 4242 4242 4242 / 12-26 / 123 / 35001.</p>
              </div>
            ) : null}

            {isTestMode ? (
              <button
                type="button"
                onClick={applyDemoAutofill}
                className="w-full rounded-lg border border-[#d8d2ab] bg-white px-3 py-2 text-sm font-medium text-[#1d1e20] hover:bg-[#faf8ef]"
              >
                Probar con tarjeta de prueba
              </button>
            ) : null}

            <Button className="w-full bg-[#1d1e20] hover:bg-black" onClick={payNow} disabled={loading || total <= 0}>
              {loading ? "Redirigiendo..." : isTestMode ? "Simular compra de bono" : "Pagar ahora con Stripe"}
            </Button>
            {isTestMode ? (
              <p className="text-center text-xs font-medium text-[#1d1e20]">Estás en modo DEMO. No se realizará ningún cargo real.</p>
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
