/**
 * BRCA Genetic Testing Indication
 *
 * Rule-based decision tool for hereditary breast and ovarian cancer (HBOC)
 * following the SEOM clinical guidelines.
 *
 * Source:
 *   González-Santiago S, Ramón y Cajal T, Aguirre E, et al.
 *   "SEOM clinical guidelines in hereditary breast and ovarian cancer (2019)."
 *   Clin Transl Oncol. 2020;22(2):193–200. doi:10.1007/s12094-019-02262-0
 *
 * Logic: disjunction — if ANY criterion is met, BRCA1/BRCA2 genetic
 * testing referral is indicated. Ported from the author's Shiny app.
 */

export type BrcaCriterionId =
  | 'personalBreastPre45'
  | 'personalBreastPre50Bilateral'
  | 'personalBreastPre50Fam'
  | 'personalBreastPre60TripleNeg'
  | 'personalMultipleCancers'
  | 'personalOvarian'
  | 'personalMaleBreast'
  | 'personalProstPancrWithFam'
  | 'famBreastPre50'
  | 'famTwoBreast'
  | 'famOvarian'
  | 'famMaleBreast'
  | 'famProstPancr'
  | 'famFirstDegreeEarlyBreast'
  | 'famKnownMutation'
  | 'famMeetsAnyCriterion'
  | 'ashkenazi';

export type BrcaAnswers = Record<BrcaCriterionId, boolean>;

export interface BrcaCriterion {
  id: BrcaCriterionId;
  group: 'personal' | 'family';
  es: string;
  en: string;
}

export const BRCA_CRITERIA: readonly BrcaCriterion[] = [
  // A. Personal oncologic history
  { id: 'personalBreastPre45',          group: 'personal',
    es: 'Cáncer de mama diagnosticado antes de los 45 años',
    en: 'Breast cancer diagnosed before age 45' },
  { id: 'personalBreastPre50Bilateral', group: 'personal',
    es: 'Cáncer de mama antes de los 50 años con un segundo cáncer de mama primario',
    en: 'Breast cancer before age 50 with a second primary breast cancer' },
  { id: 'personalBreastPre50Fam',       group: 'personal',
    es: 'Cáncer de mama antes de los 50 años con antecedentes familiares de cáncer de mama (o antecedentes familiares desconocidos)',
    en: 'Breast cancer before age 50 with family history of breast cancer (or unknown family history)' },
  { id: 'personalBreastPre60TripleNeg', group: 'personal',
    es: 'Cáncer de mama triple negativo antes de los 60 años',
    en: 'Triple-negative breast cancer before age 60' },
  { id: 'personalMultipleCancers',      group: 'personal',
    es: 'Dos o más cánceres primarios en el paciente',
    en: 'Two or more primary cancers in the patient' },
  { id: 'personalOvarian',              group: 'personal',
    es: 'Cáncer de ovario (cualquier edad)',
    en: 'Ovarian cancer (any age)' },
  { id: 'personalMaleBreast',           group: 'personal',
    es: 'Cáncer de mama en varón',
    en: 'Male breast cancer' },
  { id: 'personalProstPancrWithFam',    group: 'personal',
    es: 'Cáncer de próstata o de páncreas con al menos dos familiares con cánceres relacionados con BRCA',
    en: 'Prostate or pancreatic cancer with at least two relatives with BRCA-related cancers' },

  // B. Family history & ancestry
  { id: 'famBreastPre50',               group: 'family',
    es: 'Un familiar con cáncer de mama diagnosticado antes de los 50 años',
    en: 'One relative with breast cancer diagnosed before age 50' },
  { id: 'famTwoBreast',                 group: 'family',
    es: 'Al menos dos familiares con cáncer de mama',
    en: 'At least two relatives with breast cancer' },
  { id: 'famOvarian',                   group: 'family',
    es: 'Uno o más familiares con cáncer de ovario',
    en: 'One or more relatives with ovarian cancer' },
  { id: 'famMaleBreast',                group: 'family',
    es: 'Familiar varón con cáncer de mama',
    en: 'Male relative with breast cancer' },
  { id: 'famProstPancr',                group: 'family',
    es: 'Al menos dos familiares con cáncer de próstata y/o páncreas',
    en: 'At least two relatives with prostate and/or pancreatic cancer' },
  { id: 'famFirstDegreeEarlyBreast',    group: 'family',
    es: 'Familiar de primer grado (padre/madre, hermano/a, hijo/a) con cáncer de mama a edad temprana',
    en: 'First-degree relative (parent, sibling, child) with breast cancer at an early age' },
  { id: 'famKnownMutation',             group: 'family',
    es: 'Familiar con mutación conocida en BRCA1 o BRCA2',
    en: 'Relative with a known BRCA1 or BRCA2 mutation' },
  { id: 'famMeetsAnyCriterion',         group: 'family',
    es: 'Familiar con cáncer que cumple alguno de los criterios anteriores',
    en: 'Relative with cancer meeting any of the above criteria' },
  { id: 'ashkenazi',                    group: 'family',
    es: 'Ascendencia judía askenazi',
    en: 'Ashkenazi Jewish ancestry' },
];

export interface BrcaResult {
  indicated: boolean;
  criteriaMet: BrcaCriterionId[];
}

export function evaluateBRCA(answers: BrcaAnswers): BrcaResult {
  const criteriaMet = BRCA_CRITERIA.filter(c => answers[c.id]).map(c => c.id);
  return { indicated: criteriaMet.length > 0, criteriaMet };
}

export function emptyAnswers(): BrcaAnswers {
  return BRCA_CRITERIA.reduce(
    (acc, c) => ({ ...acc, [c.id]: false }),
    {} as BrcaAnswers
  );
}
