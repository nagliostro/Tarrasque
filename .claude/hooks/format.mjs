// PostToolUse (Edit|Write): Prettier + ESLint --fix no arquivo alterado. Erros de lint voltam ao Claude (exit 2).
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const file = String(input.tool_input?.file_path ?? '');
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const rel = path.relative(root, file).replaceAll('\\', '/');

const ignored =
  /^(legacy|node_modules|\.next|src\/generated|prisma\/migrations)\//.test(rel) ||
  rel.startsWith('..');
if (!file || ignored || !/\.(tsx?|mjs|css|json|md)$/.test(rel)) process.exit(0);

const run = (args) =>
  spawnSync(`pnpm exec ${args.join(' ')}`, { cwd: root, encoding: 'utf8', shell: true });

run(['prettier', '--write', `"${rel}"`]);

if (/\.(tsx?|mjs)$/.test(rel)) {
  const lint = run(['eslint', '--fix', `"${rel}"`]);
  if (lint.status !== 0) {
    console.error(
      `ESLint encontrou problemas em ${rel}:\n${lint.stdout}${lint.stderr}`.slice(0, 4000),
    );
    process.exit(2);
  }
}
