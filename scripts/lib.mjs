import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from '../app/node_modules/ajv/dist/2020.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const paths = {
  root,
  fiches: join(root, 'data/fiches'),
  schema: join(root, 'data/schema/fiche.schema.json'),
  outils: join(root, 'data/reference/outils.json'),
};

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.json') ? [p] : [];
  });
}

export function loadFiches() {
  const ajv = new (Ajv2020.default ?? Ajv2020)({ allErrors: true, strict: false });
  const validate = ajv.compile(JSON.parse(readFileSync(paths.schema, 'utf8')));
  const outils = JSON.parse(readFileSync(paths.outils, 'utf8')).outils.map((o) => o.id);
  const fiches = [];
  const errors = [];
  const ids = new Set();
  for (const f of walk(paths.fiches)) {
    const data = JSON.parse(readFileSync(f, 'utf8'));
    if (!validate(data)) {
      errors.push(`${f}: ${ajv.errorsText(validate.errors)}`);
      continue;
    }
    if (ids.has(data.id)) errors.push(`${f}: id en double "${data.id}"`);
    ids.add(data.id);
    for (const p of data.procedures)
      if (!outils.includes(p.outil)) errors.push(`${f}: outil inconnu "${p.outil}"`);
    fiches.push(data);
  }
  return { fiches, errors };
}
