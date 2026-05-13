'use client';

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
import { Plus, Loader2, Edit, UserCircle, CreditCard, Phone, Percent } from 'lucide-react';
import api from '@/services/api';

const employeeSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(14, 'CPF inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  commissionRate: z.number().min(0).max(100, 'A comissão deve ser entre 0 e 100'),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeModalProps {
  onSuccess: () => void;
  initialData?: any;
}

export function EmployeeModal({ onSuccess, initialData }: EmployeeModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      cpf: '',
      phone: '',
      commissionRate: 0,
    }
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValue('name', initialData.name);
        setValue('cpf', initialData.cpf);
        setValue('phone', initialData.phone);
        setValue('commissionRate', initialData.commissionRate);
      } else {
        reset({
          name: '',
          cpf: '',
          phone: '',
          commissionRate: 0,
        });
      }
      setError(null);
    }
  }, [open, initialData, setValue, reset]);

  const onSubmit = async (data: EmployeeFormValues) => {
    setLoading(true);
    setError(null);
    try {
      if (isEditing) {
        await api.patch(`/employees/${initialData.id}`, data);
      } else {
        await api.post('/employees', data);
      }
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar funcionário');
    } finally {
      setLoading(false);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setValue('cpf', value, { shouldValidate: true });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    setValue('phone', value, { shouldValidate: true });
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
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-[0_0_15px_rgba(158,240,26,0.3)]">
              <Plus size={18} />
              Novo Funcionário
            </Button>
          )
        }
      />
      <DialogContent className="bg-card border-border text-foreground sm:max-w-[500px]">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-xl font-bold uppercase tracking-tighter text-foreground">
            {isEditing ? 'Editar Funcionário' : 'Cadastrar Funcionário'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <UserCircle size={14} /> Nome Completo
              </Label>
              <Input 
                id="name" 
                {...register('name')} 
                className="h-10" 
                placeholder="Ex: João Silva" 
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-muted-foreground flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <CreditCard size={14} /> CPF
                </Label>
                <Input 
                  id="cpf" 
                  {...register('cpf')} 
                  onChange={handleCpfChange}
                  className="h-10" 
                  placeholder="000.000.000-00" 
                  maxLength={14}
                />
                {errors.cpf && <p className="text-xs text-red-500">{errors.cpf.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-muted-foreground flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Phone size={14} /> Telefone
                </Label>
                <Input 
                  id="phone" 
                  {...register('phone')} 
                  onChange={handlePhoneChange}
                  className="h-10" 
                  placeholder="(00) 00000-0000" 
                  maxLength={15}
                />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionRate" className="text-muted-foreground flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <Percent size={14} /> Comissão (%)
              </Label>
              <Input 
                id="commissionRate" 
                type="number" 
                step="0.01"
                {...register('commissionRate', { valueAsNumber: true })} 
                className="h-10" 
                placeholder="10.00" 
              />
              {errors.commissionRate && <p className="text-xs text-red-500">{errors.commissionRate.message}</p>}
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center bg-red-500/10 py-2 rounded font-medium">{error}</p>}

          <DialogFooter className="border-t border-border pt-6">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-tighter px-8">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
