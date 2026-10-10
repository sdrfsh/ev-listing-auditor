import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { connected } from 'process';

export interface DatabaseStatus {
  connected: boolean;
  database: string;
  username: string;
}

@Injectable()
export class AppService  implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly configService : ConfigService){
    this.pool = new Pool({
    host: '127.0.0.1',
    port: 5431,
    user: this.configService.getOrThrow<string>('POSTGRES_USER'),
    password: this.configService.getOrThrow<string>('POSTGRES_PASSWORD'),
    database: this.configService.getOrThrow<string>('POSTGRES_DB'),
    });
  }

  async checkDatabase(): Promise<DatabaseStatus> {
    const result = await this.pool.query('SELECT current_database() AS database, current_user AS username')

    return {
      connected: true,
      ...result.rows[0],
    }

  }

  getHello(): string {
    return 'Hello World!';
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
