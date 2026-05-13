'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Loader2, 
  Wrench, 
  Trash2,
  Edit2,
  Save,
  DollarSign,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import api from '@/services/api';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error('Erro ao buscar serviços:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Serviços & Mão de Obra</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mt-1">Catálogo de serviços técnicos</p>
        </div>
        <ServiceModal onSuccess={fetchServices} trigger={
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-tighter h-11 px-6 shadow-[0_0_20px_rgba(158,240,26,0.2)]">
            <Plus className="mr-2" size={20} />
            Novo Serviço
          </Button>
        } />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 bg-surface-inset border-border relative flex items-center">
          <Input 
            placeholder="Buscar por nome do serviço ou descrição..." 
            className="border-none bg-transparent focus-visible:ring-0 text-lg h-12 pl-4 pr-12 w-full text-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="text-muted-foreground absolute right-4 pointer-events-none" size={20} />
        </Card>
        <Card className="bg-card border-border p-4 flex flex-col justify-center">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Total de Serviços</p>
          <p className="text-2xl font-black text-foreground">{services.length}</p>
        </Card>
      </div>

      <Card className="bg-card border-border overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Sincronizando Catálogo...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-black uppercase tracking-widest text-[10px] w-[60px]">Nº</TableHead>
                <TableHead className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Nome do Serviço</TableHead>
                <TableHead className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Preço</TableHead>
                <TableHead className="text-muted-foreground font-black uppercase tracking-widest text-[10px] text-center">Descrição</TableHead>
                <TableHead className="text-right text-muted-foreground font-black uppercase tracking-widest text-[10px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-bold uppercase tracking-widest text-xs">
                    Nenhum serviço cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((s, index) => (
                  <TableRow key={s.id} className="border-border hover:bg-muted/30 transition-colors group">
                    <TableCell className="font-mono text-muted-foreground text-[10px] font-bold">
                      {(index + 1).toString().padStart(2, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                          <Wrench size={14} />
                        </div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">{s.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-foreground whitespace-nowrap">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.price)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs text-center max-w-xs truncate">
                      {s.description || '---'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ServiceModal service={s} onSuccess={fetchServices} trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors">
                            <Edit2 size={16} />
                          </Button>
                        } />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 transition-colors" onClick={() => handleDelete(s.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function ServiceModal({ service, onSuccess, trigger }: { service?: any, onSuccess: () => void, trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: service?.name || '',
    price: service?.price || 0,
    description: service?.description || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (service) {
        await api.patch(`/services/${service.id}`, formData);
      } else {
        await api.post('/services', formData);
      }
      setOpen(false);
      onSuccess();
    } catch (err) {
      console.error('Erro ao salvar serviço:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-[425px] border-border bg-card p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 bg-surface-inset border-b border-border">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
               <Wrench size={20} />
             </div>
             <div>
               <DialogTitle className="text-xl font-black text-foreground uppercase tracking-tighter">
                 {service ? 'Editar Serviço' : 'Novo Serviço'}
               </DialogTitle>
               <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Catálogo de Mão de Obra</p>
             </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-[10px] uppercase font-black tracking-widest leading-none">Nome do Serviço</Label>
            <Input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="Ex: Formatação, Troca de Tela..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-[10px] uppercase font-black tracking-widest leading-none">Preço Médio (R$)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input 
                type="number" 
                step="0.01" 
                className="pl-8"
                value={formData.price} 
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-[10px] uppercase font-black tracking-widest leading-none">Descrição / Notas</Label>
            <Input 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="Opcional..."
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-tighter">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save className="mr-2" size={18} />}
              {service ? 'Salvar Alterações' : 'Cadastrar Serviço'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
