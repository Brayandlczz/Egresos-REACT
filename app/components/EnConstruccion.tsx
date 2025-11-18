"use client"

import React from "react";
import { useRouter } from "next/navigation";

type Props = {
  title?: string;
  subtitle?: string;
  showButton?: boolean;
  onBack?: () => void;
};

export default function EnConstruccion({
  title = "¡En Construcción!",
  subtitle = "Estamos trabajando para proporcionarte una mejor tecnología a tu alcance.",
  showButton = true,
  onBack,
}: Props) {
  const router = useRouter();

  function handleBack() {
    if (onBack) return onBack();
    router.push("/dashboard");
  }
    
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="mx-auto my-auto max-w-4xl bg-white shadow-lg rounded-2xl ring-1 ring-blue-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 md:p-12 items-center h-full">
          <section className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {title}
            </h1>

            <p className="text-slate-600 text-lg sm:text-xl">{subtitle}</p>

            <div className="flex items-center gap-4">
              {showButton && (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 transition-transform text-white font-medium shadow-md"
                >
                  Volver al inicio
                </button>
              )}

              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-sm text-slate-500 underline-offset-2 hover:underline"
              >
                Suscríbete para recibir novedades
              </a>
            </div>

            <div className="mt-4 w-full bg-blue-100 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full bg-sky-500 animate-progress" style={{ width: '62%' }} />
            </div>

            <div className="flex gap-3 mt-3 text-sm text-slate-500">
              <span>Actualizaciones cada semana</span>
              <span>•</span>
              <span>Soporte 24/7</span>
            </div>
          </section>

          <aside className="flex items-center justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
              <div className="absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center">
                <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className="w-36 h-36">
                  <defs>
                    <linearGradient id="hc1" x1="0" x2="1">
                      <stop offset="0" stopColor="#3b82f6" />
                      <stop offset="1" stopColor="#0ea5e9" />
                    </linearGradient>
                  </defs>

                  <g transform="translate(10,12)">
                    <path d="M20 30 C10 30 5 28 5 20 C5 12 20 8 40 8 C60 8 75 12 75 20 C75 28 70 30 60 30 Z" fill="url(#hc1)" stroke="#1e40af" strokeWidth="1.5" />
                    <rect x="12" y="24" width="50" height="6" rx="3" fill="#fff" opacity="0.12" />
                  </g>

                  <g transform="translate(68,56) scale(0.95)">
                    <path d="M12 2 L2 38 L22 38 Z" fill="#0ea5e9" stroke="#0369a1" strokeWidth="1" />
                    <rect x="3" y="24" width="18" height="4" fill="#fff" opacity="0.9" rx="1"/>
                    <rect x="4" y="30" width="16" height="3" fill="#fff" opacity="0.6" rx="1"/>
                  </g>

                  <g stroke="#60a5fa" opacity="0.25" strokeWidth="2">
                    <line x1="6" y1="90" x2="114" y2="90" />
                    <line x1="6" y1="96" x2="114" y2="96" />
                  </g>
                </svg>

                <div className="mt-4 text-center">
                  <p className="font-semibold text-slate-800">Mejoras en curso</p>
                  <p className="text-xs text-slate-500 mt-1">Interfaz, rendimiento y seguridad</p>
                </div>
              </div>

              <svg className="absolute -bottom-6 -right-6 w-28 h-28 opacity-30" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(50 50)">
                  <path d="M-6-25 L6-25 L10-12 L6 0 L-6 0 L-10-12Z" fill="#60a5fa" transform="rotate(25) translate(0, -20)" />
                  <circle r="20" stroke="#3b82f6" strokeWidth="4" fill="none" />
                </g>
              </svg>
            </div>
          </aside>
        </div>

        <footer className="border-t border-blue-50 px-6 py-4 text-sm text-slate-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} UNICI. Todos los derechos reservados.</span>
          <span>Versión beta</span>
        </footer>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { transform: translateX(-10%); }
          to { transform: translateX(0%); }
        }
        .animate-progress { animation: progress 2.5s ease-in-out infinite alternate; }
        .animate-bounce-slow { animation: bounce 2s infinite; }
      `}</style>
    </main>
  );
}
