'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import api from '@/services/api';

interface Customer {
  id: string;
  name: string;
  document?: string;
}

interface ComboboxCustomerProps {
  onSelect: (customer: Customer | null) => void;
  selectedId?: string;
}

export function ComboboxCustomer({ onSelect, selectedId }: ComboboxCustomerProps) {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);

  // Busca clientes ao digitar
  useEffect(() => {
    const fetchCustomers = async () => {
      if (query.length < 2) {
        setCustomers([]);
        return;
      }
      setLoading(true);
      try {
        const response = await api.get('/customers');
        const all: Customer[] = response.data;
        const filtered = all.filter(c => 
          c.name.toLowerCase().includes(query.toLowerCase()) || 
          c.document?.includes(query)
        );
        setCustomers(filtered.slice(0, 5));
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Carrega cliente selecionado inicialmente se houver ID
  useEffect(() => {
    if (selectedId && !selected) {
      api.get(`/customers/${selectedId}`).then(res => {
        setSelected(res.data);
        setQuery(res.data.name);
      });
    }
  }, [selectedId]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
        <Input
          placeholder="Buscar cliente por nome ou CPF/CNPJ..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) {
              setSelected(null);
              onSelect(null);
            }
          }}
          onFocus={() => setOpen(true)}
          className="pl-10"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" size={16} />}
      </div>

      {open && (query.length >= 2 || customers.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-auto py-1">
          {customers.length === 0 && !loading ? (
            <div className="px-4 py-2 text-sm text-zinc-500">Nenhum cliente encontrado</div>
          ) : (
            customers.map((c) => (
              <button
                key={c.id}
                type="button"
                className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-muted transition-colors group"
                onClick={() => {
                  setSelected(c);
                  setQuery(c.name);
                  setOpen(false);
                  onSelect(c);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <User size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-zinc-500">{c.document || 'Sem documento'}</p>
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
