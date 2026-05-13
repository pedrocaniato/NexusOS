import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

export interface AnalyticsData {
  faturamentoMensal: number;
  faturamentoVariacao: number;
  totalConcluido: number;
  clientesMes: number;
  osMes: number;
  ticketMedio: number;
  chartData: {
    status: string;
    count: number;
    color: string;
  }[];
  osUrgentes: {
    id: number;
    cliente: string;
    status: string;
    prazo: string;
  }[];
  osNormais: {
    id: number;
    cliente: string;
    status: string;
    prazo: string;
  }[];
}

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await api.get("/analytics");
      return response.data;
    },
    refetchInterval: 1000 * 60 * 2, // Refetch a cada 2 minutos
  });
}
