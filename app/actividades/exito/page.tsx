"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { downloadElementAsPdf } from "@/lib/pdf";

const BRAND_BY_PREFIX: Record<string, { primary: string; border: string; soft: string; dark: string }> = {
  AQUA: { primary: "#0891b2", border: "#a5f3fc", soft: "#ecfeff", dark: "#164e63" },
  ZEN: { primary: "#a16207", border: "#fde68a", soft: "#fffbeb", dark: "#44403c" },
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

type SuccessQuery = {
  tipo: string;
  cantidad: number;
  nombre: string;
  email: string;
  para: string;
  mensaje: string;
  servicio: string;
  prefijo: string;
  sessionId?: string;
  simulated: boolean;
};

export default function ActividadesExitoPage() {
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
    servicio: "Paseo Privado en Barco",
    prefijo: "AQUA",
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
      servicio: params.get("servicio") || "Paseo Privado en Barco",
      prefijo: params.get("prefijo") || "AQUA",
      sessionId: params.get("session_id") || undefined,
      simulated: params.get("simulated") === "1",
    });
  }, []);

  const { tipo, cantidad, nombre, email, para, mensaje, servicio, prefijo, sessionId, simulated } = query;

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
    return `BONO=${code};SERVICIO=${servicio};TIPO=${tipo};CANTIDAD=${Number.isFinite(cantidad) ? cantidad : 1};COMPRADOR=${nombre};PARA=${para}`;
  }, [code, servicio, tipo, cantidad, nombre, para]);

  const qrUrl = useMemo(() => {
    if (!qrPayload) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(qrPayload)}`;
  }, [qrPayload]);
  const brand = BRAND_BY_PREFIX[prefijo] || BRAND_BY_PREFIX.AQUA;

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-100 via-sky-50 to-white p-4">
      <section
        ref={ticketRef}
        className="mx-auto w-full max-w-3xl rounded-3xl border border-cyan-200 bg-white/95 p-6 shadow-xl"
        style={{ borderColor: brand.border }}
      >
        <div className="flex items-center gap-2" style={{ color: brand.primary }}>
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-wide">{simulated ? "Pago simulado OK" : "Pago confirmado"}</p>
        </div>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">Tu bono digital esta listo</h1>
        <p className="mt-1 text-sm text-slate-600">
          Guarda este ticket o descargalo en PDF. El codigo se canjea directamente con el negocio.
        </p>

        <div className="mt-5 rounded-2xl border p-5" style={{ borderColor: brand.border, backgroundColor: brand.soft }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: brand.primary }}>
            Codigo de reserva unico
          </p>
          <p className="mt-1 text-3xl font-extrabold tracking-widest" style={{ color: brand.dark }}>
            {code || `${prefijo}-....`}
          </p>
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
            {tipo === "Bono regalo" && para ? (
              <p>
                <span className="font-semibold">Para:</span> {para}
              </p>
            ) : null}
            {email ? (
              <p className="sm:col-span-2">
                <span className="font-semibold">Email:</span> {email}
              </p>
            ) : null}
            {tipo === "Bono regalo" && mensaje ? (
              <p className="sm:col-span-2">
                <span className="font-semibold">Mensaje:</span> {mensaje}
              </p>
            ) : null}
          </div>
          <p className="mt-4 text-xs text-slate-600">
            Bono valido por 12 meses. Puedes canjearlo cuando quieras segun disponibilidad.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border bg-white p-5" style={{ borderColor: brand.border }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: brand.primary }}>
            QR de canje
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Este QR contiene los datos del bono para validarlo rapido en recepcion.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt={`QR del bono ${code}`}
                className="h-44 w-44 rounded-xl border bg-white p-2"
                style={{ borderColor: brand.border }}
              />
            ) : (
              <div className="h-44 w-44 animate-pulse rounded-xl border" style={{ borderColor: brand.border, backgroundColor: brand.soft }} />
            )}
            <p className="text-xs text-slate-500">Muestra este QR o el codigo al proveedor para canjear.</p>
          </div>
        </div>

        <p className="mt-5 text-xs text-slate-500 print:hidden">
          Se esta generando automaticamente un PDF limpio del ticket.
        </p>
      </section>
      <div className="mx-auto mt-4 w-full max-w-3xl">
        <button
          type="button"
          onClick={() => {
            if (!ticketRef.current || !code) return;
            void downloadElementAsPdf(ticketRef.current, `ticket-${code}.pdf`);
          }}
          className="w-full rounded-xl border border-cyan-300 bg-white px-4 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-50"
          style={{ borderColor: brand.border, color: brand.dark, backgroundColor: brand.soft }}
        >
          Descargar PDF manualmente
        </button>
      </div>
    </main>
  );
}
