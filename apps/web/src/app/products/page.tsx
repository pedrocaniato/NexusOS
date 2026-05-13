'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Loader2,
  Package,
  Trash2,
  Edit2,
  AlertTriangle,
  Settings2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { ProductModal } from '@/components/product-modal';
import { cn } from '@/lib/utils';
import api from '@/services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [supplierNameFilter, setSupplierNameFilter] = useState('');
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta peça do estoque?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  const totalValue = useMemo(
    () => products.reduce((acc, p) => acc + (p.costPrice || 0) * p.stock, 0),
    [products]
  );

  const uniqueLocations = useMemo(
    () => Array.from(new Set(products.map((p) => p.location).filter(Boolean))) as string[],
    [products]
  );

  const uniqueSupplierNames = useMemo(
    () => Array.from(new Set(products.map((p) => p.supplierName).filter(Boolean))) as string[],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCritical = showCriticalOnly ? p.stock <= p.minStock : true;
      const matchLocation = locationFilter ? p.location === locationFilter : true;
      const matchSupplier = supplierNameFilter ? p.supplierName === supplierNameFilter : true;
      const matchMin = minPriceFilter ? p.price >= Number(minPriceFilter) : true;
      const matchMax = maxPriceFilter ? p.price <= Number(maxPriceFilter) : true;
      return matchSearch && matchCritical && matchLocation && matchSupplier && matchMin && matchMax;
    });
  }, [products, searchTerm, showCriticalOnly, locationFilter, supplierNameFilter, minPriceFilter, maxPriceFilter]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">

      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">
            Estoque de Peças
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mt-1">
            Gerencie componentes e insumos físicos
          </p>
        </div>
        <ProductModal
          onSuccess={fetchProducts}
          trigger={
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-tighter h-11 px-6 shadow-[0_0_15px_#9ef01a]">
              <Plus className="mr-2" size={20} />
              Nova Peça
            </Button>
          }
        />
      </div>

      {/* ─── KPI CARDS ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border p-4 flex flex-col justify-center border-l-4 border-l-primary">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
            Valor Total em Estoque (Custo)
          </p>
          <p className="text-2xl font-black text-foreground mt-1">{fmt(totalValue)}</p>
        </Card>
        <Card className="bg-card border-border p-4 flex flex-col justify-center border-l-4 border-l-emerald-500">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
            Itens em Estoque
          </p>
          <p className="text-2xl font-black text-foreground mt-1">{products.length}</p>
        </Card>
        <Card className="bg-card border-border p-4 flex flex-col justify-center border-l-4 border-l-red-500">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
            Estoque Crítico
          </p>
          <p className="text-2xl font-black text-foreground mt-1">
            {products.filter((p) => p.stock <= p.minStock).length}
          </p>
        </Card>
      </div>

      {/* ─── SEARCH BAR + FILTROS ───────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <Card className="flex-1 bg-surface-inset border-border relative flex items-center">
            <Input
              placeholder="Buscar por nome ou modelo (real-time)…"
              className="border-none bg-transparent focus-visible:ring-0 h-12 text-base w-full pl-4 pr-12 text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="text-muted-foreground absolute right-4 pointer-events-none" size={18} />
          </Card>
          <Button
            variant="outline"
            onClick={() => setShowFiltersMenu((v) => !v)}
            className={cn(
              'h-14 px-5 border-border font-black uppercase tracking-tighter shrink-0',
              showFiltersMenu
                ? 'bg-muted text-foreground border-border'
                : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {showFiltersMenu ? <X className="mr-2" size={18} /> : <Settings2 className="mr-2" size={18} />}
            Filtros Avançados
          </Button>
        </div>

        {showFiltersMenu && (
          <Card className="bg-card border-border p-6 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Crítico */}
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  Atenção Crítica
                </p>
                <button
                  onClick={() => setShowCriticalOnly((v) => !v)}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 h-10 rounded-md font-bold uppercase tracking-tighter text-sm transition-all border',
                    showCriticalOnly
                      ? 'bg-red-500/10 text-red-500 border-red-500/30'
                      : 'bg-transparent text-muted-foreground border-border hover:border-border hover:text-foreground'
                  )}
                >
                  <AlertTriangle size={16} />
                  Ver Apenas Críticos
                </button>
              </div>

              {/* Localização */}
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  Localização
                </p>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full h-10 rounded-md border border-border bg-surface-inset px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todas</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Fornecedor */}
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  Fornecedor
                </p>
                <select
                  value={supplierNameFilter}
                  onChange={(e) => setSupplierNameFilter(e.target.value)}
                  className="w-full h-10 rounded-md border border-border bg-surface-inset px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todos</option>
                  {uniqueSupplierNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Range de preço */}
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  Preço de Venda (R$)
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    className="h-10 bg-surface-inset border-border"
                    value={minPriceFilter}
                    onChange={(e) => setMinPriceFilter(e.target.value)}
                  />
                  <span className="text-zinc-600 shrink-0">—</span>
                  <Input
                    type="number"
                    placeholder="Máx"
                    className="h-10 bg-surface-inset border-border"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* ─── TABELA ─────────────────────────────────────────────── */}
      <Card className="bg-card border-border overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
              Sincronizando Inventário…
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">
                  Componente / Peça
                </TableHead>
                <TableHead className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">
                  Custo
                </TableHead>
                <TableHead className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">
                  Venda
                </TableHead>
                <TableHead className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">
                  Qtd.
                </TableHead>
                <TableHead className="text-right text-muted-foreground font-black uppercase tracking-widest text-[10px]">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-20 text-muted-foreground font-bold uppercase tracking-widest text-xs"
                  >
                    Nenhum item encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((p) => (
                  <TableRow
                    key={p.id}
                    className="border-border hover:bg-muted/30 transition-colors group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <Package size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {p.name}
                          </p>
                          <p className="text-sm text-muted-foreground font-medium uppercase tracking-tighter">
                            {p.supplierName ? p.supplierName : `REF: ${p.id.split('-')[0]}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {p.costPrice ? fmt(p.costPrice) : '—'}
                    </TableCell>
                    <TableCell className="font-black text-foreground">{fmt(p.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'font-black text-lg',
                            p.stock <= p.minStock ? 'text-red-500' : 'text-zinc-300'
                          )}
                        >
                          {p.stock}
                        </span>
                        {p.stock <= p.minStock && (
                          <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ProductModal
                          product={p}
                          onSuccess={fetchProducts}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Edit2 size={16} />
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
