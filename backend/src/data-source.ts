import { join } from 'node:path';
import { DataSource } from 'typeorm';

// Used ONLY by the TypeORM CLI (yarn migration:generate / run / revert / show).
// The app itself connects through TypeOrmModule in app.module.ts.

// Load the repo-root .env (dist/data-source.js -> ../../.env).
try {
  process.loadEnvFile(join(import.meta.dirname, '../../.env'));
} catch {
  // No file (e.g. on GCP): variables come from the environment instead.
}

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5431),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [join(import.meta.dirname, '**/*.entity.js')],
  migrations: [join(import.meta.dirname, 'migrations/*.js')],
  synchronize: false,
});
