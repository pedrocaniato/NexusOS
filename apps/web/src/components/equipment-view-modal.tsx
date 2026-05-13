import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Loader2, Monitor, AlertCircle, Calendar } from 'lucide-react';
import api from '@/services/api';

interface EquipmentViewModalProps {
  equipmentId: string;
}

export function EquipmentViewModal({ equipmentId }: EquipmentViewModalProps) {
  const [open, setOpen] = useState(false);
  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && equipmentId) {
      setLoading(true);
      api.get(`/equipments/${equipmentId}`)
        .then(res => setEquipment(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [open, equipmentId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" title="Visualizar" />}>
        <Eye size={16} />
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-[700px] max-h-[85vh] overflow-y-auto scrollbar-hide">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Monitor className="text-primary" /> Ficha do Equipamento
          </DialogTitle>
        </DialogHeader>

        {loading || !equipment ? (
          <div className="py-20 flex justify-center text-muted-foreground"><Loader2 className="animate-spin w-8 h-8" /></div>
        ) : (
          <div className="space-y-8 pt-4">
            <div className="grid grid-cols-2 gap-4 bg-surface-inset p-4 rounded-lg border border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Cliente Vinculado</p>
                <p className="font-medium text-base">{equipment.customer?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Equipamento</p>
                <p className="font-medium text-base">{equipment.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Marca/Modelo</p>
                <p className="text-sm">{equipment.brandModel || 'N/I'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Nº de Série</p>
                <p className="text-sm font-mono">{equipment.serialNumber || 'N/I'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Observações Técnicas</p>
                <p className="text-sm text-muted-foreground bg-background p-2 rounded mt-1 border border-border min-h-[40px]">
                  {equipment.observations || 'Nenhuma observação registrada.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Histórico de Ordens de Serviço
              </h3>
              
              {(!equipment.workOrders || equipment.workOrders.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground space-y-2 border border-dashed border-border rounded-lg">
                  <AlertCircle size={24} className="opacity-20" />
                  <p className="text-sm">Nenhuma O.S registrada para este equipamento.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {equipment.workOrders.map((os: any) => (
                    <div key={os.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-border rounded-lg bg-surface hover:bg-surface-hover transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">OS #{os.id.toString().padStart(4, '0')}</span>
                          <Badge variant="outline" className="text-[10px]">{os.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{os.clientReport || 'Sem relato do cliente.'}</p>
                      </div>
                      <div className="mt-2 sm:mt-0 text-right">
                        <p className="text-xs font-medium text-muted-foreground">Entrada</p>
                        <p className="text-sm">{new Date(os.entryDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
