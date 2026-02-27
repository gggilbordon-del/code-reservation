import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <section className="mx-auto flex max-w-md flex-col gap-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Micro-SaaS Reservas</h1>
        <p className="text-sm text-slate-600">
          Elige una demo para probar los flujos de reserva y pago.
        </p>
        <Link
          href="/actividades"
          className="rounded-md bg-cyan-700 px-4 py-2 text-center text-white hover:bg-cyan-800"
        >
          Ir a Actividades / Barcos
        </Link>
        <Link
          href="/retiros"
          className="rounded-md bg-stone-800 px-4 py-2 text-center text-white hover:bg-stone-900"
        >
          Ir a Retiros / Villas
        </Link>
        <Link
          href="/aventura-sagitarius-star"
          className="rounded-md bg-cyan-900 px-4 py-2 text-center text-white hover:bg-cyan-950"
        >
          Ir a Aventura Sagitarius Star
        </Link>
        <Link
          href="/actividades/aquasports"
          className="rounded-md bg-blue-700 px-4 py-2 text-center text-white hover:bg-blue-800"
        >
          Ir a AquaSports Gran Canaria
        </Link>
        <Link
          href="/actividades/ecotara"
          className="rounded-md bg-green-700 px-4 py-2 text-center text-white hover:bg-green-800"
        >
          Ir a EcoTara Wellness Retreat
        </Link>
      </section>
    </main>
  );
}
