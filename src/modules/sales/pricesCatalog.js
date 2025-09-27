// Catalogue de prix par défaut (modifiable). Stocké/merge avec LocalStorage.
const CATALOG_STORAGE_KEY = "fivoy_price_catalog_v1";

// Quelques items de départ (tu peux en ajouter autant que tu veux).
// ⚠️ Les unités aident à l'UX (ex : "minute", "épisode", "page", "pièce"...)
const DEFAULT_CATALOG = [
  // --- Tes précisions récentes ---
  { id: "film",      name: "Film",        unit: "pièce",   price: 300 },
  { id: "serie_ep",  name: "Série (par épisode)", unit: "épisode", price: 100 },
  { id: "connexion", name: "Connexion internet (par minute)", unit: "minute", price: 50 },

  // --- Exemples (tu peux ajuster selon ton image de tarifs) ---
  { id: "pc_noir_a4_recto",   name: "Photocopie NOIR A4 (Recto)",        unit: "page",   price: 200 },
  { id: "pc_noir_a4_rectov",  name: "Photocopie NOIR A4 - CIN N&B (Recto-verso)",  unit: "page",   price: 300 },

  { id: "pc_coul_a4_recto",   name: "Photocopie COULEUR A4 (Recto)",     unit: "page",   price: 300 },
  { id: "pc_coul_a4_rectov",  name: "Photocopie COULEUR A4 - CIN (Recto-verso)", unit: "page", price: 500 },

  { id: "imp_noir_a4_recto",  name: "Impression NOIR A4 (Recto)",        unit: "page",   price: 200 },
  { id: "imp_noir_a4_rectov", name: "Impression NOIR A4 (Recto-verso)",  unit: "page",   price: 300 },
  { id: "imp_coul_a4_recto",  name: "Impression COULEUR A4 (Recto)",     unit: "page",   price: 300 },
  { id: "imp_coul_a4_rectov", name: "Impression COULEUR A4 (Recto-verso)",unit:"page",   price: 500 },

  { id: "plastif_a4",         name: "Plastification A4",                 unit: "pièce",  price: 2000 },
  { id: "plastif_a5",         name: "Plastification A5",                 unit: "pièce",  price: 1000 },
  { id: "plastif_cin",        name: "Plastification CIN/vignette",       unit: "pièce",  price: 800 },

  { id: "cv_simple",          name: "Manambotra CV — Tsotra",            unit: "pièce",  price: 1000 },
  { id: "cv_style",           name: "Manambotra CV — Stylé",             unit: "pièce",  price: 2000 },

  { id: "envoi_mail",         name: "Envoi e-mail",                      unit: "pièce",  price: 1000 },
];

// --- API ---
export const loadCatalog = () => {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return DEFAULT_CATALOG;
    // merge basique: on garde les custom, on complète avec les défauts manquants
    const custom = JSON.parse(raw);
    const map = new Map(custom.map(i => [i.id || i.name, i]));
    DEFAULT_CATALOG.forEach(d => {
      const key = d.id || d.name;
      if (!map.has(key)) map.set(key, d);
    });
    return Array.from(map.values());
  } catch {
    return DEFAULT_CATALOG;
  }
};

export const saveCatalog = (items) => {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

export const suggestItems = (q) => {
  const catalog = loadCatalog();
  const needle = (q || "").toLowerCase();
  if (!needle) return catalog.slice(0, 20);
  return catalog.filter(it =>
    it.name.toLowerCase().includes(needle)
    || (it.unit || "").toLowerCase().includes(needle)
  ).slice(0, 20);
};

export const findByName = (name) => {
  if (!name) return null;
  const catalog = loadCatalog();
  const n = name.trim().toLowerCase();
  return catalog.find(it => it.name.trim().toLowerCase() === n) || null;
};
