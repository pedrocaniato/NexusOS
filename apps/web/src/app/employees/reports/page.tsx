'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, DollarSign, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';

interface WorkOrder {
  id: number;
  status: string;
  totalValue: number;
  servicesValue: number;
  commissionValue: number;
  commissionPaid: boolean;
  exitDate: string;
  customer?: { name: string };
}

interface ReportEmployee {
  id: number;
  name: string;
  cpf: string;
  commissionRate: number;
  totalServices: number;
  totalCommission: number;
  status: 'PENDENTE' | 'PAGO';
  workOrders: WorkOrder[];
}

export default function ReportsPage() {
  const currentDate = new Date();
  const [month, setMonth] = useState<string>((currentDate.getMonth() + 1).toString());
  const [year, setYear] = useState<string>(currentDate.getFullYear().toString());
  
  const [employees, setEmployees] = useState<ReportEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/employees/reports?month=${month}&year=${year}`);
      // Filter out employees that have 0 work orders just to keep the report clean, or show all? 
      // Usually, we only want to see people who had commissions this month.
      const filtered = response.data.filter((e: ReportEmployee) => e.workOrders.length > 0);
      setEmployees(filtered);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error('Erro ao carregar os dados do relatório.');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handlePayMonth = async () => {
    // Verificar se tem algo a pagar
    const hasPending = employees.some(e => e.status === 'PENDENTE');
    if (!hasPending) {
      toast.info('Não há comissões pendentes para este mês.');
      return;
    }

    if (!confirm('Tem certeza que deseja liquidar TODAS as comissões pendentes deste mês? Esta ação não pode ser desfeita.')) {
      return;
    }

    setPaying(true);
    try {
      await api.post('/employees/reports/pay', { month: Number(month), year: Number(year) });
      toast.success('Comissões liquidadas com sucesso!');
      loadReports();
    } catch (error) {
      console.error('Erro ao liquidar comissões:', error);
      toast.error('Erro ao liquidar comissões.');
    } finally {
      setPaying(false);
    }
  };

  const toggleRow = (id: number) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const months = [
    { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' }, { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' }, { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' }, { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  const totalCommissions = employees.reduce((acc, emp) => acc + emp.totalCommission, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fechamento de Comissões</h1>
          <p className="text-muted-foreground">Gerencie e liquide as comissões mensais dos funcionários.</p>
        </div>
        <Button onClick={handlePayMonth} disabled={paying || employees.length === 0} className="w-full sm:w-auto">
          <CheckCircle2 className="mr-2" size={16} />
          {paying ? 'Liquidando...' : 'Liquidar Mês'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border md:col-span-2">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <CalendarIcon size={18} className="text-muted-foreground" />
              Período de Apuração
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="space-y-1 w-full max-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground">Mês</label>
              <Select value={month} onValueChange={(val) => val && setMonth(val)}>
                <SelectTrigger className="bg-surface-inset border-border">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 w-full max-w-[120px]">
              <label className="text-sm font-medium text-muted-foreground">Ano</label>
              <Select value={year} onValueChange={(val) => val && setYear(val)}>
                <SelectTrigger className="bg-surface-inset border-border">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription>Total em Comissões (Mês)</CardDescription>
            <CardTitle className="text-3xl text-primary flex items-center gap-2">
              <DollarSign size={24} />
              {formatCurrency(totalCommissions)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Soma de todas as comissões geradas pelos funcionários neste período.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg font-medium">Detalhamento por Funcionário</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 p-0 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-10 text-muted-foreground italic text-sm animate-pulse">Carregando relatório...</div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground space-y-2">
              <p>Nenhuma comissão gerada para o período selecionado.</p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-surface-inset">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Funcionário</TableHead>
                    <TableHead className="text-muted-foreground">Taxa</TableHead>
                    <TableHead className="text-muted-foreground">Serviços Totais</TableHead>
                    <TableHead className="text-muted-foreground">Comissão</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="w-10 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <React.Fragment key={employee.id}>
                      <TableRow 
                        className={`border-border transition-colors cursor-pointer ${expandedRow === employee.id ? 'bg-muted/50' : 'hover:bg-muted/30'}`}
                        onClick={() => toggleRow(employee.id)}
                      >
                        <TableCell className="font-medium text-foreground">{employee.name}</TableCell>
                        <TableCell className="text-muted-foreground">{employee.commissionRate}%</TableCell>
                        <TableCell className="text-muted-foreground">{formatCurrency(employee.totalServices)}</TableCell>
                        <TableCell className="font-medium text-primary">{formatCurrency(employee.totalCommission)}</TableCell>
                        <TableCell>
                          <Badge variant={employee.status === 'PAGO' ? 'default' : 'secondary'} className={employee.status === 'PAGO' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}>
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {expandedRow === employee.id ? <ChevronUp size={16} className="text-muted-foreground inline" /> : <ChevronDown size={16} className="text-muted-foreground inline" />}
                        </TableCell>
                      </TableRow>
                      
                      <AnimatePresence>
                        {expandedRow === employee.id && (
                          <motion.tr 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-b border-border"
                          >
                            <td colSpan={6} className="p-0">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 bg-zinc-100 dark:bg-zinc-900/50">
                                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Ordens de Serviço Relacionadas</h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="border-border hover:bg-transparent">
                                        <TableHead className="h-8 text-xs text-muted-foreground">OS #</TableHead>
                                        <TableHead className="h-8 text-xs text-muted-foreground">Cliente</TableHead>
                                        <TableHead className="h-8 text-xs text-muted-foreground">Data Conclusão</TableHead>
                                        <TableHead className="h-8 text-xs text-muted-foreground">Valor Serviços</TableHead>
                                        <TableHead className="h-8 text-xs text-muted-foreground">Comissão</TableHead>
                                        <TableHead className="h-8 text-xs text-muted-foreground text-right">Situação</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {employee.workOrders.map(os => (
                                        <TableRow key={os.id} className="border-border hover:bg-transparent">
                                          <TableCell className="py-2 text-sm">#{os.id.toString().padStart(4, '0')}</TableCell>
                                          <TableCell className="py-2 text-sm text-muted-foreground">{os.customer?.name || '-'}</TableCell>
                                          <TableCell className="py-2 text-sm text-muted-foreground">
                                            {os.exitDate ? new Date(os.exitDate).toLocaleDateString('pt-BR') : '-'}
                                          </TableCell>
                                          <TableCell className="py-2 text-sm text-muted-foreground">{formatCurrency(os.servicesValue || 0)}</TableCell>
                                          <TableCell className="py-2 text-sm text-primary">{formatCurrency(os.commissionValue || 0)}</TableCell>
                                          <TableCell className="py-2 text-sm text-right">
                                            {os.commissionPaid ? (
                                              <span className="text-emerald-500 font-medium text-xs">Paga</span>
                                            ) : (
                                              <span className="text-amber-500 font-medium text-xs">Pendente</span>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </motion.div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
