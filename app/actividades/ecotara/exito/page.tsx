"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Gift } from "lucide-react";
import { downloadElementAsPdf } from "@/lib/pdf";
import ecotaraLogo from "@/app/assets/logos/ecotara_logo.png";

type SuccessQuery = {
  tipo: string;
  cantidad: number;
  nombre: string;
  email: string;
  para: string;
  mensaje: string;
  servicio: string;
  prefijo: string;
  phone: string;
  sessionId?: string;
  simulated: boolean;
};

function randomChunk(length: number) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function buildVoucherCode(prefix: string, seed?: string) {
  if (!seed) return `${prefix}-${randomChunk(4)}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const base36 = Math.abs(hash).toString(36).toUpperCase();
  return `${prefix}-${base36.slice(0, 4).padEnd(4, "X")}`;
}

export default function EcoTaraExitoPage() {
  const [code, setCode] = useState<string>("");
  const ticketRef = useRef<HTMLDivElement | null>(null);
  const didTriggerPdfRef = useRef(false);
  const [query, setQuery] = useState<SuccessQuery>({
    tipo: "Bono regalo",
    cantidad: 1,
    nombre: "Cliente",
    email: "",
    para: "",
    mensaje: "",
    servicio: "Bono Regalo 'Dia de Retiro & Yoga'.",
    prefijo: "TARA",
    phone: "696 604 182",
    sessionId: undefined,
    simulated: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery({
      tipo: params.get("tipo") === "ticket_abierto" ? "Ticket abierto" : "Bono regalo",
      cantidad: Number(params.get("cantidad") || "1"),
      nombre: params.get("nombre") || "Cliente",
      email: params.get("email") || "",
      para: params.get("para") || "",
      mensaje: params.get("mensaje") || "",
      servicio: params.get("servicio") || "Bono Regalo 'Dia de Retiro & Yoga'.",
      prefijo: params.get("prefijo") || "TARA",
      phone: params.get("phone") || "696 604 182",
      sessionId: params.get("session_id") || undefined,
      simulated: params.get("simulated") === "1",
    });
  }, []);

  const { tipo, cantidad, nombre, email, para, mensaje, servicio, prefijo, phone, sessionId, simulated } = query;
  const isGift = tipo === "Bono regalo";

  useEffect(() => {
    setCode(buildVoucherCode(prefijo, sessionId));
  }, [prefijo, sessionId]);

  useEffect(() => {
    if (!code || !ticketRef.current || didTriggerPdfRef.current) return;
    didTriggerPdfRef.current = true;
    const timer = window.setTimeout(() => {
      void downloadElementAsPdf(ticketRef.current as HTMLElement, `ticket-${code}.pdf`);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [code]);

  const qrPayload = useMemo(() => {
    if (!code) return "";
    return `BONO=${code};SERVICIO=${servicio};TIPO=${tipo};CANTIDAD=${Number.isFinite(cantidad) ? cantidad : 1};COMPRADOR=${nombre};PARA=${para};PHONE=${phone}`;
  }, [code, servicio, tipo, cantidad, nombre, para, phone]);

  const qrUrl = useMemo(() => {
    if (!qrPayload) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(qrPayload)}`;
  }, [qrPayload]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fdf6e3] via-white to-white p-4">
      <section ref={ticketRef} className="mx-auto w-full max-w-3xl rounded-[2rem] border border-[#2d5a27]/25 bg-[#fdf6e3] p-6 shadow-xl">
        <div className="flex items-center gap-2 text-[#2d5a27]">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-wide">{simulated ? "Pago simulado OK" : "Pago confirmado"}</p>
        </div>

        <h1 className="mt-2 font-serif text-2xl font-bold text-[#2d5a27]">Tu ticket EcoTara Wellness Retreat está listo</h1>
        <p className="mt-1 text-sm text-slate-600">Documento premium de bienestar con QR para canje rápido.</p>

        {isGift ? (
          <div className="mt-5 overflow-hidden rounded-[1.7rem] border border-[#2d5a27]/35 shadow-lg">
            <div className="bg-[#2d5a27] p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">Tarjeta regalo wellness</p>
                  </div>
                  <p className="mt-2 font-serif text-2xl font-bold">EcoTara Wellness Retreat</p>
                  <p className="text-green-100">Dia de Retiro & Yoga</p>
                </div>
                <img
                  src={ecotaraLogo.src}
                  alt="Logo EcoTara Wellness Retreat"
                  className="h-16 w-auto shrink-0 rounded-md bg-white/10 p-1 object-contain"
                />
              </div>
            </div>
            <div className="bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-[#2d5a27]">Para</p>
              <p className="font-serif text-xl font-semibold text-slate-900">{para || "Destinatario"}</p>
              {mensaje ? <p className="mt-2 rounded-xl bg-[#fdf6e3] p-3 text-sm text-slate-700">&quot;{mensaje}&quot;</p> : null}
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <p>
                  <span className="font-semibold">Codigo:</span> {code || `${prefijo}-....`}
                </p>
                <p>
                  <span className="font-semibold">Validez:</span> 12 meses
                </p>
                <p className="sm:col-span-2">
                  <span className="font-semibold">Canje:</span> {phone}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-[#2d5a27]/20 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-[#2d5a27]">Codigo de reserva unico</p>
            <p className="mt-1 font-serif text-3xl font-extrabold tracking-widest text-[#2d5a27]">{code || `${prefijo}-....`}</p>
            <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p>
                <span className="font-semibold">Servicio:</span> {servicio}
              </p>
              <p>
                <span className="font-semibold">Tipo:</span> {tipo}
              </p>
              <p>
                <span className="font-semibold">Cantidad:</span> {Number.isFinite(cantidad) ? cantidad : 1}
              </p>
              <p>
                <span className="font-semibold">Comprado por:</span> {nombre}
              </p>
              {email ? (
                <p className="sm:col-span-2">
                  <span className="font-semibold">Email:</span> {email}
                </p>
              ) : null}
              <p className="sm:col-span-2">
                <span className="font-semibold">Canje y soporte:</span> {phone}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-[#2d5a27]/20 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-[#2d5a27]">QR de canje</p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3">
            {qrUrl ? (
              <img src={qrUrl} alt={`QR del bono ${code}`} className="h-44 w-44 rounded-xl border border-[#2d5a27]/20 bg-white p-2" />
            ) : (
              <div className="h-44 w-44 animate-pulse rounded-xl border border-[#2d5a27]/10 bg-[#fdf6e3]" />
            )}
            <p className="text-xs text-slate-500">Muestra este QR o el codigo para canjear tu experiencia.</p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-4 w-full max-w-3xl">
        <button
          type="button"
          onClick={() => {
            if (!ticketRef.current || !code) return;
            void downloadElementAsPdf(ticketRef.current, `ticket-${code}.pdf`);
          }}
          className="w-full rounded-xl border border-[#2d5a27]/30 bg-white px-4 py-2 text-sm font-semibold text-[#2d5a27] hover:bg-[#f8f3e6]"
        >
          Descargar PDF manualmente
        </button>
      </div>
    </main>
  );
}
