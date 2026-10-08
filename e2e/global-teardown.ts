import 'dotenv/config';
import { Client } from 'pg';

/** Remove os usuários criados pelos testes (cascata apaga sessões, coleções e fichas). */
export default async function globalTeardown() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query(`delete from "user" where email like '%@e2e.test'`);
    await client.query(`delete from rate_limit where key like '%:10.%'`); // IPs sintéticos dos testes
    console.log(`[e2e] ${result.rowCount} usuário(s) de teste removido(s)`);
  } finally {
    await client.end();
  }
}
