"use client";

import React, { useMemo, useState } from "react";

type TicketStatus = "closed" | "waiting" | "open" | "in_progress";

type Ticket = {
  id: string;
  subject: string;
  area: string;
  assignee: string;
  status: TicketStatus;
  createdAt: string;
  respondedAt?: string | null;
  category?: string;
};

const demoTickets: Ticket[] = [
  {
    id: "TCK-001",
    subject: "Acceso a reporte financiero",
    area: "Finanzas",
    assignee: "Gladis Martínez",
    status: "closed",
    createdAt: "2025-10-01T10:15:00.000Z",
    respondedAt: "2025-10-01T12:00:00.000Z",
    category: "Acceso",
  },
  {
    id: "TCK-002",
    subject: "Solicitud de laptop",
    area: "SISTEMAS",
    assignee: "Gabriela Ozuna",
    status: "waiting",
    createdAt: "2025-10-05T08:20:00.000Z",
    respondedAt: null,
    category: "Equipo",
  },
  {
    id: "TCK-003",
    subject: "Cambio de horario",
    area: "RRHH",
    assignee: "Fabiola Pérez",
    status: "in_progress",
    createdAt: "2025-10-09T09:00:00.000Z",
    respondedAt: "2025-10-09T10:00:00.000Z",
    category: "Horario",
  },
  {
    id: "TCK-004",
    subject: "Reporte de bug en ERP",
    area: "SISTEMAS",
    assignee: "Gabriela Ozuna",
    status: "open",
    createdAt: "2025-10-10T11:30:00.000Z",
    respondedAt: null,
    category: "Software",
  },
  {
    id: "TCK-005",
    subject: "Solicitud de material de oficina",
    area: "Administración",
    assignee: "Georgina Hidalgo",
    status: "closed",
    createdAt: "2025-10-03T14:00:00.000Z",
    respondedAt: "2025-10-03T15:30:00.000Z",
    category: "Suministros",
  },
];

