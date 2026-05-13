'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  Monitor, 
  Calendar, 
  AlertCircle, 
  ClipboardCheck,
  Save,
  CheckCircle2,
  PlayCircle,
  FileText,
  Printer,
  DollarSign
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { WorkOrderPdf } from '@/components/pdf/work-order-pdf';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import api from '@/services/api';
import { OSStepper } from '@/components/os-stepper';
import { WorkOrderItemsList } from '@/components/work-order-items-list';
import { toast } from 'sonner';

const statusMap: Record<string, { label: string, variant: any }> = {
  ENTRADA: { label: 'Entrada', variant: 'info' },
  ORCAMENTO: { label: 'Em Orçamento', variant: 'warning' },
  ABERTO: { label: 'Aberto', variant: 'default' },
  ANDAMENTO: { label: 'Em Execução', variant: 'info' },
  CONCLUIDO: { label: 'Concluído', variant: 'success' },
  FATURADO: { label: 'Faturado', variant: 'secondary' },
  CANCELADO: { label: 'Cancelado', variant: 'destructive' },
};

export default function WorkOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [os, setOs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [technicalAnalysis, setTechnicalAnalysis] = useState('');

  const fetchOS = async () => {
    try {
      const response = await api.get(`/work-orders/${id}`);
      setOs(response.data);
      setTechnicalAnalysis(response.data.technicalAnalysis || '');
    } catch (err) {
      console.error('Erro ao buscar OS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOS();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setSaving(true);
    try {
      await api.patch(`/work-orders/${id}`, { status: newStatus });
      await fetchOS();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    } finally {
      setSaving(false);
    }
  };

  const saveTechnicalAnalysis = async () => {
    setSaving(true);
    try {
      await api.patch(`/work-orders/${id}`, { technicalAnalysis });
      toast.success('Laudo técnico salvo com sucesso!');
      await fetchOS();
    } catch (err) {
      console.error('Erro ao salvar laudo:', err);
      toast.error('Erro ao salvar laudo técnico.');
    } finally {
      setSaving(false);
    }
  };

  const handleInvoice = async () => {
    setSaving(true);
    try {
      await api.patch(`/work-orders/${id}/invoice`);
      toast.success('Ordem de Serviço faturada!', {
        description: 'Registro financeiro criado com sucesso.',
      });
      await fetchOS();
    } catch (err) {
      console.error('Erro ao faturar OS:', err);
      toast.error('Não foi possível faturar a OS.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      toast.info('Gerando Ordem de Serviço premium...', {
        description: 'Aguarde um momento enquanto preparamos seu PDF.',
      });
      
      const blob = await pdf(<WorkOrderPdf os={os} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NexusOS_OS_${os.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF gerado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      toast.error('Erro ao gerar PDF da Ordem de Serviço.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-zinc-500 animate-pulse text-sm uppercase tracking-widest">Carregando Detalhes da OS...</p>
      </div>
    );
  }

  if (!os) return <div>OS não encontrada</div>;

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header com Navegação e Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="text-zinc-500 hover:text-white border border-zinc-800"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">OS #{os.id.toString().padStart(4, '0')}</h1>
              <Badge variant={statusMap[os.status]?.variant} className="text-sm px-3 border-2">
                {statusMap[os.status]?.label}
              </Badge>
            </div>
            <p className="text-zinc-500 font-medium">Abertura: {new Date(os.entryDate).toLocaleDateString()} às {new Date(os.entryDate).toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {os.status === 'ENTRADA' && (
            <Button onClick={() => updateStatus('ORCAMENTO')} className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold gap-2">
              <ClipboardCheck size={18} />
              Iniciar Orçamento
            </Button>
          )}
          {os.status === 'ORCAMENTO' && (
            <Button onClick={() => updateStatus('ABERTO')} className="bg-blue-600 text-white hover:bg-blue-500 font-bold gap-2">
              <PlayCircle size={18} />
              Aprovar Execução
            </Button>
          )}
          {os.status === 'ABERTO' && (
            <Button onClick={() => updateStatus('ANDAMENTO')} className="bg-blue-600 text-white hover:bg-blue-500 font-bold gap-2">
              <PlayCircle size={18} />
              Iniciar Serviço
            </Button>
          )}
          {os.status === 'ANDAMENTO' && (
            <Button onClick={() => updateStatus('CONCLUIDO')} className="bg-emerald-600 text-white hover:bg-emerald-500 font-bold gap-2">
              <CheckCircle2 size={18} />
              Concluir Serviço
            </Button>
          )}
          {os.status === 'CONCLUIDO' && (
            <Button 
              onClick={handleInvoice} 
              disabled={saving}
              className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <DollarSign size={18} />}
              Faturar OS
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleDownloadPdf} 
            className="border-zinc-700 text-zinc-300 hover:text-white gap-2"
          >
            <Printer size={18} />
            Imprimir OS
          </Button>
        </div>
      </div>

      <OSStepper currentStatus={os.status} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Info Cliente e Equipamento */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-zinc-950 border-zinc-800 p-6 space-y-6 shadow-2xl">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <User size={14} className="text-primary" /> Cliente
              </h3>
              <div>
                <p className="text-xl font-bold text-white leading-tight">{os.customer.name}</p>
                <p className="text-sm text-zinc-500 font-mono mt-1">{os.customer.document}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-800/50">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Monitor size={14} className="text-primary" /> Equipamento
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-600 uppercase font-bold block mb-1">Aparelho / Marca</label>
                  <p className="text-zinc-200 font-medium">{os.equipment} - {os.brandModel}</p>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-600 uppercase font-bold block mb-1">Nº de Série</label>
                  <p className="text-zinc-400 font-mono text-sm">{os.serialNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-600 uppercase font-bold block mb-1">Relato do Cliente</label>
                  <p className="text-sm text-zinc-300 italic bg-black/40 p-4 rounded-lg border-l-2 border-primary mt-1 leading-relaxed">
                    "{os.clientReport}"
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-800/50">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <AlertCircle size={14} className="text-primary" /> Detalhes
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-3 rounded-lg border border-zinc-800/50">
                  <label className="text-[10px] text-zinc-600 uppercase font-bold block mb-2">Prioridade</label>
                  <Badge variant={os.priority === 'HIGH' ? 'destructive' : 'outline'} className="w-full justify-center">
                    {os.priority}
                  </Badge>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-zinc-800/50">
                  <label className="text-[10px] text-zinc-600 uppercase font-bold block mb-2">Prazo</label>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Calendar size={14} className="text-zinc-500" />
                    <span className="text-sm font-medium">{os.deadline ? new Date(os.deadline).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Lado Direito: Itens e Laudo */}
        <div className="lg:col-span-2 space-y-8">
          {/* Seção de Laudo Técnico */}
          <Card className="bg-zinc-950 border-zinc-800 p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] flex items-center gap-2">
                <ClipboardCheck size={16} className="text-primary" /> Laudo Técnico / Diagnóstico
              </h3>
              {os.status !== 'ENTRADA' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={saveTechnicalAnalysis}
                  disabled={saving}
                  className="gap-2 border-primary/20 text-primary hover:bg-primary hover:text-zinc-950 transition-all font-bold"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Salvar Laudo
                </Button>
              )}
            </div>
            
            {os.status === 'ENTRADA' ? (
              <div className="bg-black/40 p-8 rounded-xl text-center border border-dashed border-zinc-800">
                <p className="text-zinc-500 text-sm font-medium">O laudo técnico fica disponível após o início do orçamento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea 
                  placeholder="Descreva aqui o diagnóstico técnico, peças necessárias e solução proposta..."
                  value={technicalAnalysis}
                  onChange={(e) => setTechnicalAnalysis(e.target.value)}
                  className="min-h-[150px] focus-visible:ring-primary/20"
                />
              </div>
            )}
          </Card>

          {/* Seção de Itens e Orçamento */}
          <Card className="bg-zinc-950 border-zinc-800 p-6 space-y-6 shadow-2xl">
            <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] flex items-center gap-2">
              <FileText size={16} className="text-primary" /> Itens e Serviços (Orçamento)
            </h3>
            {os.status === 'ENTRADA' ? (
              <div className="bg-black/40 p-8 rounded-xl text-center border border-dashed border-zinc-800">
                <p className="text-zinc-500 text-sm font-medium">Inicie o orçamento para adicionar peças e mão de obra.</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 text-primary hover:text-primary hover:bg-primary/10 font-bold"
                  onClick={() => updateStatus('ORCAMENTO')}
                >
                  Clicar aqui para iniciar
                </Button>
              </div>
            ) : (
              <WorkOrderItemsList 
                workOrderId={os.id} 
                products={os.products} 
                services={os.services} 
                onUpdate={fetchOS} 
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
