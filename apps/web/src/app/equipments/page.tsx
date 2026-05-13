'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Laptop } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';
import { EquipmentViewModal } from '@/components/equipment-view-modal';
import { EquipmentEditModal } from '@/components/equipment-edit-modal';

interface Equipment {
  id: string;
  name: string;
  tag: string | null;
  brandModel: string | null;
  serialNumber: string | null;
  customer: {
    id: string;
    name: string;
  };
  workOrders?: { status: string }[];
}

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadEquipments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/equipments');
      setEquipments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEquipments();
  }, [loadEquipments]);

  const filteredEquipments = equipments.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.tag || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.brandModel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEquipmentStatus = (workOrders?: { status: string }[]) => {
    if (!workOrders || workOrders.length === 0) {
      return { label: 'Novo/Disponível', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    }
    
    // Como está vindo ordenado decrescente pelo banco, pegamos a última OS gerada
    const latestOS = workOrders[0];
    const maintenanceStatuses = ['ENTRADA', 'ORCAMENTO', 'ABERTO', 'ANDAMENTO'];
    
    if (maintenanceStatuses.includes(latestOS.status)) {
      return { label: 'Em Manutenção', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    }
    
    return { label: 'Com o Cliente', color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
          <p className="text-muted-foreground">Gerencie os equipamentos e acompanhe seus status de manutenção.</p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-lg font-medium">Lista de Equipamentos</CardTitle>
          <div className="relative w-64 flex items-center">
            <Input 
              type="text" 
              placeholder="Buscar por etiqueta, modelo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-inset border border-border rounded-md py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
            <Search className="absolute right-3 text-muted-foreground pointer-events-none" size={16} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-10 text-muted-foreground italic text-sm animate-pulse">Carregando dados...</div>
          ) : filteredEquipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground space-y-2">
              <Laptop size={48} className="opacity-20" />
              <p>Nenhum equipamento encontrado.</p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader className="bg-surface-inset">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Equipamento</TableHead>
                    <TableHead className="text-muted-foreground">Etiqueta</TableHead>
                    <TableHead className="text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-muted-foreground">Marca/Modelo</TableHead>
                    <TableHead className="text-muted-foreground">Status Atual</TableHead>
                    <TableHead className="text-muted-foreground text-right sticky right-0 bg-surface-inset z-10 w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipments.map((equipment) => {
                    const status = getEquipmentStatus(equipment.workOrders);
                    return (
                      <TableRow key={equipment.id} className="border-border hover:bg-zinc-800/50 dark:hover:bg-zinc-800/50 transition-colors">
                        <TableCell className="font-medium text-foreground">{equipment.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border text-[10px] font-bold uppercase tracking-wider">
                            {equipment.tag || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{equipment.customer.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{equipment.brandModel || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${status.color} font-semibold uppercase text-[10px] tracking-wider`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right sticky right-0 bg-card hover:bg-zinc-800/50 dark:hover:bg-zinc-800/50 z-10 transition-colors">
                          <div className="flex justify-end gap-1">
                            <EquipmentViewModal equipmentId={equipment.id} />
                            <EquipmentEditModal equipmentId={equipment.id} onSuccess={loadEquipments} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
