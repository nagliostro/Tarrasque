// Stop: typecheck + testes quando há mudanças em src/ ou prisma/. Falha devolve o erro ao Claude (exit 2).
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { env } from './node-env.mjs';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
if (input.stop_hook_active) process.exit(0); // evita loop de Stop

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const run = (command) => spawnSync(command, { cwd: root, env, encoding: 'utf8', shell: true });

const status = run('git status --porcelain').stdout ?? '';
if (!/^.. (src|prisma|e2e)\//m.test(status)) process.exit(0);

const steps = [
  ['typecheck', 'pnpm typecheck'],
  ['testes', 'pnpm exec vitest run --passWithNoTests'],
];

for (const [name, command] of steps) {
  const result = run(command);
  if (result.status !== 0) {
    console.error(`Falha em ${name}:\n${(result.stdout + result.stderr).slice(-3500)}`);
    process.exit(2);
  }
}
