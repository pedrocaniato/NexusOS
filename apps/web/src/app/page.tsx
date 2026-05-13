"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  ClipboardList,
  Timer,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  CalendarClock,
  Briefcase,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAnalytics } from "@/hooks/use-analytics";
import { Skeleton } from "@/components/ui/skeleton";

// ── Tooltip customizado Recharts ─────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold text-foreground">
        {payload[0].value}{" "}
        <span className="text-xs font-normal text-muted-foreground">ordens</span>
      </p>
    </div>
  );
}

// ── Status badge inline ──────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    ENTRADA: "bg-sky-500",
    ORCAMENTO: "bg-amber-500",
    ABERTO: "bg-orange-500",
    ANDAMENTO: "bg-blue-500",
    CONCLUIDO: "bg-emerald-500",
    FATURADO: "bg-lime-500",
    CANCELADO: "bg-red-500",
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`w-2 h-2 rounded-full ${colorMap[status] ?? "bg-zinc-500"}`} />
      {status}
    </span>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading } = useAnalytics();

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v);

  const situacoesConfig = [
    { label: "Entrada", status: "ENTRADA", icon: ClipboardList, color: "sky", bg: "bg-sky-50 dark:bg-sky-500/10", border: "border-sky-200 dark:border-sky-500/20", text: "text-sky-600 dark:text-sky-400" },
    { label: "Orçamento", status: "ORCAMENTO", icon: DollarSign, color: "amber", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
    { label: "Em Aberto", status: "ABERTO", icon: Timer, color: "orange", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-200 dark:border-orange-500/20", text: "text-orange-600 dark:text-orange-400" },
    { label: "Andamento", status: "ANDAMENTO", icon: Wrench, color: "blue", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
    { label: "Prontas", status: "CONCLUIDO", icon: CheckCircle2, color: "emerald", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
    { label: "Faturadas", status: "FATURADO", icon: ShieldCheck, color: "lime", bg: "bg-lime-50 dark:bg-lime-500/10", border: "border-lime-200 dark:border-lime-500/20", text: "text-lime-600 dark:text-lime-400" },
  ];

  const situacoes = useMemo(() => {
    if (!data) return [];
    return situacoesConfig.map(s => {
      const count = data.chartData.find(d => d.status === s.status)?.count || 0;
      return { ...s, count };
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-4 h-[400px] rounded-2xl" />
          <Skeleton className="lg:col-span-8 h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral da operação — {new Date().toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          href="/work-orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold transition-all hover:opacity-90 shadow-lg shadow-primary/20"
        >
          <FileText className="h-4 w-4" />
          Nova OS
        </Link>
      </div>

      {/* ─── KPIs PRINCIPAIS — 5 CARDS ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card Faturamento — Destaque */}
        <div className="relative p-5 bg-card rounded-2xl border-l-4 border-emerald-500 border-t border-r border-b border-t-zinc-200 border-r-zinc-200 border-b-zinc-200 dark:border-t-zinc-800 dark:border-r-zinc-800 dark:border-b-zinc-800 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent dark:from-emerald-500/[0.06]" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Faturamento
              </span>
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/15">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {fmt(data?.faturamentoMensal || 0)}
            </h2>
            <p className={`text-xs flex items-center gap-1 mt-2 ${(data?.faturamentoVariacao || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              <span className="font-semibold">{(data?.faturamentoVariacao || 0) >= 0 ? "+" : ""}{data?.faturamentoVariacao}%</span>
              <span className="text-muted-foreground ml-1">vs. anterior</span>
            </p>
          </div>
        </div>

        {/* Card Total Concluído */}
        <div className="p-5 bg-card rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-xl hover:shadow-black/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              A Faturar
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-500/15">
              <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {fmt(data?.totalConcluido || 0)}
          </h2>
          <p className="text-xs text-muted-foreground mt-2">concluídas no mês</p>
        </div>

        {/* Card Ticket Médio */}
        <div className="p-5 bg-card rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-xl hover:shadow-black/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Ticket Médio
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/15">
              <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {fmt(data?.ticketMedio || 0)}
          </h2>
          <p className="text-xs text-muted-foreground mt-2">por OS faturada</p>
        </div>

        {/* Card Clientes */}
        <div className="p-5 bg-card rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-xl hover:shadow-black/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Clientes
            </span>
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-500/15">
              <Users className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {data?.clientesMes || 0}
          </h2>
          <p className="text-xs text-muted-foreground mt-2">novos este mês</p>
        </div>

        {/* Card OS / Mês */}
        <div className="p-5 bg-card rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-xl hover:shadow-black/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              OS / Mês
            </span>
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-500/15">
              <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {data?.osMes || 0}
          </h2>
          <p className="text-xs text-muted-foreground mt-2">total de entradas</p>
        </div>
      </div>

      {/* ─── VISÃO GERAL DE OPERAÇÕES — Cápsulas ─────────────────────────── */}
      <div className="bg-card rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Visão Geral de Operações
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {situacoes.map((s) => (
            <Link
              key={s.label}
              href={`/work-orders?status=${s.status}`}
              className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer
                ${s.bg} ${s.border}`}
            >
              <s.icon className={`h-4 w-4 ${s.text}`} />
              <span className={`text-sm font-semibold ${s.text}`}>{s.label}</span>
              <span className={`text-lg font-bold tabular-nums ${s.text}`}>{s.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── BOTTOM: PRIORIDADE + GRÁFICO ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Coluna Menor — Alta Prioridade */}
        <div className="lg:col-span-4">
          <div className="bg-card rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-500/15">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Alta Prioridade
                </h3>
                <p className="text-xs text-muted-foreground">Atenção imediata</p>
              </div>
              <span className="ml-auto text-xs font-bold bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full">
                {data?.osUrgentes.length || 0}
              </span>
            </div>

            <div className="flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {(data?.osUrgentes || []).map((os) => (
                <Link
                  key={os.id}
                  href={`/work-orders/${os.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-primary font-bold shrink-0">
                      #{String(os.id).padStart(4, "0")}
                    </span>
                    <span className="text-sm font-medium text-foreground truncate">
                      {os.cliente}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusDot status={os.status} />
                    <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-md">
                      {os.prazo}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800">
              <Link href="/work-orders?priority=HIGH" className="text-xs font-semibold text-primary hover:underline">
                Ver todas as OS urgentes →
              </Link>
            </div>
          </div>

          {/* Lista Prioridade Normal */}
          <div className="bg-card rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden mt-6 flex flex-col">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/15">
                <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Prioridade Normal
                </h3>
                <p className="text-xs text-muted-foreground">Fluxo regular</p>
              </div>
              <span className="ml-auto text-xs font-bold bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full">
                {data?.osNormais.length || 0}
              </span>
            </div>

            <div className="flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {(data?.osNormais || []).map((os) => (
                <Link
                  key={os.id}
                  href={`/work-orders/${os.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-primary font-bold shrink-0">
                      #{String(os.id).padStart(4, "0")}
                    </span>
                    <span className="text-sm font-medium text-foreground truncate">
                      {os.cliente}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusDot status={os.status} />
                    <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-500/10 px-2 py-0.5 rounded-md">
                      {os.prazo}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800">
              <Link href="/work-orders?priority=NORMAL" className="text-xs font-semibold text-primary hover:underline">
                Ver todas as OS normais →
              </Link>
            </div>
          </div>
        </div>

        {/* Coluna Maior — Gráfico de Distribuição */}
        <div className="lg:col-span-8">
          <div className="bg-card rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Distribuição de Status
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Volume de ordens por etapa do processo
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                Maio / 2026
              </div>
            </div>

            <div className="flex-1 min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.chartData || []}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <XAxis
                    dataKey="status"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 11 }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(128,128,128,0.06)" }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[8, 8, 0, 0]}
                    barSize={44}
                  >
                    {(data?.chartData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
