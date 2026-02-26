"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { usePathname } from "next/navigation";
import {
  DICCIONARIO_EMPRESAS,
  EMPRESA_DEFAULT_ID,
  getEmpresaById,
  type Currency,
} from "@/lib/empresas";

const formatPrice = (amount: number, currency: Currency) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

export default function CheckoutUnico() {
  const pathname = usePathname();
  const slugFromPath = pathname.split("/").filter(Boolean)[0] || EMPRESA_DEFAULT_ID;
  const empresa = getEmpresaById(slugFromPath);

  const [fecha, setFecha] = useState("");
  const [personas, setPersonas] = useState(2);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "info" | "error" } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const precioExtras = useMemo(() => {
    return empresa.extras
      .filter((extra) => extrasSeleccionados.includes(extra.id))
      .reduce((acc, extra) => acc + extra.price, 0);
  }, [extrasSeleccionados, empresa.extras]);

  const total = useMemo(() => {
    return empresa.precioBase + personas * empresa.precioPorPersona + precioExtras;
  }, [personas, precioExtras, empresa.precioBase, empresa.precioPorPersona]);

  const toggleExtra = (extraId: string) => {
    setExtrasSeleccionados((prev) =>
      prev.includes(extraId)
        ? prev.filter((id) => id !== extraId)
        : [...prev, extraId]
    );
  };

  const handleCheckout = async () => {
    if (!fecha) {
      showToast("Selecciona una fecha antes de continuar.", "error");
      return;
    }

    if (!empresa.stripePublishableKey) {
      showToast(`Falta Stripe Publishable Key para ${empresa.id}.`, "error");
      return;
    }

    const stripe = await loadStripe(empresa.stripePublishableKey);
    if (!stripe) {
      showToast("Stripe no se pudo inicializar.", "error");
      return;
    }

    const returnUrl =
      process.env.NEXT_PUBLIC_URL_RETORNO || window.location.origin;

    try {
      setLoading(true);
      const response = await fetch("/api/stripe/multi-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresaId: empresa.id,
          fecha,
          personas,
          extrasSeleccionados,
          returnUrl,
        }),
      });

      const payload = (await response.json()) as {
        sessionId?: string;
        url?: string;
        error?: string;
      };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "No se pudo crear la sesion de pago.");
      }

      window.location.href = payload.url;
    } catch {
      showToast(
        "Estamos configurando Stripe. En produccion, aqui te redirigiriamos al checkout seguro automaticamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md p-3 sm:p-4">
      <div className="overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-b from-sky-50 via-cyan-50 to-white shadow-[0_20px_60px_-30px_rgba(2,132,199,0.55)]">
        <div className="relative border-b border-cyan-100 px-5 pb-5 pt-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,116,144,0.12),transparent_40%)]" />
          <div className="relative flex items-center gap-3">
            <img
              src={empresa.logoUrl}
              alt={`${empresa.nombre} logo`}
              className="h-12 w-12 rounded-2xl border border-cyan-100 object-cover shadow-sm"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-700">
                Reserva Vacacional
              </p>
              <h2 className="text-xl font-bold text-slate-900">
                {empresa.nombre}
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="rounded-2xl border border-cyan-100 bg-white p-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Fecha de experiencia
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="rounded-2xl border border-cyan-100 bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Personas
            </p>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPersonas((prev) => Math.max(1, prev - 1))}
                className="h-10 w-10 rounded-full border border-slate-200 text-lg font-bold text-slate-700 transition hover:bg-slate-100"
              >
                -
              </button>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{personas}</p>
                <p className="text-xs text-slate-500">viajeros</p>
              </div>
              <button
                type="button"
                onClick={() => setPersonas((prev) => Math.min(20, prev + 1))}
                className="h-10 w-10 rounded-full border border-slate-200 text-lg font-bold text-slate-700 transition hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-100 bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Extras
            </p>
            <div className="space-y-2.5">
              {empresa.extras.map((extra) => {
                const isChecked = extrasSeleccionados.includes(extra.id);
                return (
                  <label
                    key={extra.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 transition ${
                      isChecked
                        ? "border-cyan-300 bg-cyan-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleExtra(extra.id)}
                        className="h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500"
                      />
                      <span className="text-sm font-medium text-slate-800">
                        {extra.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      + {formatPrice(extra.price, empresa.moneda)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>Base</span>
              <span>{formatPrice(empresa.precioBase, empresa.moneda)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm text-slate-700">
              <span>
                Personas ({personas} x{" "}
                {formatPrice(empresa.precioPorPersona, empresa.moneda)})
              </span>
              <span>
                {formatPrice(
                  personas * empresa.precioPorPersona,
                  empresa.moneda
                )}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm text-slate-700">
              <span>Extras</span>
              <span>{formatPrice(precioExtras, empresa.moneda)}</span>
            </div>
            <div className="mt-3 border-t border-cyan-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Total</span>
                <span className="text-2xl font-extrabold text-cyan-800">
                  {formatPrice(total, empresa.moneda)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-700 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-700/20 transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Redirigiendo a Stripe..." : "Pagar ahora con Stripe"}
          </button>
          {!DICCIONARIO_EMPRESAS[slugFromPath] ? (
            <p className="text-center text-xs text-amber-700">
              No se encontro el slug solicitado. Se muestra la empresa por defecto.
            </p>
          ) : null}
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-in slide-in-from-bottom-2 fade-in">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${
              toast.type === "error"
                ? "border-rose-200 bg-white/95 text-rose-700"
                : "border-emerald-200 bg-white/95 text-emerald-700"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </section>
  );
}
