'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users } from 'lucide-react';
import api from '@/services/api';
import { CustomerModal } from '@/components/customer-modal';

const CONTACT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  CLIENTE:     { label: 'Cliente',     color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  CONTRATO:    { label: 'Contrato',    color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  PARCEIRO:    { label: 'Parceiro',    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  FORNECEDOR:  { label: 'Fornecedor',  color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  GARANTIA:    { label: 'Garantia',    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  FABRICANTE:  { label: 'Fabricante',  color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  REMOTO:      { label: 'Remoto',      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  VISITA:      { label: 'Visita',      color: 'bg-lime-500/10 text-lime-400 border-lime-500/20' },
};

interface Customer {
  id: string;
  name: string;
  personType: string;
  contactType: string;
  email: string | null;
  phone: string | null;
  document: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers');
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar cadastros:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.document || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pessoas / Contatos</h1>
          <p className="text-muted-foreground">Gerencie clientes, fornecedores, parceiros e contatos.</p>
        </div>
        <CustomerModal onSuccess={loadCustomers} />
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-lg font-medium">Cadastros</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar por nome, documento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-inset border border-border rounded-md py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-10 text-muted-foreground italic">Carregando dados...</div>
          ) : !Array.isArray(filteredCustomers) || filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground space-y-2">
              <Users size={48} className="opacity-20" />
              <p>Nenhum cadastro encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Nome</TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-muted-foreground">Documento</TableHead>
                  <TableHead className="text-muted-foreground">E-mail</TableHead>
                  <TableHead className="text-muted-foreground">Telefone</TableHead>
                  <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const badge = CONTACT_TYPE_LABELS[customer.contactType] || { label: customer.contactType, color: 'bg-secondary text-muted-foreground border-border' };
                  return (
                    <TableRow key={customer.id} className="border-border hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-foreground">{customer.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{customer.document || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{customer.email || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{customer.phone || '-'}</TableCell>
                      <TableCell className="text-right">
                        <CustomerModal initialData={customer} onSuccess={loadCustomers} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
