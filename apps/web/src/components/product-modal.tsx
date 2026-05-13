'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { 
  Package, 
  Tag, 
  DollarSign, 
  Loader2, 
  Save,
  Boxes
} from 'lucide-react';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

const productSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  price: z.coerce.number().min(0, 'O preço deve ser positivo'),
  costPrice: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().min(0).default(0),
  minStock: z.coerce.number().min(0).default(0),
  location: z.string().optional().nullable(),
  supplierName: z.string().optional().nullable(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  product?: any;
  onSuccess: () => void;
  trigger?: React.ReactElement;
}

export function ProductModal({ product, onSuccess, trigger }: ProductModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      costPrice: null as number | null,
      stock: 0,
      minStock: 0,
      location: '',
      supplierName: '',
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        price: product.price,
        costPrice: product.costPrice,
        stock: product.stock,
        minStock: product.minStock || 0,
        location: product.location || '',
        supplierName: product.supplierName || '',
      });
    } else {
      reset({
        name: '',
        price: 0,
        costPrice: null,
        stock: 0,
        minStock: 0,
        location: '',
        supplierName: '',
      });
    }
  }, [product, reset, open]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setError(null);
    try {
      if (isEditing) {
        await api.patch(`/products/${product.id}`, data);
      } else {
        await api.post('/products', data);
      }
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || <Button>Gerenciar Produto</Button>} />
      <DialogContent className="sm:max-w-[425px] border-border bg-card p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 bg-surface/50 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Package size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground uppercase tracking-tighter">
                {isEditing ? 'Editar Peça' : 'Nova Peça / Item'}
              </DialogTitle>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Gestão de Peças e componentes</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-[10px] uppercase font-black tracking-widest leading-none">Nome do Produto</Label>
            <Input {...register('name')} placeholder="Ex: Capacitor 10uF, Tela iPhone 11..." />
            {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.name.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-black tracking-widest leading-none">Preço de Venda (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                <Input type="number" step="0.01" className="pl-8" {...register('price')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-black tracking-widest leading-none">Preço de Custo (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
                <Input type="number" step="0.01" className="pl-8" {...register('costPrice')} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-black tracking-widest leading-none">Estoque Atual</Label>
              <Input type="number" {...register('stock')} />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-black tracking-widest leading-none">Estoque Mínimo</Label>
              <Input type="number" {...register('minStock')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-black tracking-widest leading-none">Localização (Prateleira/Gaveta)</Label>
              <Input {...register('location')} placeholder="Ex: A1-05" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[10px] uppercase font-black tracking-widest leading-none">Fornecedor</Label>
              <Input 
                {...register('supplierName')} 
                placeholder="Ex: Distribuidora XYZ" 
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center bg-red-500/10 py-3 rounded-lg border border-red-500/20 font-bold">{error}</p>}

          <DialogFooter className="pt-4 border-t border-border">
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-tighter h-11">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save className="mr-2" size={18} />}
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Peça'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
