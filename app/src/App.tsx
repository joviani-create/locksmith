import { useEffect, useMemo, useState } from 'preact/hooks';
import Fuse from 'fuse.js';
import fichesData from './data/fiches.json';
import outilsData from './data/outils.json';
import type { Fiche, Intervention, Outil, Procedure } from './types';
import { LABEL_FIABILITE, LABEL_SCENARIO, LABEL_ZONE } from './types';
import { pushRecent, toggle, useFavoris, useJournal, useRecents } from './store';

const FICHES = fichesData as unknown as Fiche[];
const OUTILS = (outilsData as { outils: Outil[] }).outils;
const outilNom = (id: string) => {
  const o = OUTILS.find((x) => x.id === id);
  return o ? `${o.marque} ${o.modele}` : id;
};
const titre = (f: Fiche) => `${f.marque} ${f.modele}`;
const annees = (f: Fiche) => `${f.annees.debut}–${f.annees.fin ?? 'auj.'}`;
const estExemple = (f: Fiche) => f.id.startsWith('exemple_');

function useHash() {
  const [h, setH] = useState(location.hash.slice(1) || '/');
  useEffect(() => {
    const on = () => { setH(location.hash.slice(1) || '/'); window.scrollTo(0, 0); };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return h;
}

const Badge = ({ f }: { f: Fiche['fiabilite_globale'] }) => (
  <span class={`badge ${f}`}>{LABEL_FIABILITE[f]}</span>
);

function Ligne({ f, favori }: { f: Fiche; favori: boolean }) {
  return (
    <a class="card item" href={`#/fiche/${f.id}`} style="text-decoration:none">
      <span class={`dot ${f.zone_risque}`} title={LABEL_ZONE[f.zone_risque]} />
      <span class="grow">
        <div class="t">{favori ? '★ ' : ''}{titre(f)}</div>
        <div class="s">{annees(f)} · {f.marche}</div>
      </span>
      <Badge f={f.fiabilite_globale} />
    </a>
  );
}

function Recherche() {
  const [q, setQ] = useState('');
  const [marque, setMarque] = useState('');
  const [favoris] = useFavoris();
  const [recents] = useRecents();
  const fuse = useMemo(
    () => new Fuse(FICHES, { keys: ['marque', 'modele', 'marche', 'systeme_immo.puce'], threshold: 0.35 }),
    [],
  );
  const marques = useMemo(() => [...new Set(FICHES.map((f) => f.marque))].sort(), []);
  let liste = q.trim() ? fuse.search(q).map((r) => r.item) : FICHES;
  if (marque) liste = liste.filter((f) => f.marque === marque);
  const rec = recents.map((id) => FICHES.find((f) => f.id === id)).filter(Boolean) as Fiche[];

  return (
    <main>
      <input type="search" placeholder="Rechercher : marque, modèle…" value={q}
        onInput={(e) => setQ((e.target as HTMLInputElement).value)} aria-label="Rechercher" />
      <div class="tabs">
        <button class={marque === '' ? 'on' : ''} onClick={() => setMarque('')}>Toutes</button>
        {marques.map((m) => (
          <button key={m} class={marque === m ? 'on' : ''} onClick={() => setMarque(m)}>{m}</button>
        ))}
      </div>
      {!q && !marque && rec.length > 0 && (
        <>
          <h2>Récents</h2>
          {rec.slice(0, 3).map((f) => <Ligne key={f.id} f={f} favori={favoris.includes(f.id)} />)}
        </>
      )}
      <h2>{liste.length} fiche(s)</h2>
      {liste.length === 0 && <div class="empty">Aucune fiche. Ajoutez votre retour terrain dans « Journal ».</div>}
      {liste.map((f) => <Ligne key={f.id} f={f} favori={favoris.includes(f.id)} />)}
    </main>
  );
}

function Favoris() {
  const [favoris] = useFavoris();
  const liste = favoris.map((id) => FICHES.find((f) => f.id === id)).filter(Boolean) as Fiche[];
  return (
    <main>
      {liste.length === 0 && <div class="empty">Aucun favori. Touchez ☆ sur une fiche.</div>}
      {liste.map((f) => <Ligne key={f.id} f={f} favori />)}
    </main>
  );
}

function Checklist({ fiche, proc }: { fiche: Fiche; proc: Procedure }) {
  const cle = `ls_check_${fiche.id}_${proc.scenario}`;
  const [faits, setFaits] = useState<boolean[]>(() => {
    try { return JSON.parse(localStorage.getItem(cle) || '[]'); } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem(cle, JSON.stringify(faits)); } catch { /* ignore */ } }, [cle, faits]);
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<typeof lock> } };
    nav.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, []);
  const total = proc.etapes.length;
  const nb = proc.etapes.filter((_, i) => faits[i]).length;
  return (
    <div>
      <div class="row"><b class="grow">{nb}/{total} étapes</b>
        <button class="tabs" style="border:0;background:none;color:var(--muted)" onClick={() => setFaits([])}>Réinitialiser</button></div>
      {proc.etapes.map((e, i) => (
        <label key={i} class={`step big ${faits[i] ? 'done' : ''}`} style="margin:0;color:inherit">
          <input type="checkbox" checked={!!faits[i]}
            onChange={() => { const n = [...faits]; n[i] = !n[i]; setFaits(n); }} />
          <span>{e}</span>
        </label>
      ))}
    </div>
  );
}

