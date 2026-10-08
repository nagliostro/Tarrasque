// Hooks rodam sem o init do shell: se houver nvm, usa o Node mais recente dele (o do sistema pode ser antigo).
import { existsSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const versions = path.join(
  process.env.NVM_DIR ?? path.join(os.homedir(), '.nvm'),
  'versions',
  'node',
);
const newest = existsSync(versions)
  ? readdirSync(versions)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .at(-1)
  : undefined;

export const env = newest
  ? {
      ...process.env,
      PATH: `${path.join(versions, newest, 'bin')}${path.delimiter}${process.env.PATH}`,
    }
  : process.env;
