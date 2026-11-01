import { loadFiches } from './lib.mjs';
const { fiches, errors } = loadFiches();
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OK : ${fiches.length} fiche(s) valide(s)`);
