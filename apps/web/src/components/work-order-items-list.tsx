'use client';

import { useState } from 'react';
import { Trash2, Plus, Loader2, Wrench, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ComboboxProduct } from './combobox-product';
import { ComboboxService } from './combobox-service';
import api from '@/services/api';
import { cn } from '@/lib/utils';

interface WorkOrderItemsListProps {
  workOrderId: number;
  products: any[];
  services: any[];
  onUpdate: () => void;
}

export function WorkOrderItemsList({ workOrderId, products, services, onUpdate }: WorkOrderItemsListProps) {
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'PRODUCTS'>('SERVICES');
  
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);

  const handleAddProduct = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      await api.post(`/work-orders/${workOrderId}/products`, {
        productId: selectedProduct.id,
        quantity: Number(quantity),
      });
      setSelectedProduct(null);
      setQuantity(1);
      onUpdate();
    } catch (err) {
      console.error('Erro ao adicionar peça:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!selectedService) return;
    setLoading(true);
    try {
      await api.post(`/work-orders/${workOrderId}/services`, {
        serviceId: selectedService.id,
        quantity: Number(quantity),
      });
      setSelectedService(null);
      setQuantity(1);
      onUpdate();
    } catch (err) {
      console.error('Erro ao adicionar serviço:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (itemId: string) => {
    try {
      await api.delete(`/work-orders/${workOrderId}/products/${itemId}`);
      onUpdate();
    } catch (err) {
      console.error('Erro ao remover peça:', err);
    }
  };

  const handleRemoveService = async (itemId: string) => {
    try {
      await api.delete(`/work-orders/${workOrderId}/services/${itemId}`);
      onUpdate();
    } catch (err) {
      console.error('Erro ao remover serviço:', err);
    }
  };

  const totalProducts = products?.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0) || 0;
  const totalServices = services?.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0) || 0;
  const total = totalProducts + totalServices;

  return (
    <div className="space-y-6">
      <div className="flex bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('SERVICES')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-bold text-sm transition-all",
            activeTab === 'SERVICES' 
              ? "bg-surface-inset text-foreground shadow" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Wrench size={16} />
          Serviços Executados
        </button>
        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-bold text-sm transition-all",
            activeTab === 'PRODUCTS' 
              ? "bg-surface-inset text-foreground shadow" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Package size={16} />
          Peças Utilizadas
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end bg-surface-inset/20 p-4 rounded-lg border border-border/50">
        <div className="flex-1 space-y-2">
          <label className="text-xs uppercase font-black text-zinc-500 tracking-widest leading-none">
            {activeTab === 'SERVICES' ? 'Adicionar Mão de Obra' : 'Adicionar Peça / Componente'}
          </label>
          {activeTab === 'SERVICES' ? (
            <ComboboxService onSelect={setSelectedService} />
          ) : (
            <ComboboxProduct onSelect={setSelectedProduct} />
          )}
        </div>
        <div className="w-24 space-y-2">
          <label className="text-xs uppercase font-black text-zinc-500 tracking-widest leading-none">Qtd.</label>
          <Input 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="bg-card border-border h-10"
          />
        </div>
        <Button 
          onClick={activeTab === 'SERVICES' ? handleAddService : handleAddProduct} 
          disabled={(activeTab === 'SERVICES' ? !selectedService : !selectedProduct) || loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 h-10"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
          Adicionar
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden shadow-xl">
        <table className="w-full text-sm">
          <thead className="bg-surface-inset border-b border-border">
            <tr>
              <th className="text-left px-4 py-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                {activeTab === 'SERVICES' ? 'Serviço Prestado' : 'Componente Utilizado'}
              </th>
              <th className="text-center px-4 py-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Qtd.</th>
              <th className="text-right px-4 py-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">V. Unitário</th>
              <th className="text-right px-4 py-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Subtotal</th>
              <th className="w-10 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activeTab === 'SERVICES' ? (
              services?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500 font-medium bg-surface-inset/20">
                    Nenhum serviço lançado nesta Ordem de Serviço.
                  </td>
                </tr>
              ) : (
                services.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors group bg-surface-inset/40">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded bg-sky-500/10 text-sky-500 flex items-center justify-center">
                           <Wrench size={14} />
                         </div>
                         <div>
                           <div className="font-bold text-foreground group-hover:text-primary transition-colors">{item.service?.name}</div>
                           <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Mão de Obra</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-zinc-200 font-medium">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-zinc-200 font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}
                    </td>
                    <td className="px-4 py-4 text-right font-black text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice * item.quantity)}
                    </td>
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => handleRemoveService(item.id)}
                        className="text-zinc-600 hover:text-red-500 transition-all hover:scale-110"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )
            ) : (
              products?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500 font-medium bg-zinc-950/20">
                    Nenhuma peça lançada nesta Ordem de Serviço.
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors group bg-surface-inset/40">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                           <Package size={14} />
                         </div>
                         <div>
                           <div className="font-bold text-foreground group-hover:text-primary transition-colors">{item.product?.name}</div>
                           <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Peça Utilizada</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-zinc-200 font-medium">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-zinc-200 font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}
                    </td>
                    <td className="px-4 py-4 text-right font-black text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice * item.quantity)}
                    </td>
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => handleRemoveProduct(item.id)}
                        className="text-zinc-600 hover:text-red-500 transition-all hover:scale-110"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
          <tfoot className="bg-surface-inset/60 border-t border-border divide-y divide-border/50">
            <tr className="bg-primary/5">
              <td colSpan={3} className="px-4 py-6 text-right font-black text-zinc-300 uppercase tracking-[0.2em] text-[11px]">Subtotal Mão de Obra</td>
              <td className="px-4 py-6 text-right font-black text-lg text-zinc-200">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalServices)}
              </td>
              <td></td>
            </tr>
            <tr className="bg-primary/5">
              <td colSpan={3} className="px-4 py-6 text-right font-black text-zinc-300 uppercase tracking-[0.2em] text-[11px]">Subtotal Peças Utilizadas</td>
              <td className="px-4 py-6 text-right font-black text-lg text-zinc-200">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProducts)}
              </td>
              <td></td>
            </tr>
            <tr className="bg-primary/10">
              <td colSpan={3} className="px-4 py-6 text-right font-black text-zinc-300 uppercase tracking-[0.2em] text-[11px]">Valor Total da OS</td>
              <td className="px-4 py-6 text-right font-black text-3xl text-primary drop-shadow-[0_0_8px_rgba(158,240,26,0.3)]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
