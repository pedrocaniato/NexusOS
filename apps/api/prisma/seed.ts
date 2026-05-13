import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando Seed...');

  // 1. Usuário Admin (Senha: admin123)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexusos.com' },
    update: {},
    create: {
      email: 'admin@nexusos.com',
      name: 'Administrador Sistema',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin criado:', admin.email);

  // 2. Cliente e Fornecedor (Unificados no model Customer)
  const customer1 = await prisma.customer.upsert({
    where: { id: 'test-customer-1' },
    update: {},
    create: {
      id: 'test-customer-1',
      name: 'João das Couves',
      personType: 'FISICA',
      contactType: 'CLIENTE',
      email: 'joao@email.com',
      document: '123.456.789-00',
    },
  });

  const fornecedor = await prisma.customer.upsert({
    where: { id: 'test-fornecedor-1' },
    update: {},
    create: {
      id: 'test-fornecedor-1',
      name: 'Distribuidora de Peças LTDA',
      personType: 'JURIDICA',
      contactType: 'FORNECEDOR',
      email: 'contato@distribuidora.com',
      document: '12.345.678/0001-99',
    },
  });

  console.log('✅ Clientes/Fornecedores criados');

  // 3. Produtos (Estoque)
  console.log('📦 Populando Estoque...');
  const products = [
    { id: 'prod-ssd-240', name: 'SSD 240GB Kingston', price: 250, costPrice: 180, stock: 15, description: 'SATA III' },
    { id: 'prod-ssd-480', name: 'SSD 480GB Crucial', price: 380, costPrice: 290, stock: 8, description: 'SATA III' },
    { id: 'prod-ram-8', name: 'Memória RAM 8GB DDR4', price: 220, costPrice: 150, stock: 12, description: '2666MHz' },
    { id: 'prod-fonte-500', name: 'Fonte 500W 80 Plus', price: 350, costPrice: 240, stock: 5, description: 'Bronze' },
    { id: 'prod-pasta-termica', name: 'Pasta Térmica MX-4', price: 85, costPrice: 45, stock: 20, description: '4g' },
    { id: 'prod-teclado-dell', name: 'Teclado p/ Dell Latitude', price: 150, costPrice: 85, stock: 3, description: 'ABNT2' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        ...p,
        supplierName: 'Distribuidora de Peças LTDA',
      },
    });
  }

  // 4. Serviços
  console.log('🛠️ Populando Serviços...');
  const services = [
    { id: 'serv-format-simple', name: 'Formatação Simples', price: 100, description: 'Apenas sistema' },
    { id: 'serv-format-full', name: 'Formatação Completa', price: 160, description: 'Sistema + Backup + Drivers' },
    { id: 'serv-limpeza', name: 'Limpeza e Pasta Térmica', price: 120, description: 'Limpeza interna completa' },
    { id: 'serv-reparo-placa', name: 'Reparo em Placa Mãe', price: 450, description: 'Reparo de circuito' },
    { id: 'serv-clone-ssd', name: 'Clonagem de Disco/SSD', price: 120, description: 'Migração de dados' },
    { id: 'serv-tela', name: 'Troca de Tela Notebook', price: 180, description: 'Apenas mão de obra' },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }

  console.log('✅ Produtos e Serviços populados');

  console.log('🚀 Gerando Ordens de Serviço...');

  const statusDisponiveis = [
    'ENTRADA', 
    'ORCAMENTO', 
    'ABERTO', 
    'ANDAMENTO', 
    'CONCLUIDO', 
    'FATURADO',
    'CANCELADO'
  ];

  const priorities = ['LOW', 'NORMAL', 'HIGH'];

  // Gerar OS para Maio 2026 (Mês Atual)
  for (let i = 0; i < 40; i++) {
    const status = statusDisponiveis[Math.floor(Math.random() * statusDisponiveis.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)] as any;
    const day = Math.floor(Math.random() * 13) + 1; // 1 a 13 de Maio
    
    await prisma.workOrder.create({
      data: {
        status: status as any,
        priority: priority,
        equipment: 'Equipamento ' + i,
        brandModel: 'Modelo ' + i,
        clientReport: 'Relato do cliente ' + i,
        customerId: customer1.id,
        userId: admin.id,
        totalValue: Math.floor(Math.random() * 1000) + 100,
        entryDate: new Date(2026, 4, day), // Maio é mês 4 em JS
        deadline: new Date(2026, 4, day + 5),
      },
    });
  }

  // Gerar OS para Abril 2026 (Mês Anterior - para cálculo de crescimento)
  for (let i = 0; i < 30; i++) {
    const day = Math.floor(Math.random() * 28) + 1;
    await prisma.workOrder.create({
      data: {
        status: 'FATURADO',
        priority: 'NORMAL',
        equipment: 'Antigo ' + i,
        brandModel: 'Modelo A',
        customerId: customer1.id,
        userId: admin.id,
        totalValue: Math.floor(Math.random() * 800) + 100,
        entryDate: new Date(2026, 3, day), // Abril
      },
    });
  }

  // Criar alguns clientes em Maio
  for (let i = 0; i < 15; i++) {
    await prisma.customer.create({
      data: {
        name: 'Cliente Novo ' + i,
        email: `novo${i}@email.com`,
        createdAt: new Date(2026, 4, Math.floor(Math.random() * 13) + 1),
      }
    });
  }

  console.log('⭐ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });