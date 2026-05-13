import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Pencil } from 'lucide-react';
import api from '@/services/api';

const equipmentSchema = z.object({
  brandModel: z.string().min(2, 'Marca/Modelo é obrigatório'),
  serialNumber: z.string().optional().or(z.literal('')),
  observations: z.string().optional().or(z.literal('')),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

interface EquipmentEditModalProps {
  equipmentId: string;
  onSuccess: () => void;
}

export function EquipmentEditModal({ equipmentId, onSuccess }: EquipmentEditModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
  });

  useEffect(() => {
    if (open) {
      setFetching(true);
      api.get(`/equipments/${equipmentId}`)
        .then((response) => {
          reset({
            brandModel: response.data.brandModel || '',
            serialNumber: response.data.serialNumber || '',
            observations: response.data.observations || '',
          });
        })
        .catch(() => setError('Erro ao buscar dados do equipamento'))
        .finally(() => setFetching(false));
    }
  }, [open, equipmentId, reset]);

  const onSubmit = async (data: EquipmentFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/equipments/${equipmentId}`, data);
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar alterações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" title="Editar" />}>
        <Pencil size={16} />
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-[500px]">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-xl font-bold">Editar Equipamento</DialogTitle>
        </DialogHeader>
        
        {fetching ? (
          <div className="py-10 flex justify-center text-muted-foreground"><Loader2 className="animate-spin" /></div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brandModel" className="text-muted-foreground text-xs font-bold uppercase">Marca / Modelo</Label>
                <Input id="brandModel" {...register('brandModel')} className="h-10" />
                {errors.brandModel && <p className="text-xs text-red-500">{errors.brandModel.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber" className="text-muted-foreground text-xs font-bold uppercase">Número de Série / IMEI</Label>
                <Input id="serialNumber" {...register('serialNumber')} className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observations" className="text-muted-foreground text-xs font-bold uppercase">Observações Técnicas</Label>
                <Textarea 
                  id="observations" 
                  {...register('observations')} 
                  placeholder="Ex: Tela riscada, equipamento já aberto antes..."
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500 text-center bg-red-500/10 py-2 rounded">{error}</p>}

            <DialogFooter className="border-t border-border pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
