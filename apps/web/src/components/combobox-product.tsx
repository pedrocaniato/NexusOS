'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import api from '@/services/api';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ComboboxProductProps {
  onSelect: (product: Product | null) => void;
}

export function ComboboxProduct({ onSelect }: ComboboxProductProps) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (query.length < 2) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const response = await api.get('/products');
        const all: Product[] = response.data;
        const filtered = all.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase())
        );
        setProducts(filtered.slice(0, 5));
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
        <Input
          placeholder="Buscar peça no estoque..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-10"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" size={16} />}
      </div>

      {open && (query.length >= 2 || products.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-auto py-1">
          {products.length === 0 && !loading ? (
            <div className="px-4 py-2 text-sm text-zinc-500">Nenhum item encontrado</div>
          ) : (
            products.map((p) => (
              <button
                key={p.id}
                type="button"
                className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-muted transition-colors group"
                onClick={() => {
                  onSelect(p);
                  setQuery('');
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Package size={14} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                       <span className={cn(
                         "text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                       )}>
                         P
                       </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">
                      Peça / Insumo • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
