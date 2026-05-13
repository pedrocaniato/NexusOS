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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, Edit, Search, Calendar, User, Lock, FileText } from 'lucide-react';
import api from '@/services/api';

const PERSON_TYPES = [
  { value: 'FISICA', label: 'Pessoa Física' },
  { value: 'JURIDICA', label: 'Pessoa Jurídica' },
] as const;

const CONTACT_TYPES = [
  { value: 'CLIENTE', label: 'Cliente' },
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'PARCEIRO', label: 'Parceiro' },
  { value: 'FORNECEDOR', label: 'Fornecedor' },
  { value: 'GARANTIA', label: 'Garantia' },
  { value: 'FABRICANTE', label: 'Fabricante' },
  { value: 'REMOTO', label: 'Remoto' },
  { value: 'VISITA', label: 'Visita' },
] as const;

const customerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  personType: z.enum(['FISICA', 'JURIDICA']),
  contactType: z.enum(['CLIENTE', 'CONTRATO', 'PARCEIRO', 'FORNECEDOR', 'GARANTIA', 'FABRICANTE', 'REMOTO', 'VISITA']),
  document: z.string().min(11, 'Documento inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  birthDate: z.string().optional().or(z.literal('')),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  origin: z.string().optional(),
  responsibleName: z.string().optional().or(z.literal('')),
  devicePassword: z.string().optional().or(z.literal('')),
  observations: z.string().optional().or(z.literal('')),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerModalProps {
  onSuccess: () => void;
  initialData?: any; // Dados para edição
}

export function CustomerModal({ onSuccess, initialData }: CustomerModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      personType: 'FISICA',
      contactType: 'CLIENTE',
      origin: 'Internet'
    }
  });

  const currentPersonType = watch('personType');
  const currentContactType = watch('contactType');

  // Atualiza o formulário quando o modal abre ou initialData muda
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Preenche com dados existentes (Edição)
        Object.keys(initialData).forEach((key) => {
          let value = initialData[key] || '';
          
          // Trata a data para o input HTML (YYYY-MM-DD)
          if (key === 'birthDate' && value) {
            value = new Date(value).toISOString().split('T')[0];
          }
          
          setValue(key as any, value);
        });
      } else {
        // Limpa para novo cadastro
        reset({
          name: '',
          personType: 'FISICA',
          contactType: 'CLIENTE',
          document: '',
          email: '',
          phone: '',
          birthDate: '',
          zipCode: '',
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          origin: 'Internet',
          responsibleName: '',
          devicePassword: '',
          observations: '',
        });
      }
    }
  }, [open, initialData, setValue, reset]);

  const handleCnpjBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cnpj = e.target.value.replace(/\D/g, '');
    if (cnpj.length === 14) {
      setIsFetching(true);
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        if (!response.ok) throw new Error('CNPJ não encontrado');
        
        const data = await response.json();
        
        setValue('name', data.razao_social || data.nome_fantasia || '');
        setValue('zipCode', data.cep || '');
        setValue('street', data.logradouro || '');
        setValue('number', data.numero || '');
        setValue('neighborhood', data.bairro || '');
        setValue('city', data.municipio || '');
        setValue('state', data.uf || '');
        
        if (data.email) setValue('email', data.email);
        if (data.telefone) setValue('phone', data.telefone);
        
      } catch (err) {
        console.error('Erro ao buscar CNPJ:', err);
      } finally {
        setIsFetching(false);
      }
    }
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      setIsFetching(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setValue('street', data.logradouro);
          setValue('neighborhood', data.bairro);
          setValue('city', data.localidade);
          setValue('state', data.uf);
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      } finally {
        setIsFetching(false);
      }
    }
  };

  const onSubmit = async (data: CustomerFormValues) => {
    setLoading(true);
    setError(null);
    try {
      // Converte data de nascimento para ISO antes de enviar se preenchida
      const formattedData = {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : null
      };

      if (isEditing) {
        await api.patch(`/customers/${initialData.id}`, formattedData);
      } else {
        await api.post('/customers', formattedData);
      }
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao salvar cadastro';
      setError(message);
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
            <Button className="gap-2">
              <Plus size={18} />
              Novo Cadastro
            </Button>
          )
        }
      />
      <DialogContent className="bg-card border-border text-foreground sm:max-w-[700px] max-h-[95vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? 'Editar Cadastro' : 'Cadastrar Pessoa / Contato'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* ─── TIPO DE PESSOA ─────────────────────────────────── */}
          <div className="space-y-3">
            <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Pessoa</Label>
            <div className="flex gap-2">
              {PERSON_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setValue('personType', pt.value)}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-tight border transition-all duration-200 ${
                    currentPersonType === pt.value
                      ? 'bg-primary/10 border-primary text-primary shadow-[0_0_12px_rgba(158,240,26,0.15)]'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── TIPO DE CONTATO ────────────────────────────────── */}
          <div className="space-y-3">
            <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Tipo</Label>
            <div className="grid grid-cols-4 gap-2">
              {CONTACT_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setValue('contactType', ct.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-tight border transition-all duration-200 ${
                    currentContactType === ct.value
                      ? 'bg-primary/10 border-primary text-primary shadow-[0_0_12px_rgba(158,240,26,0.15)]'
                      : 'bg-surface-inset border-border text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name" className="text-muted-foreground flex items-center justify-between">
                Nome Completo / Razão Social
                {isFetching && <Loader2 size={14} className="animate-spin text-primary" />}
              </Label>
              <Input id="name" {...register('name')} disabled={isFetching} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document" className="text-muted-foreground flex items-center justify-between">
                CPF/CNPJ
                {isFetching && <Search size={14} className="animate-pulse text-primary" />}
              </Label>
              <Input 
                id="document" 
                {...register('document')} 
                onBlur={handleCnpjBlur}
                className="" 
                placeholder="00.000.000/0000-00" 
              />
              {errors.document && <p className="text-xs text-red-500">{errors.document.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin" className="text-muted-foreground">Como nos conheceu?</Label>
              <Controller
                name="origin"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="Internet">Internet</SelectItem>
                      <SelectItem value="Indicação">Indicação</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Google ADS">Google ADS</SelectItem>
                      <SelectItem value="Facebook ADS">Facebook ADS</SelectItem>
                      <SelectItem value="Passou na frente">Passou na frente</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">E-mail</Label>
              <Input id="email" type="email" {...register('email')} disabled={isFetching} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-muted-foreground">Telefone / WhatsApp</Label>
              <Input id="phone" {...register('phone')} disabled={isFetching} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-muted-foreground flex items-center gap-2">
                <Calendar size={14} />
                Data de Nascimento
              </Label>
              <Input 
                id="birthDate" 
                type="date" 
                {...register('birthDate')} 
                className="dark:[color-scheme:dark]" 
                disabled={isFetching} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibleName" className="text-muted-foreground flex items-center gap-2">
                <User size={14} />
                Pessoa de Contato / Responsável
              </Label>
              <Input id="responsibleName" {...register('responsibleName')} disabled={isFetching} placeholder="Ex: João Silva" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="devicePassword" className="text-muted-foreground flex items-center gap-2">
                <Lock size={14} />
                Senha dos Dispositivos
              </Label>
              <Input id="devicePassword" {...register('devicePassword')} disabled={isFetching} placeholder="Ex: 1234, admin, senha123" />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wider">Endereço</h3>
            
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="zipCode" className="text-muted-foreground">CEP</Label>
                <Input 
                  id="zipCode" 
                  {...register('zipCode')} 
                  onBlur={handleCepBlur}
                  className="" 
                  placeholder="00000-000"
                  disabled={isFetching}
                />
              </div>

              <div className="col-span-4 space-y-2">
                <Label htmlFor="street" className="text-muted-foreground">Logradouro</Label>
                <Input id="street" {...register('street')} disabled={isFetching} />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="number" className="text-muted-foreground">Nº</Label>
                <Input id="number" {...register('number')} disabled={isFetching} />
              </div>

              <div className="col-span-4 space-y-2">
                <Label htmlFor="complement" className="text-muted-foreground">Complemento</Label>
                <Input id="complement" {...register('complement')} placeholder="Ex: Ap 42, Bloco B" disabled={isFetching} />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="neighborhood" className="text-muted-foreground">Bairro</Label>
                <Input id="neighborhood" {...register('neighborhood')} disabled={isFetching} />
              </div>

              <div className="col-span-3 space-y-2">
                <Label htmlFor="city" className="text-muted-foreground">Cidade</Label>
                <Input id="city" {...register('city')} disabled={isFetching} />
              </div>

              <div className="col-span-1 space-y-2">
                <Label htmlFor="state" className="text-muted-foreground">UF</Label>
                <Input id="state" {...register('state')} disabled={isFetching} maxLength={2} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations" className="text-muted-foreground flex items-center gap-2">
              <FileText size={14} />
              Observações Gerais
            </Label>
            <Textarea 
              id="observations" 
              {...register('observations')} 
              className="min-h-[100px]" 
              disabled={isFetching} 
              placeholder="Notas internas, preferências, detalhes específicos..."
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center bg-red-500/10 py-2 rounded">{error}</p>}

          <DialogFooter className="mt-8 border-t border-border pt-6">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || isFetching} className="px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? 'Salvar Alterações' : 'Finalizar Cadastro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
