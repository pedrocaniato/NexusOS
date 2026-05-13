import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // 1. Faturamento e Crescimento
    const currentFaturamento = await this.prisma.workOrder.aggregate({
      where: {
        status: 'FATURADO',
        entryDate: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      _sum: { totalValue: true },
      _count: { id: true },
    });

    const lastFaturamento = await this.prisma.workOrder.aggregate({
      where: {
        status: 'FATURADO',
        entryDate: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { totalValue: true },
    });

    const faturamentoMensal = currentFaturamento._sum.totalValue || 0;
    const lastFaturamentoValue = lastFaturamento._sum.totalValue || 0;
    const faturamentoVariacao = lastFaturamentoValue === 0 
      ? 100 
      : Number(((faturamentoMensal - lastFaturamentoValue) / lastFaturamentoValue * 100).toFixed(1));

    // Total Concluído (Apenas CONCLUIDO, sem ser faturado ainda)
    const totalConcluido = await this.prisma.workOrder.aggregate({
      where: {
        status: 'CONCLUIDO',
        entryDate: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      _sum: { totalValue: true },
    });

    // 2. Clientes
    const clientesMes = await this.prisma.customer.count({
      where: {
        createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
      },
    });
    
    // 3. Volume de OS
    const osMes = await this.prisma.workOrder.count({
      where: {
        entryDate: { gte: currentMonthStart, lte: currentMonthEnd },
      }
    });

    // 4. Ticket Médio
    const ticketMedio = currentFaturamento._count.id > 0 
      ? faturamentoMensal / currentFaturamento._count.id 
      : 0;

    // 5. Distribuição de Status
    const statusCounts = await this.prisma.workOrder.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Mapear para o formato que o gráfico espera
    const chartData = statusCounts.map(item => ({
      status: item.status,
      count: item._count.id,
      color: this.getStatusColor(item.status),
    }));

    // 6. OS Urgentes (Top 4)
    const osUrgentes = await this.prisma.workOrder.findMany({
      where: { priority: 'HIGH' },
      take: 4,
      orderBy: { entryDate: 'desc' },
      include: { customer: true }
    });

    // 7. OS Normais (Top 4)
    const osNormais = await this.prisma.workOrder.findMany({
      where: { priority: 'NORMAL' },
      take: 4,
      orderBy: { entryDate: 'desc' },
      include: { customer: true }
    });

    return {
      faturamentoMensal,
      faturamentoVariacao,
      totalConcluido: totalConcluido._sum.totalValue || 0,
      clientesMes,
      osMes,
      ticketMedio,
      chartData,
      osUrgentes: osUrgentes.map(os => ({
        id: os.id,
        cliente: os.customer.name,
        status: os.status,
        prazo: os.deadline ? os.deadline.toLocaleDateString() : 'Sem prazo'
      })),
      osNormais: osNormais.map(os => ({
        id: os.id,
        cliente: os.customer.name,
        status: os.status,
        prazo: os.deadline ? os.deadline.toLocaleDateString() : 'Sem prazo'
      }))
    };
  }

  private getStatusColor(status: string) {
    const colors: Record<string, string> = {
      ENTRADA: '#38bdf8',
      ORCAMENTO: '#fbbf24',
      ABERTO: '#f97316',
      ANDAMENTO: '#0ea5e9',
      CONCLUIDO: '#10b981',
      FATURADO: '#9ef01a',
      CANCELADO: '#ef4444',
    };
    return colors[status] || '#a1a1aa';
  }
}
