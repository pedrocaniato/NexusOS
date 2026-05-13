import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    // Como o schema.prisma está configurado com provider = "postgresql",
    // precisamos obrigatoriamente usar o adaptador de Postgres ou a URL direta.
    if (databaseUrl && databaseUrl.startsWith('postgresql')) {
      const pool = new Pool({ connectionString: databaseUrl });
      const adapter = new PrismaPg(pool);
      super({ adapter });
    } else {
      // Se não houver DATABASE_URL de postgres, mas o schema exige postgres,
      // o NestJS vai falhar. Avisamos o usuário ou tentamos usar a URL do .env se existir.
      console.warn('⚠️ DATABASE_URL de PostgreSQL não encontrada ou inválida para o provider atual.');
      super(); 
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
