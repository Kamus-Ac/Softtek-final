"use client";

export default function RouteError({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto max-w-5xl space-y-3 px-4 py-8 sm:px-6">
      <h1>No pudimos cargar la página</h1>
      <p>Intenta cargarla de nuevo.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded border border-neutral-400 px-3 py-2"
      >
        Reintentar
      </button>
    </main>
  );
}
