// SessionStart: lembra as regras do projeto e informa se o Postgres local responde.
import net from 'node:net';

const up = await new Promise((resolve) => {
  const socket = net.connect({ host: 'localhost', port: 5434, timeout: 800 });
  socket.once('connect', () => (socket.destroy(), resolve(true)));
  socket.once('error', () => resolve(false));
  socket.once('timeout', () => (socket.destroy(), resolve(false)));
});

console.log(
  [
    'Tarrasque: monolito modular Next.js + Prisma. Leia docs/architecture.md antes de criar/alterar módulos.',
    'Módulos só se importam pelo index.ts; o visual segue docs/design.md e legacy/dist é a referência.',
    `Postgres local (localhost:5434): ${up ? 'ativo' : 'parado, rode `pnpm db:up` (requer Docker Desktop)'}.`,
  ].join('\n'),
);
