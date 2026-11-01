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
