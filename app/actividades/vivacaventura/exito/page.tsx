"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Gift, QrCode, Ticket } from "lucide-react";
import { downloadElementAsPdf } from "@/lib/pdf";
import vivacLogo from "@/app/assets/logos/vivacaventura_logo.png";

type TicketData = {
  tipo: "regalo" | "ticket_abierto";
  cantidad: number;
  nombre: string;
  email: string;
  para: string;
  mensaje: string;
  prefijo: string;
  servicio: string;
  phone: string;
};

const BRAND = {
  bg: "#fff7ed",
  primary: "#f97316",
  secondary: "#374151",
};

const generateCode = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export default function VivacAventuraExitoPage() {
  const [ready, setReady] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [data, setData] = useState<TicketData>({
    tipo: "ticket_abierto",
    cantidad: 1,
    nombre: "",
    email: "",
    para: "",
    mensaje: "",
    prefijo: "VIVAC",
    servicio: "Bono Multiaventura",
    phone: "673 970 527 (Comunidad educativa) · 683 165 966 (Particulares y Colectivos)",
  });
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement | null>(null);
  const autoDownloadTriggeredRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed: TicketData = {
      tipo: (params.get("tipo") as TicketData["tipo"]) || "ticket_abierto",
      cantidad: Number(params.get("cantidad") || 1),
      nombre: params.get("nombre") || "",
      email: params.get("email") || "",
      para: params.get("para") || "",
      mensaje: params.get("mensaje") || "",
      prefijo: params.get("prefijo") || "VIVAC",
      servicio: params.get("servicio") || "Bono Multiaventura",
      phone: params.get("phone") || "673 970 527 (Comunidad educativa) · 683 165 966 (Particulares y Colectivos)",
    };
    setData(parsed);
    setTicketCode(generateCode(parsed.prefijo));
    setReady(true);
  }, []);

  const isGift = data.tipo === "regalo";
  const qrPayload = useMemo(() => {
    if (!ready) return "";
    return JSON.stringify({
      company: "Vivac Aventura",
      code: ticketCode,
      service: data.servicio,
      voucherType: isGift ? "Bono Regalo" : "Ticket Abierto",
      quantity: data.cantidad,
      buyer: data.nombre,
      recipient: data.para,
      contact: data.phone,
    });
  }, [data, isGift, ready, ticketCode]);

  const qrUrl = useMemo(() => {
    if (!qrPayload) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrPayload)}`;
  }, [qrPayload]);

  const handleDownload = useCallback(async () => {
    if (!ticketRef.current || downloading) return;
    setDownloading(true);
    try {
      await downloadElementAsPdf(ticketRef.current, `${ticketCode || "ticket-vivac-aventura"}.pdf`);
    } finally {
      setDownloading(false);
    }
  }, [downloading, ticketCode]);

  useEffect(() => {
    if (!ready || !ticketRef.current || !ticketCode || autoDownloadTriggeredRef.current) return;
    autoDownloadTriggeredRef.current = true;
    const timeout = setTimeout(() => {
      void handleDownload();
    }, 450);
    return () => clearTimeout(timeout);
  }, [handleDownload, ready, ticketCode]);

  if (!ready) {
    return (
      <main className="min-h-screen bg-orange-50 p-6">
        <section className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Preparando tu ticket digital...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-orange-50 p-6">
      <section className="mx-auto w-full max-w-3xl space-y-4">
        <h1 className="text-center text-3xl font-bold text-slate-900">Tu ticket de Vivac Aventura está listo</h1>
        <p className="text-center text-sm text-slate-700">Ya puedes descargarlo y compartir el código para canjearlo.</p>

        <div ref={ticketRef} className="rounded-3xl border border-orange-400/20 bg-white p-6 shadow-xl" style={{ backgroundColor: BRAND.bg }}>
          <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-orange-500/20 bg-white/80 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-orange-700">{isGift ? "Tarjeta regalo" : "Ticket abierto"}</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Vivac Aventura</h2>
              <p className="text-sm text-slate-700">{data.servicio}</p>
            </div>
            <div className="inline-flex rounded-xl border border-slate-900/30 bg-slate-900 px-3 py-2 shadow-sm">
              <img src={vivacLogo.src} alt="Logo Vivac Aventura" className="h-14 w-auto object-contain" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              <div className="rounded-xl border border-orange-400/25 bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-orange-700">Código único</p>
                <p className="font-mono text-2xl font-bold tracking-wide" style={{ color: BRAND.secondary }}>
                  {ticketCode}
                </p>
              </div>

              <div className="rounded-xl border border-orange-400/20 bg-white p-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Tipo:</span> {isGift ? "Bono Regalo" : "Ticket Abierto"}
                </p>
                <p>
                  <span className="font-semibold">Cantidad:</span> {data.cantidad}
                </p>
                <p>
                  <span className="font-semibold">Comprador/a:</span> {data.nombre || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {data.email || "N/A"}
                </p>
                {isGift ? (
                  <p>
                    <span className="font-semibold">Para:</span> {data.para || "N/A"}
                  </p>
                ) : null}
                {isGift && data.mensaje ? (
                  <p>
                    <span className="font-semibold">Mensaje:</span> {data.mensaje}
                  </p>
                ) : null}
                <p>
                  <span className="font-semibold">Validez:</span> 12 meses desde la compra
                </p>
                <p>
                  <span className="font-semibold">Canje:</span> {data.phone}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-orange-400/20 bg-white p-3">
              <img src={qrUrl} alt="QR de canje" className="h-40 w-40 rounded-lg border border-orange-200 bg-white p-2" />
              <p className="text-center text-xs text-slate-600">Escanea para validar el bono en recepción.</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={downloading}
          className="mx-auto flex items-center gap-2 rounded-lg border border-orange-500/30 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow hover:bg-orange-50 disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Generando PDF..." : "Descargar ticket PDF"}
        </button>

        <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-3">
            <div className="mb-1 flex items-center gap-2 font-medium text-slate-900">
              <Ticket className="h-4 w-4" /> Código único
            </div>
            <p>Identificador aleatorio para verificar el canje.</p>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <div className="mb-1 flex items-center gap-2 font-medium text-slate-900">
              <QrCode className="h-4 w-4" /> QR integrado
            </div>
            <p>Escaneo rápido para validar asistencia y bono.</p>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <div className="mb-1 flex items-center gap-2 font-medium text-slate-900">
              <Gift className="h-4 w-4" /> Multiaventura
            </div>
            <p>Formato ideal para cumpleaños y planes de fin de semana.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
