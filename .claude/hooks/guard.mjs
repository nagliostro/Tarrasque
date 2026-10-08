// PreToolUse (Edit|Write|Bash): bloqueia ações perigosas. Exit 2 = bloqueado, stderr volta ao Claude.
import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const tool = input.tool_name;
const args = input.tool_input ?? {};

function block(reason) {
  console.error(`Bloqueado: ${reason}`);
  process.exit(2);
}

if (tool === 'Edit' || tool === 'Write') {
  const file = String(args.file_path ?? '').replaceAll('\\', '/');
  if (/(^|\/)\.env(\.[^/]*)?$/.test(file) && !file.endsWith('.env.example')) {
    block(
      'arquivos .env* guardam segredos. Edite .env.example e peça ao usuário para copiar os valores.',
    );
  }
  if (
    /\/prisma\/migrations\//.test(file) &&
    !file.endsWith('migration_lock.toml') &&
    existsSync(file)
  ) {
    block('migrations existentes são imutáveis. Crie uma nova migration com `pnpm db:migrate`.');
  }
}

if (tool === 'Bash') {
  const cmd = String(args.command ?? '');
  if (
    /prisma\s+migrate\s+reset/.test(cmd) ||
    /prisma\s+db\s+push[^\n]*(--force|--accept-data-loss)/.test(cmd)
  ) {
    block('comando destrutivo no banco. Peça confirmação explícita ao usuário antes de rodar.');
  }
  if (/\b(cat|type|Get-Content|more|less)\b[^\n|]*\.env(\s|$|\.(?!example))/.test(cmd)) {
    block('não leia arquivos .env; eles contêm segredos.');
  }
}
