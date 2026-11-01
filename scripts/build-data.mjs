import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadFiches, paths } from './lib.mjs';

const { fiches, errors } = loadFiches();
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
const out = join(paths.root, 'app/src/data');
mkdirSync(out, { recursive: true });
fiches.sort((a, b) => (a.marque + a.modele).localeCompare(b.marque + b.modele));
writeFileSync(join(out, 'fiches.json'), JSON.stringify(fiches));
writeFileSync(join(out, 'outils.json'), readFileSync(paths.outils));
console.log(`Données générées : ${fiches.length} fiche(s)`);
