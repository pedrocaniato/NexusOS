"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  Wrench,
  Monitor,
  FileText,
  ChevronDown,
  ChevronRight,
  CircleDot
} from "lucide-react";
import { ModeToggle } from "./mode-toggle";

const logoSvg = (
  <svg width="36" height="36" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    {/* Conexão Curva Amarela */}
    <path d="M25 95 Q 40 40 95 25" stroke="#FFD700" strokeWidth="8" strokeLinecap="round" fill="none" />
    <path d="M25 95 L 60 60" stroke="#FFD700" strokeWidth="8" strokeLinecap="round" />
    <path d="M60 60 L 95 25" stroke="#FFD700" strokeWidth="8" strokeLinecap="round" />
    
    {/* Conexão Curva Verde */}
    <path d="M25 25 Q 40 80 95 95" stroke="#50C878" strokeWidth="8" strokeLinecap="round" fill="none" />
    <path d="M25 25 L 60 60" stroke="#50C878" strokeWidth="8" strokeLinecap="round" />
    <path d="M60 60 L 95 95" stroke="#50C878" strokeWidth="8" strokeLinecap="round" />

    {/* Esferas Verdes (Pontas) */}
    <circle cx="25" cy="25" r="14" fill="#50C878" />
    <circle cx="95" cy="25" r="14" fill="#50C878" />
    <circle cx="25" cy="95" r="14" fill="#50C878" />
    <circle cx="95" cy="95" r="14" fill="#50C878" />

    {/* Esfera Amarela (Centro) */}
    <circle cx="60" cy="60" r="18" fill="#FFD700" stroke="#18181b" strokeWidth="4" />

    {/* Decorações Triangulares */}
    <polygon points="45,20 52,28 40,28" fill="#FFD700" />
    <polygon points="75,100 82,92 70,92" fill="#50C878" />
    <polygon points="20,45 28,52 28,40" fill="#50C878" />
  </svg>
);

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status");
  
  // Estado para os menus Dropdown
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    funcionarios: false,
    catalogo: false,
    os: true // Ordens de serviço abertas por padrão para facilitar o acesso
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActive = (path: string, exact = false) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-64 border-r bg-background flex flex-col h-screen shrink-0 sticky top-0 overflow-hidden">
      {/* HEADER DA SIDEBAR */}
      <div className="h-16 flex items-center justify-between px-4 border-b shrink-0">
        <Link href="/" className="flex items-center gap-2 select-none">
          {logoSvg}
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-[#FFD700] tracking-tight">Nexus</span>
            <span className="text-2xl font-light text-[#50C878] tracking-tight">OS</span>
          </div>
        </Link>
        <ModeToggle />
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 overflow-y-auto py-6 scrollbar-hide">
        <ul className="space-y-1.5 px-3">
          
          {/* 1. Home */}
          <li>
            <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive("/", true)
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Home
            </Link>
          </li>

          {/* 2. Pessoas / Contatos */}
          <li>
            <Link
              href="/customers"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive("/customers")
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Users className="h-5 w-5" />
              Pessoas / Contatos
            </Link>
          </li>

          {/* 3. Funcionários (Dropdown) */}
          <li>
            <button
              onClick={() => toggleMenu('funcionarios')}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-3">
                <UserCog className="h-5 w-5" />
                Funcionários
              </div>
              {openMenus.funcionarios ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {openMenus.funcionarios && (
              <ul className="mt-1 ml-5 border-l border-border pl-2 space-y-1">
                <li>
                  <Link
                    href="/employees"
                    className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive("/employees", true)
                        ? "bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    }`}
                  >
                    Lista
                  </Link>
                </li>
                <li>
                  <Link
                    href="/employees/reports"
                    className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive("/employees/reports")
                        ? "bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    }`}
                  >
                    Relatórios / Fechamento
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* 4. Catálogo (Dropdown) */}
          <li>
            <button
              onClick={() => toggleMenu('catalogo')}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5" />
                Catálogo
              </div>
              {openMenus.catalogo ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {openMenus.catalogo && (
              <ul className="mt-1 ml-5 border-l border-border pl-2 space-y-1">
                <li>
                  <Link
                    href="/products"
                    className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive("/products")
                        ? "bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    }`}
                  >
                    Estoque
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive("/services")
                        ? "bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    }`}
                  >
                    Serviços
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* 5. Equipamentos */}
          <li>
            <Link
              href="/equipments"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive("/equipments")
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Monitor className="h-5 w-5" />
              Equipamentos
            </Link>
          </li>

          {/* 6. Ordens de Serviço (DETALHAMENTO CRÍTICO) */}
          <li>
            <button
              onClick={() => toggleMenu('os')}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive("/work-orders") && !openMenus.os
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                Ordens de Serviço
              </div>
              {openMenus.os ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {openMenus.os && (
              <ul className="mt-1 ml-5 border-l border-border pl-2 space-y-1">
                {[
                  { label: "Todas", href: "/work-orders" },
                  { label: "Entrada", href: "/work-orders?status=ENTRADA" },
                  { label: "Orçamento", href: "/work-orders?status=ORCAMENTO" },
                  { label: "Aberto", href: "/work-orders?status=ABERTO" },
                  { label: "Andamento", href: "/work-orders?status=ANDAMENTO" },
                  { label: "Concluído", href: "/work-orders?status=CONCLUIDO" },
                  { label: "Cancelado", href: "/work-orders?status=CANCELADO" },
                ].map((item) => {
                  const isItemActive = item.href === "/work-orders" 
                    ? isActive("/work-orders", true) && !currentStatus
                    : item.href.includes(`status=${currentStatus}`);

                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          isItemActive
                            ? "bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium"
                            : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                        }`}
                      >
                        <CircleDot className="h-3 w-3 opacity-50" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

        </ul>
      </nav>
    </aside>
  );
}
