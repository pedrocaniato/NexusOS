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
import { Search, UserCircle } from 'lucide-react';
import api from '@/services/api';
import { EmployeeModal } from '@/components/employee-modal';

interface Employee {
  id: number;
  name: string;
  cpf: string;
  phone: string;
  commissionRate: number;
  totalCommission?: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/employees');
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.cpf.includes(searchTerm) ||
    e.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie a equipe e suas respectivas comissões.</p>
        </div>
        <EmployeeModal onSuccess={loadEmployees} />
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-lg font-medium">Equipe</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-inset border border-border rounded-md py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-10 text-muted-foreground italic">Carregando dados...</div>
          ) : !Array.isArray(filteredEmployees) || filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground space-y-2">
              <UserCircle size={48} className="opacity-20" />
              <p>Nenhum funcionário encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground w-20">ID</TableHead>
                  <TableHead className="text-muted-foreground">Nome</TableHead>
                  <TableHead className="text-muted-foreground">Telefone</TableHead>
                  <TableHead className="text-muted-foreground">Comissão (%)</TableHead>
                  <TableHead className="text-muted-foreground">Ganhos (Comissões)</TableHead>
                  <TableHead className="text-right text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="font-mono text-muted-foreground">#{employee.id}</TableCell>
                    <TableCell className="font-medium text-foreground">{employee.name}</TableCell>
                    <TableCell className="text-muted-foreground">{employee.phone}</TableCell>
                    <TableCell className="text-primary font-bold">{employee.commissionRate}%</TableCell>
                    <TableCell>
                      <span className="text-emerald-600 font-bold bg-emerald-500/10 px-2 py-1 rounded-md">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(employee.totalCommission || 0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <EmployeeModal initialData={employee} onSuccess={loadEmployees} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