const statusConfig: Record<TicketStatus, { label: string; color: string }> = {
  closed: { label: "Cerrado", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  waiting: { label: "En espera", color: "bg-amber-100 text-amber-700 border-amber-200" },
  open: { label: "Abierto", color: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress: { label: "En progreso", color: "bg-purple-100 text-purple-700 border-purple-200" },
};

export default function TicketOverview(): JSX.Element {
  // ahora la página NO recibe props del router; usa demoTickets como estado inicial
  const [tickets, setTickets] = useState<Ticket[]>(demoTickets);

  const [showFilters, setShowFilters] = useState(false);
  const [filterArea, setFilterArea] = useState<string | "">("");
  const [filterAssignee, setFilterAssignee] = useState<string | "">("");
  const [filterFrom, setFilterFrom] = useState<string | "">("");
  const [filterTo, setFilterTo] = useState<string | "">("");

  const areas = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => set.add(t.area));
    return Array.from(set);
  }, [tickets]);

  const assignees = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => set.add(t.assignee));
    return Array.from(set);
  }, [tickets]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (filterArea && t.area !== filterArea) return false;
      if (filterAssignee && t.assignee !== filterAssignee) return false;
      if (filterFrom) {
        const from = new Date(filterFrom);
        if (new Date(t.createdAt) < from) return false;
      }
      if (filterTo) {
        const to = new Date(filterTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(t.createdAt) > to) return false;
      }
      return true;
    });
  }, [tickets, filterArea, filterAssignee, filterFrom, filterTo]);

  const metrics = useMemo(() => {
    const total = filtered.length;
    const closed = filtered.filter((t) => t.status === "closed").length;
    const waiting = filtered.filter((t) => t.status === "waiting").length;
    const inProgress = filtered.filter((t) => t.status === "in_progress").length;
    const responded = filtered.filter((t) => !!t.respondedAt).length;

    const responseRate = total === 0 ? 0 : Math.round((responded / total) * 100);

    const classification = filtered.reduce<Record<string, number>>((acc, t) => {
      const cat = t.category || "Sin clasificación";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return { total, closed, waiting, inProgress, responseRate, classification };
  }, [filtered]);

  function resetFilters() {
    setFilterArea("");
    setFilterAssignee("");
    setFilterFrom("");
    setFilterTo("");
  }

  const donut = useMemo(() => {
    const closed = metrics.closed;
    const others = Math.max(0, metrics.total - metrics.closed);
    const total = closed + others || 1;
    const closedPct = (closed / total) * 100;
    return { closed, others, closedPct };
  }, [metrics]);

  const hasActiveFilters = filterArea || filterAssignee || filterFrom || filterTo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Sumario de Tickets</h1>
            <p className="text-slate-600 mt-1">Gestiona y monitorea todos los tickets del sistema</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-sm
                ${showFilters ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-white text-slate-700 border border-slate-200 hover:border-orange-300 hover:shadow-md"}`}
              aria-expanded={showFilters}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showFilters ? "Ocultar Filtros" : "Filtros"}
              {hasActiveFilters && !showFilters && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
            </button>

            <button className="px-4 py-2.5 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Ticket
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Filtros de búsqueda</h3>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Área</label>
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all outline-none bg-white"
                >
                  <option value="">Todas las áreas</option>
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Asignado a</label>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all outline-none bg-white"
                >
                  <option value="">Todos los asignados</option>
                  {assignees.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fecha desde</label>
                <input
                  type="date"
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fecha hasta</label>
                <input
                  type="date"
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all outline-none bg-white"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-4 text-white transform transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-blue-100 text-sm font-medium mb-1">Total de Tickets</p>
            <p className="text-3xl font-bold">{metrics.total}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-4 text-white transform transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-emerald-100 text-sm font-medium mb-1">Tickets Cerrados</p>
            <p className="text-3xl font-bold">{metrics.closed}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg p-4 text-white transform transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-amber-100 text-sm font-medium mb-1">En Espera</p>
            <p className="text-3xl font-bold">{metrics.waiting}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-4 text-white transform transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-purple-100 text-sm font-medium mb-1">En Progreso</p>
            <p className="text-3xl font-bold">{metrics.inProgress}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 flex flex-col items-center justify-center">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Tasa de Cierre</h3>
            <svg width="140" height="140" viewBox="0 0 42 42" className="mb-3">
              <circle r="15.91549430918954" cx="21" cy="21" fill="transparent" strokeWidth="4" stroke="#f1f5f9" />
              <circle
                r="15.91549430918954"
                cx="21"
                cy="21"
                fill="transparent"
                strokeWidth="4"
                strokeDasharray={`${donut.closedPct} ${100 - donut.closedPct}`}
                strokeDashoffset="25"
                strokeLinecap="round"
                transform="rotate(-90 21 21)"
                stroke="url(#gradient)"
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
              </defs>
              <text x="21" y="22.5" textAnchor="middle" fontSize="5" className="fill-slate-900 font-bold">
                {Math.round(donut.closedPct)}%
              </text>
            </svg>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400" />
                <span className="text-slate-600">Cerrados: <span className="font-semibold text-slate-900">{donut.closed}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-200" />
                <span className="text-slate-600">Otros: <span className="font-semibold text-slate-900">{donut.others}</span></span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 lg:col-span-2">
            <h3 className="text-base font-semibold text-slate-900 mb-3">Clasificación por Categoría</h3>
            <div className="space-y-2">
              {Object.entries(metrics.classification).length === 0 && (
                <div className="text-center py-6">
                  <svg className="w-12 h-12 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-slate-500">No hay tickets en el rango filtrado.</p>
                </div>
              )}

              {Object.entries(metrics.classification).map(([cat, count]) => {
                const pct = metrics.total === 0 ? 0 : Math.round((count / metrics.total) * 100);
                return (
                  <div key={cat} className="group hover:bg-slate-50 p-2 rounded-md transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900">{cat}</p>
                        <p className="text-xs text-slate-500">{count} ticket{count !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-orange-600">{pct}%</p>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Lista de Tickets</h3>
                <p className="text-sm text-slate-500 mt-1">Mostrando {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</p>
              </div>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-20 h-20 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-500 text-lg font-medium">No se encontraron tickets</p>
                <p className="text-slate-400 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Asunto</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Área</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Asignado</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.slice(0, 10).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-slate-900 whitespace-nowrap">{t.id}</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-slate-900 whitespace-nowrap">{t.subject}</p>
                        {t.category && <p className="text-xs text-slate-500 mt-1 whitespace-nowrap">{t.category}</p>}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 whitespace-nowrap">{t.area}</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-semibold">
                            {t.assignee.split(" ").map((n) => n[0]).join("").toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-700 whitespace-nowrap">{t.assignee}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig[t.status].color} whitespace-nowrap`}>
                          {statusConfig[t.status].label}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
