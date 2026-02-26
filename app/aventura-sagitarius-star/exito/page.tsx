"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Gift } from "lucide-react";
import { downloadElementAsPdf } from "@/lib/pdf";

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

export default function SagitariusExitoPage() {
  const params = useSearchParams();
  const [code, setCode] = useState<string>("");
  const ticketRef = useRef<HTMLDivElement | null>(null);
  const didTriggerPdfRef = useRef(false);

  const tipo = params.get("tipo") === "ticket_abierto" ? "Ticket abierto" : "Bono regalo";
  const cantidad = Number(params.get("cantidad") || "1");
  const nombre = params.get("nombre") || "Cliente";
  const email = params.get("email") || "";
  const para = params.get("para") || "";
  const mensaje = params.get("mensaje") || "";
  const servicio = params.get("servicio") || "Experiencia de 30 minutos Motos de Agua / Zodiac";
  const prefijo = params.get("prefijo") || "SAGI";
  const phone = params.get("phone") || "639 61 90 29";
  const sessionId = params.get("session_id") || undefined;
  const simulated = params.get("simulated") === "1";
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
    <main className="min-h-screen bg-gradient-to-b from-cyan-100 via-sky-50 to-white p-4">
      <section ref={ticketRef} className="mx-auto w-full max-w-3xl rounded-3xl border border-cyan-200 bg-white/95 p-6 shadow-xl">
        <div className="flex items-center gap-2 text-cyan-700">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-wide">{simulated ? "Pago simulado OK" : "Pago confirmado"}</p>
        </div>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">Tu ticket de Aventura Sagitarius Star está listo</h1>
        <p className="mt-1 text-sm text-slate-600">Se está generando automáticamente tu PDF. Incluye código único y QR de canje.</p>

        {isGift ? (
          <div className="mt-5 overflow-hidden rounded-3xl border border-cyan-300 shadow-lg">
            <div className="bg-gradient-to-r from-cyan-700 via-sky-700 to-cyan-600 p-5 text-white">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Tarjeta regalo</p>
              </div>
              <p className="mt-2 text-2xl font-bold">Aventura Sagitarius Star</p>
              <p className="text-cyan-100">Motos de Agua / Zodiac</p>
            </div>
            <div className="bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-cyan-700">Para</p>
              <p className="text-xl font-semibold text-slate-900">{para || "Destinatario"}</p>
              {mensaje ? <p className="mt-2 rounded-xl bg-cyan-50 p-3 text-sm text-slate-700">“{mensaje}”</p> : null}
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <p>
                  <span className="font-semibold">Código:</span> {code || `${prefijo}-....`}
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
          <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
            <p className="text-xs uppercase tracking-wide text-cyan-700">Código de reserva único</p>
            <p className="mt-1 text-3xl font-extrabold tracking-widest text-cyan-900">{code || `${prefijo}-....`}</p>
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
            <p className="mt-4 text-xs text-slate-600">Bono válido por 12 meses. Canje según disponibilidad.</p>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-cyan-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-cyan-700">QR de canje</p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3">
            {qrUrl ? (
              <img src={qrUrl} alt={`QR del bono ${code}`} className="h-44 w-44 rounded-xl border border-cyan-200 bg-white p-2" />
            ) : (
              <div className="h-44 w-44 animate-pulse rounded-xl border border-cyan-100 bg-cyan-50" />
            )}
            <p className="text-xs text-slate-500">Muestra este QR o el código en recepción para canjear.</p>
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
          className="w-full rounded-xl border border-cyan-300 bg-white px-4 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-50"
        >
          Descargar PDF manualmente
        </button>
      </div>
    </main>
  );
}
