'use client';

import { useState, useEffect, Suspense } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Calendar, ArrowRight, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { WorkOrderModal } from '@/components/work-order-modal';

const statusMap: Record<string, { label: string, variant: any }> = {
  ENTRADA: { label: 'Entrada', variant: 'info' },
  ORCAMENTO: { label: 'Orçamento', variant: 'warning' },
  ABERTO: { label: 'Aberto', variant: 'default' },
  ANDAMENTO: { label: 'Em Andamento', variant: 'info' },
  CONCLUIDO: { label: 'Concluído', variant: 'success' },
  FINALIZADO: { label: 'Finalizado', variant: 'secondary' },
  CANCELADO: { label: 'Cancelado', variant: 'destructive' },
  FATURADO: { label: 'Faturado', variant: 'success' }, 
};

function WorkOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');

  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWorkOrders = async () => {
  setLoading(true);
  try {
    let statusParaEnvio = statusParam;

    // 2. NORMALIZAÇÃO NO FRONT: Se vier "CONCLUÍDO", vira "CONCLUIDO" antes de ir pro Back
    if (statusParaEnvio) {
      statusParaEnvio = statusParaEnvio
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      // Ajuste específico: Se o seu front usa "CONCLUIDO" para a aba, 
      // mas no banco você quer ver o que está "FINALIZADO"
      if (statusParaEnvio === 'CONCLUIDO') {
        // statusParaEnvio = 'FINALIZADO'; // Descomente se quiser unificar as abas
      }
    }

    const url = statusParaEnvio ? `/work-orders?status=${statusParaEnvio}` : '/work-orders';
    const response = await api.get(url);
    setWorkOrders(response.data);
  } catch (err) {
    console.error('Erro ao buscar ordens de serviço:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchWorkOrders();
  }, [statusParam]);

  const filteredOS = workOrders.filter(os => {
    const normalizedSearch = searchTerm.toLowerCase().replace('#', '');
    return (
      os.id.toString().includes(normalizedSearch) || 
      os.customer?.name.toLowerCase().includes(normalizedSearch) ||
      os.equipment.toLowerCase().includes(normalizedSearch)
    );
  });

  const handleDownloadPdf = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita navegar para detalhes ao clicar em imprimir
    try {
      const response = await api.get(`/work-orders/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `OS_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erro ao baixar PDF:', err);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Ordens de Serviço</h1>
          <p className="text-muted-foreground mt-1">Gerencie manutenções e atendimentos técnicos.</p>
        </div>
        <WorkOrderModal onSuccess={fetchWorkOrders} />
      </div>

      <Card className="bg-card border-zinc-200 dark:border-zinc-800 p-6 shadow-xl shadow-black/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Buscar por OS, Cliente ou Equipamento..." 
              className="bg-surface-inset border-zinc-300 dark:border-zinc-800 pl-10 h-11 text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="h-11 px-4 border-border">{filteredOS.length} OS Encontradas</Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-muted-foreground animate-pulse">Carregando ordens de serviço...</p>
          </div>
        ) : filteredOS.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada.</p>
          </div>
        ) : (
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-surface-inset">
                <TableRow className="hover:bg-transparent border-zinc-200 dark:border-zinc-800">
                  <TableHead className="w-[80px] text-muted-foreground">OS #</TableHead>
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Equipamento</TableHead>
                  <TableHead className="text-muted-foreground">Data Entrada</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Valor Total</TableHead>
                  <TableHead className="text-right text-muted-foreground">Comissão</TableHead>
                  <TableHead className="text-right text-muted-foreground"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOS.map((os) => (
                  <TableRow 
                    key={os.id} 
                    className="hover:bg-muted/50 border-zinc-200 dark:border-zinc-800 cursor-pointer"
                    onClick={() => router.push(`/work-orders/${os.id}`)}
                  >
                    <TableCell className="font-mono text-primary font-bold">
                      #{os.id.toString().padStart(4, '0')}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {os.customer?.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-foreground">{os.equipment}</span>
                        <span className="text-xs text-muted-foreground">{os.brandModel}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar size={14} />
                        {new Date(os.entryDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMap[os.status]?.variant}>
                        {statusMap[os.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.totalValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {['CONCLUIDO', 'FINALIZADO', 'FATURADO'].includes(os.status) && os.commissionValue != null ? (
                        <span className="text-emerald-600 font-bold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.commissionValue)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => handleDownloadPdf(os.id, e)}
                        >
                          <Printer size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                          Gerenciar
                          <ArrowRight size={14} className="ml-2" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function WorkOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando ordens de serviço...</div>}>
      <WorkOrdersContent />
    </Suspense>
  );
}