function FicheView({ id }: { id: string }) {
  const f = FICHES.find((x) => x.id === id);
  const [favoris, setFavoris] = useFavoris();
  const [recents, setRecents] = useRecents();
  const [scn, setScn] = useState(0);
  const [mode, setMode] = useState<'infos' | 'checklist'>('infos');
  useEffect(() => { if (f) setRecents(pushRecent(recents, f.id)); /* eslint-disable-next-line */ }, [id]);
  if (!f) return <main><div class="empty">Fiche introuvable.</div></main>;
  const proc = f.procedures[scn] ?? f.procedures[0];
  const s = f.systeme_immo;
  return (
    <main>
      <div class="row">
        <div class="grow"><h1 style="margin:0;font-size:22px">{titre(f)}</h1>
          <div class="s" style="color:var(--muted)">{annees(f)} · marché {f.marche}</div></div>
        <button class="tabs" style="font-size:28px;border:0;background:none;color:var(--accent);min-width:48px"
          aria-label="Favori" onClick={() => setFavoris(toggle(favoris, f.id))}>{favoris.includes(f.id) ? '★' : '☆'}</button>
      </div>
      {estExemple(f) && <div class="banner exemple">EXEMPLE FICTIF — ne pas utiliser sur un vrai véhicule</div>}
      {f.zone_risque === 'rouge' && <div class="banner rouge">⛔ HORS PÉRIMÈTRE — {f.motif_risque || 'Ne pas intervenir sans validation du responsable.'}</div>}
      {f.zone_risque === 'orange' && <div class="banner orange">⚠ PRUDENCE — {f.motif_risque || 'Risque modéré.'}</div>}
      <div class="row"><Badge f={f.fiabilite_globale} /></div>

      <div class="card">
        <h2 style="margin-top:0">Système</h2>
        <div>Type : {s?.type ?? '—'} · Puce : {s?.puce ?? '—'}</div>
        <div>Fréquence : {s?.frequence_mhz ? `${s.frequence_mhz} MHz` : '—'} · Lame : {s?.profil_lame ?? '—'}</div>
        {(f.cles_compatibles?.length ?? 0) > 0 && (
          <><h2>Clés compatibles</h2><ul class="plain">
            {f.cles_compatibles!.map((c, i) => <li key={i}>{c.fabricant} {c.type} {c.reference ?? ''} <Badge f={c.fiabilite} /></li>)}
          </ul></>
        )}
      </div>

      <div class="tabs">
        {f.procedures.map((p, i) => (
          <button key={i} class={scn === i ? 'on' : ''} onClick={() => setScn(i)}>{LABEL_SCENARIO[p.scenario]}</button>
        ))}
      </div>
      {proc && (
        <div class="card">
          <div class="row"><b class="grow">{outilNom(proc.outil)}</b><Badge f={proc.fiabilite} /></div>
          {proc.accessoires?.length ? <div>Accessoires : {proc.accessoires.join(', ')}</div> : null}
          {proc.duree_attente_min ? <div>⏱ Attente : {proc.duree_attente_min} min</div> : null}
          {proc.risques?.map((r, i) => <div key={i} class="risque">⚠ {r}</div>)}
          {proc.prerequis?.length ? <><h2>Prérequis</h2><ul class="plain">{proc.prerequis.map((p, i) => <li key={i}>{p}</li>)}</ul></> : null}
          <div class="tabs">
            <button class={mode === 'infos' ? 'on' : ''} onClick={() => setMode('infos')}>Étapes</button>
            <button class={mode === 'checklist' ? 'on' : ''} onClick={() => setMode('checklist')}>Mode checklist</button>
          </div>
          {mode === 'infos'
            ? <ol class="plain">{proc.etapes.map((e, i) => <li key={i}>{e}</li>)}</ol>
            : <Checklist fiche={f} proc={proc} />}
          <div class="s" style="color:var(--muted);font-size:13px">
            Source : {proc.source ?? 'non renseignée'}{proc.version_logiciel ? ` · logiciel ${proc.version_logiciel}` : ''}
          </div>
        </div>
      )}
      {f.notes_terrain?.map((n, i) => <div key={i} class="card">📝 {n}</div>)}
      <a class="btn" style="display:flex;align-items:center;justify-content:center;text-decoration:none"
        href={`#/journal/nouveau?fiche=${f.id}`}>+ Noter mon intervention</a>
      <div class="s" style="color:var(--muted);font-size:13px;margin-top:12px">
        Vérifiez la propriété du véhicule (carte grise + pièce d'identité) avant toute programmation.
      </div>
    </main>
  );
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function JournalNouveau({ query }: { query: string }) {
  const ficheId = new URLSearchParams(query).get('fiche');
  const f = FICHES.find((x) => x.id === ficheId) ?? null;
  const [journal, setJournal] = useJournal();
  const [v, setV] = useState<Omit<Intervention, 'id' | 'date' | 'ficheId'>>({
    vehicule: f ? titre(f) : '', vin: '', scenario: 'cle_ajoutee', resultat: 'reussi', notes: '', source: '',
  });
  const set = (k: keyof typeof v) => (e: Event) => setV({ ...v, [k]: (e.target as HTMLInputElement).value });
  const enregistrer = () => {
    setJournal([{ id: uid(), date: new Date().toISOString(), ficheId: f?.id ?? null, ...v }, ...journal]);
    location.hash = '/journal';
  };
  return (
    <main>
      <label>Véhicule</label><input value={v.vehicule} onInput={set('vehicule')} placeholder="Marque modèle année" />
      <label>VIN (facultatif)</label><input value={v.vin} onInput={set('vin')} />
      <label>Scénario</label>
      <select value={v.scenario} onChange={set('scenario')}>
        {Object.entries(LABEL_SCENARIO).map(([k, l]) => <option value={k}>{l}</option>)}
      </select>
      <label>Résultat</label>
      <select value={v.resultat} onChange={set('resultat')}>
        <option value="reussi">Réussi</option><option value="partiel">Partiel</option><option value="echec">Échec</option>
      </select>
      <label>Ce qui s'est passé (puce, menu, piège, durée…)</label><textarea value={v.notes} onInput={set('notes')} />
      <label>Source (lien YouTube, manuel…)</label><input value={v.source} onInput={set('source')} />
      <div style="height:16px" />
      <button class="btn" disabled={!v.vehicule.trim()} onClick={enregistrer}>Enregistrer</button>
    </main>
  );
}

function Journal() {
  const [journal, setJournal] = useJournal();
  const exporter = () => {
    const blob = new Blob([JSON.stringify(journal, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `journal-locksmith-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importer = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    file.text().then((t) => {
      try {
        const data = JSON.parse(t) as Intervention[];
        const ids = new Set(journal.map((j) => j.id));
        setJournal([...journal, ...data.filter((d) => d.id && !ids.has(d.id))]);
      } catch { alert('Fichier invalide'); }
    });
  };
  return (
    <main>
      <a class="btn" style="display:flex;align-items:center;justify-content:center;text-decoration:none"
        href="#/journal/nouveau">+ Nouvelle intervention</a>
      {journal.length === 0 && <div class="empty">Aucune intervention notée.</div>}
      {journal.map((j) => (
        <div class="card" key={j.id}>
          <div class="row"><b class="grow">{j.vehicule}</b>
            <span class="badge">{j.resultat}</span></div>
          <div class="s" style="color:var(--muted);font-size:13px">
            {new Date(j.date).toLocaleDateString('fr-FR')} · {LABEL_SCENARIO[j.scenario] ?? j.scenario}{j.vin ? ` · ${j.vin}` : ''}</div>
          {j.notes && <p style="white-space:pre-wrap">{j.notes}</p>}
          {j.source && <div class="s" style="font-size:13px">Source : {j.source}</div>}
          <button class="btn sec" style="min-height:44px;margin-top:8px"
            onClick={() => confirm('Supprimer ?') && setJournal(journal.filter((x) => x.id !== j.id))}>Supprimer</button>
        </div>
      ))}
      <h2>Sauvegarde</h2>
      <button class="btn sec" onClick={exporter} disabled={!journal.length}>Exporter (JSON)</button>
      <label>Importer un journal</label>
      <input type="file" accept="application/json" onChange={importer} />
    </main>
  );
}

export function App() {
  const hash = useHash();
  const [path, query = ''] = hash.split('?');
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    addEventListener('online', on); addEventListener('offline', off);
    return () => { removeEventListener('online', on); removeEventListener('offline', off); };
  }, []);

  let page, titreEcran = 'Locksmith';
  if (path.startsWith('/fiche/')) { page = <FicheView id={path.slice(7)} />; titreEcran = 'Fiche'; }
  else if (path === '/favoris') { page = <Favoris />; titreEcran = 'Favoris'; }
  else if (path === '/journal/nouveau') { page = <JournalNouveau query={query} />; titreEcran = 'Nouvelle intervention'; }
  else if (path === '/journal') { page = <Journal />; titreEcran = 'Journal'; }
  else page = <Recherche />;

  const racine = path === '/' || path === '/favoris' || path === '/journal';
  return (
    <>
      <header class="top">
        {!racine && <button aria-label="Retour" onClick={() => history.back()}>←</button>}
        <h1>{titreEcran}</h1>
        <span class="badge" style="color:#fff">{online ? 'en ligne' : 'hors ligne'}</span>
      </header>
      {page}
      <nav class="bottom">
        <a href="#/" class={path === '/' || path.startsWith('/fiche') ? 'on' : ''}><b>🔍</b>Recherche</a>
        <a href="#/favoris" class={path === '/favoris' ? 'on' : ''}><b>★</b>Favoris</a>
        <a href="#/journal" class={path.startsWith('/journal') ? 'on' : ''}><b>📝</b>Journal</a>
      </nav>
    </>
  );
}
