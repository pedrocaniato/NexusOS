'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Loader2, 
  Edit, 
  Monitor, 
  Hash, 
  Calendar, 
  AlertCircle, 
  FileText, 
  Globe, 
  ShieldCheck, 
  FileSignature, 
  Clock, 
  UserCircle 
} from 'lucide-react';
import api from '@/services/api';
import { OSStepper } from './os-stepper';
import { ComboboxCustomer } from './combobox-customer';

const workOrderSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  equipment: z.string().min(2, 'Equipamento é obrigatório'),
  brandModel: z.string().min(2, 'Marca/Modelo é obrigatório'),
  serialNumber: z.string().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']),
  status: z.string().default('ENTRADA'),
  entryDate: z.string(),
  deadline: z.string().optional().or(z.literal('')),
  clientReport: z.string().optional().or(z.literal('')),
  observations: z.string().optional().or(z.literal('')),
  origin: z.string().optional(),
  warranty: z.string().optional(),
  terms: z.string().optional(),
  situation: z.string().optional(),
  attendant: z.string().optional(),
  employeeId: z.string().optional().or(z.literal('')),
});

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

interface WorkOrderModalProps {
  onSuccess: () => void;
  initialData?: any;
}

export function WorkOrderModal({ onSuccess, initialData }: WorkOrderModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<{ id: number, name: string }[]>([]);

  const isEditing = !!initialData;

  const today = new Date().toISOString().split('T')[0];
  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 7);
  const deadlineStr = defaultDeadline.toISOString().split('T')[0];

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      customerId: '',
      equipment: '',
      brandModel: '',
      priority: 'NORMAL',
      status: 'ENTRADA',
      entryDate: today,
      origin: 'Internet',
      situation: 'Pendente',
      terms: 'Termo de Entrada',
      warranty: 'Sem Garantia',
      serialNumber: '',
      clientReport: '',
      observations: '',
      deadline: deadlineStr,
      attendant: '',
      employeeId: '',
    }
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/employees');
        setEmployees(response.data);
      } catch (err) {
        console.error('Erro ao carregar funcionários:', err);
      }
    };
    fetchEmployees();
  }, []);

  const entryDateWatch = watch('entryDate');

  useEffect(() => {
    if (open && !isEditing && entryDateWatch) {
      const date = new Date(entryDateWatch);
      date.setDate(date.getDate() + 7);
      setValue('deadline', date.toISOString().split('T')[0]);
    }
  }, [entryDateWatch, isEditing, setValue, open]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        Object.keys(initialData).forEach((key) => {
          let value = initialData[key];
          if (value === null || value === undefined) value = '';
          if ((key === 'deadline' || key === 'entryDate') && value) {
            value = new Date(value).toISOString().split('T')[0];
          }
          if (key === 'employeeId' && value) {
            value = value.toString();
          }
          setValue(key as any, value);
        });
      } else {
        reset({
          customerId: '',
          equipment: '',
          brandModel: '',
          serialNumber: '',
          priority: 'NORMAL',
          status: 'ENTRADA',
          entryDate: today,
          deadline: deadlineStr,
          clientReport: '',
          observations: '',
          origin: 'Internet',
          situation: 'Pendente',
          terms: 'Termo de Entrada',
          warranty: 'Sem Garantia',
          attendant: 'Atendente Balcão',
          employeeId: '',
        });
      }
    }
  }, [open, initialData, setValue, reset, today]);

  const onSubmit = async (data: WorkOrderFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const formattedData = {
        ...data,
        entryDate: new Date(data.entryDate).toISOString(),
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
        employeeId: data.employeeId ? parseInt(data.employeeId, 10) : null
      };

      if (isEditing) {
        await api.patch(`/work-orders/${initialData.id}`, formattedData);
      } else {
        await api.post('/work-orders', formattedData);
      }
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar ordem de serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEditing ? (
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
              <Edit size={14} />
              Editar
            </Button>
          ) : (
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
              <Plus size={18} />
              Abertura de OS
            </Button>
          )
        }
      />
      <DialogContent className="bg-card border-border text-foreground sm:max-w-[850px] max-h-[95vh] overflow-y-auto scrollbar-hide">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">
            {isEditing ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
          </DialogTitle>
          {!isEditing && <OSStepper currentStatus="ENTRADA" />}
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pt-6">
          {/* SEÇÃO 1: CLIENTE */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
              <UserCircle size={14} /> Dados do Cliente
            </h3>
            <div className="space-y-2">
              <ComboboxCustomer 
                selectedId={initialData?.customerId}
                onSelect={(customer) => setValue('customerId', customer?.id || '')} 
              />
              {errors.customerId && <p className="text-xs text-red-500">{errors.customerId.message}</p>}
            </div>
          </div>

          {/* SEÇÃO 2: EQUIPAMENTO */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
              <Monitor size={14} /> Equipamento & Identificação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipment" className="text-muted-foreground text-[10px] uppercase font-bold">Equipamento</Label>
                <Input id="equipment" {...register('equipment')} className="h-10" placeholder="Ex: Notebook" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandModel" className="text-muted-foreground text-[10px] uppercase font-bold">Marca / Modelo</Label>
                <Input id="brandModel" {...register('brandModel')} className="h-10" placeholder="Ex: Dell Inspiron" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber" className="text-muted-foreground text-[10px] uppercase font-bold">Serial / IMEI</Label>
                <Input id="serialNumber" {...register('serialNumber')} className="h-10" placeholder="Nº de Série" />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: ORIGEM E GARANTIA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-bold flex items-center gap-1">
                <Globe size={12} /> Origem
              </Label>
              <Controller
                name="origin"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Google ADS">Google ADS</SelectItem>
                      <SelectItem value="Indicação">Indicação</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Passou na Frente">Passou na Frente</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-bold flex items-center gap-1">
                <ShieldCheck size={12} /> Garantia
              </Label>
              <Controller
                name="warranty"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="Sem Garantia">Sem Garantia</SelectItem>
                      <SelectItem value="Garantia de Loja (90 dias)">Garantia de Loja (90 dias)</SelectItem>
                      <SelectItem value="Garantia Fabricante">Garantia Fabricante</SelectItem>
                      <SelectItem value="Retorno de Garantia">Retorno de Garantia</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-bold flex items-center gap-1">
                <FileSignature size={12} /> Termos
              </Label>
              <Controller
                name="terms"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="Termo de Entrada">Termo de Entrada</SelectItem>
                      <SelectItem value="Termo de Garantia">Termo de Garantia</SelectItem>
                      <SelectItem value="Orçamento Prévio">Orçamento Prévio</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* SEÇÃO 4: SITUAÇÃO E DATAS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-bold">Situação</Label>
              <Controller
                name="situation"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="shadow-lg shadow-primary/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                      <SelectItem value="Aguardando Peça">Aguardando Peça</SelectItem>
                      <SelectItem value="Prioridade">Prioridade</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-bold">Status Atual</Label>
              <Input value="ENTRADA" disabled className="bg-surface-inset/50 border-primary/20 text-primary font-black uppercase text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-bold flex items-center gap-1">
                <Calendar size={12} /> Data Entrada
              </Label>
              <Input type="date" {...register('entryDate')} className="h-10 dark:[color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-bold flex items-center gap-1">
                <Clock size={12} /> Prazo Estimado
              </Label>
              <Input type="date" {...register('deadline')} className="h-10 dark:[color-scheme:dark]" />
            </div>
          </div>

          {/* SEÇÃO 5: ATENDENTE E PRIORIDADE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-bold flex items-center gap-1">
                <UserCircle size={12} /> Atendente
              </Label>
              <Input {...register('attendant')} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-bold flex items-center gap-1">
                <AlertCircle size={12} /> Prioridade
              </Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">Alta / Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-bold flex items-center gap-1">
                <UserCircle size={12} /> Técnico Responsável
              </Label>
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um técnico" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="">Nenhum</SelectItem>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* SEÇÃO 6: TEXTOS LARGOS */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-bold flex items-center gap-1">
                <FileText size={12} /> Defeito Relatado / Acessórios
              </Label>
              <Textarea 
                {...register('clientReport')} 
                placeholder="Ex: Não liga, acompanha carregador e capa..."
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-bold flex items-center gap-1">
                <AlertCircle size={12} /> Observações Internas (Não sai no termo)
              </Label>
              <Textarea 
                {...register('observations')} 
                placeholder="Ex: Equipamento com muitos riscos na carcaça..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center bg-red-500/10 py-2 rounded">{error}</p>}

          <DialogFooter className="border-t border-border pt-6">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="px-10 bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-tighter">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando OS...
                </>
              ) : isEditing ? 'Salvar Alterações' : 'Finalizar e Abrir OS'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
