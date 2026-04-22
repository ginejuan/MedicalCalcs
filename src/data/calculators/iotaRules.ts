/**
 * IOTA Simple Rules (adnexal masses)
 *
 * Rule-based ultrasound classification of adnexal masses into three
 * categories (benign / malignant / inconclusive) using 5 B-features
 * (benign) and 5 M-features (malignant).
 *
 * Source:
 *   Timmerman D, Van Calster B, Testa A, et al.
 *   "Predicting the risk of malignancy in adnexal masses based on the
 *    Simple Rules from the International Ovarian Tumor Analysis group."
 *   Am J Obstet Gynecol. 2016;214(4):424–437.
 *   doi:10.1016/j.ajog.2015.09.104
 *
 * Classification rule:
 *   - Any M present AND no B present → malignant (suspected)
 *   - Any B present AND no M present → benign (suspected)
 *   - Both or neither                → inconclusive
 */

export type IotaFeatureId =
  | 'b1_unilocular'
  | 'b2_smallSolidUnder7mm'
  | 'b3_acousticShadows'
  | 'b4_smoothMultiUnder100mm'
  | 'b5_noFlow'
  | 'm1_irregularSolid'
  | 'm2_ascites'
  | 'm3_atLeast4Papillary'
  | 'm4_irregMultiSolidOver100mm'
  | 'm5_strongFlow';

export type IotaAnswers = Record<IotaFeatureId, boolean>;

export interface IotaFeature {
  id: IotaFeatureId;
  group: 'benign' | 'malignant';
  short: string; // short label (e.g. "B1", "M4")
  es: string;
  en: string;
}

export const IOTA_FEATURES: readonly IotaFeature[] = [
  // ─── B-features (benign) ──────────────────────────────────────────
  { id: 'b1_unilocular',            group: 'benign', short: 'B1',
    es: 'Unilocular',
    en: 'Unilocular cyst' },
  { id: 'b2_smallSolidUnder7mm',    group: 'benign', short: 'B2',
    es: 'Componentes sólidos con diámetro máximo menor de 7 mm',
    en: 'Solid components with largest diameter <7 mm' },
  { id: 'b3_acousticShadows',       group: 'benign', short: 'B3',
    es: 'Presencia de sombras acústicas',
    en: 'Presence of acoustic shadows' },
  { id: 'b4_smoothMultiUnder100mm', group: 'benign', short: 'B4',
    es: 'Tumor multilocular de paredes lisas con diámetro máximo < 100 mm',
    en: 'Smooth multilocular tumor with largest diameter <100 mm' },
  { id: 'b5_noFlow',                group: 'benign', short: 'B5',
    es: 'Sin flujo sanguíneo (Doppler color, score 1)',
    en: 'No blood flow (color score 1)' },

  // ─── M-features (malignant) ───────────────────────────────────────
  { id: 'm1_irregularSolid',        group: 'malignant', short: 'M1',
    es: 'Tumor sólido irregular',
    en: 'Irregular solid tumor' },
  { id: 'm2_ascites',               group: 'malignant', short: 'M2',
    es: 'Presencia de ascitis',
    en: 'Presence of ascites' },
  { id: 'm3_atLeast4Papillary',     group: 'malignant', short: 'M3',
    es: 'Al menos 4 estructuras papilares',
    en: 'At least 4 papillary structures' },
  // M4 aligned to canonical IOTA (requires "irregular", not only solid+multi)
  { id: 'm4_irregMultiSolidOver100mm', group: 'malignant', short: 'M4',
    es: 'Tumor multilocular sólido irregular con diámetro máximo ≥ 100 mm',
    en: 'Irregular multilocular solid tumor with largest diameter ≥100 mm' },
  { id: 'm5_strongFlow',            group: 'malignant', short: 'M5',
    es: 'Flujo sanguíneo muy intenso (Doppler color, score 4)',
    en: 'Very strong blood flow (color score 4)' },
];

export type IotaClassification = 'benign' | 'malignant' | 'inconclusive' | 'empty';

export interface IotaResult {
  classification: IotaClassification;
  benignMet: IotaFeatureId[];
  malignantMet: IotaFeatureId[];
}

export function evaluateIOTA(answers: IotaAnswers): IotaResult {
  const benignMet    = IOTA_FEATURES.filter(f => f.group === 'benign'    && answers[f.id]).map(f => f.id);
  const malignantMet = IOTA_FEATURES.filter(f => f.group === 'malignant' && answers[f.id]).map(f => f.id);
  const b = benignMet.length;
  const m = malignantMet.length;

  let classification: IotaClassification;
  if (b === 0 && m === 0)      classification = 'empty';
  else if (m > 0 && b === 0)   classification = 'malignant';
  else if (b > 0 && m === 0)   classification = 'benign';
  else                         classification = 'inconclusive';

  return { classification, benignMet, malignantMet };
}

export function emptyIotaAnswers(): IotaAnswers {
  return IOTA_FEATURES.reduce(
    (acc, f) => ({ ...acc, [f.id]: false }),
    {} as IotaAnswers
  );
}
