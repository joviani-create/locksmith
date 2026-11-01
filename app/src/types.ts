export type Fiabilite = 'verifie_terrain' | 'source_constructeur_outil' | 'source_communautaire' | 'a_verifier';
export type Zone = 'vert' | 'orange' | 'rouge';

export interface Procedure {
  scenario: 'cle_ajoutee' | 'all_keys_lost' | 'copie_telecommande';
  outil: string;
  accessoires?: string[];
  prerequis?: string[];
  etapes: string[];
  risques?: string[];
  duree_attente_min?: number | null;
  version_logiciel?: string | null;
  fiabilite: Fiabilite;
  source?: string | null;
}

export interface Fiche {
  id: string;
  marque: string;
  modele: string;
  annees: { debut: number; fin?: number | null };
  marche: string;
  zone_risque: Zone;
  motif_risque?: string | null;
  systeme_immo?: {
    type?: string | null; puce?: string | null; frequence_mhz?: number | null;
    profil_lame?: string | null; fiabilite: Fiabilite;
  };
  cles_compatibles?: { fabricant: string; reference?: string | null; type: string; fiabilite: Fiabilite }[];
  fiabilite_globale: Fiabilite;
  procedures: Procedure[];
  notes_terrain?: string[];
  retours?: Retour[];
}

export interface Retour {
  lien: string;
  date: string;
  outil?: string | null;
  version_logiciel?: string | null;
  scenario?: Procedure['scenario'] | null;
  resultat: 'reussi' | 'partiel' | 'echec' | 'brique';
  piege?: string | null;
  fiabilite?: Fiabilite;
}

/** Procédure saisie par l'utilisateur dans l'app (stockée localement, exportable). */
export interface ProcedureUtilisateur {
  id: string;
  date: string;
  ficheId: string;
  scenario: Procedure['scenario'];
  outil: string;
  etapes: string[];
  pieges: string;
  duree_attente_min: number | null;
  version_logiciel: string;
}

export type Verdict = 'faisable' | 'reserves' | 'deconseille' | 'inconnu';
export const LABEL_VERDICT: Record<Verdict, string> = {
  faisable: 'Faisable', reserves: 'Faisable avec réserves', deconseille: 'Déconseillé', inconnu: 'Inconnu',
};
export const LABEL_RESULTAT: Record<Retour['resultat'], string> = {
  reussi: 'Réussi', partiel: 'Partiel', echec: 'Échec', brique: 'Brické',
};

/** Verdict dérivé des retours : jamais présenté comme certain, toujours avec le décompte. */
export function calculerVerdict(retours: Retour[] = []): { verdict: Verdict; resume: string } {
  const n = (r: Retour['resultat']) => retours.filter((x) => x.resultat === r).length;
  const reussi = n('reussi'), partiel = n('partiel'), echec = n('echec'), brique = n('brique');
  if (retours.length === 0) return { verdict: 'inconnu', resume: 'Aucun retour trouvé' };
  const resume = `${retours.length} retour(s) : ${reussi} réussi, ${partiel} partiel, ${echec} échec, ${brique} brické`;
  if (brique > 0) return { verdict: 'deconseille', resume };
  if (reussi === 0) return { verdict: 'deconseille', resume };
  if (echec > 0 || partiel > 0) return { verdict: 'reserves', resume };
  return { verdict: 'faisable', resume };
}

export interface Outil { id: string; marque: string; modele: string; role: string; version_logiciel: string | null }

export interface Intervention {
  id: string;
  date: string;
  ficheId: string | null;
  vehicule: string;
  vin: string;
  scenario: string;
  resultat: 'reussi' | 'echec' | 'partiel';
  notes: string;
  source: string;
}

export const LABEL_FIABILITE: Record<Fiabilite, string> = {
  verifie_terrain: 'Vérifié terrain',
  source_constructeur_outil: 'Source outil',
  source_communautaire: 'Source communautaire',
  a_verifier: 'À vérifier',
};
export const LABEL_SCENARIO: Record<string, string> = {
  cle_ajoutee: 'Clé ajoutée',
  all_keys_lost: 'All Keys Lost',
  copie_telecommande: 'Copie télécommande',
};
export const LABEL_ZONE: Record<Zone, string> = {
  vert: 'Routine', orange: 'Prudence', rouge: 'Hors périmètre',
};
