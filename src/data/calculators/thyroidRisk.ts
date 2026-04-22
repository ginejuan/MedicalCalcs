/**
 * Thyroid Nodule Malignancy Risk Calculator
 *
 * Logistic regression model (GLM) ported from R.
 * Source: Carral F, Fernandez Alba JJ, Jimenez JM, et al.
 * "Development and internal validation of a predictive model for
 * individual cancer risk assessment for thyroid nodules."
 * Endocr Pract. 2020;26(10):1077–1084.
 *
 * Coefficients extracted directly from multivariante_final.rds
 * AUC = 0.93 (95% CI: 0.91–0.95). Accuracy = 0.87, Kappa = 0.60.
 */

// ─── Model Coefficients (from RDS, exact) ────────────────────────────────────
const COEF = {
  intercept:           -0.093902433,
  afcdt_si:             0.842484676,  // family history YES vs NO (reference)
  sex_hombre:           0.665812684,  // male vs female (reference)
  edad:                -0.189297427,  // age (continuous)
  edad_cuadrado:        0.001484193,  // age² (continuous)
  tsh_low:             -1.457056551,  // TSH 0–0.369 vs 0.37–4.7 (reference)
  tsh_high:             0.681247814,  // TSH 4.701+ vs 0.37–4.7 (reference)
  tiroiditis:           0.957700271,  // autoimmune thyroiditis YES vs NO (reference)
  solido:               1.982743490,  // solid vs non-solid (reference)
  ganglio:              1.057791268,  // suspicious node vs no node (reference)
  hipoecoico:           1.600795755,  // echogenicity numeric (0=iso/hyper, 1=hypo, 2=anechoic)
  irregulares:          1.250513481,  // irregular margins vs regular (reference)
  macrocalc:            0.668442103,  // macrocalcifications vs NO (reference)
  microcalc:            1.400575707,  // microcalcifications vs NO (reference)
  forma_tall:           0.666918714,  // taller-than-wide vs wider-than-tall (reference)
} as const;

// ─── Input Types ──────────────────────────────────────────────────────────────
export type Echogenicity   = 'isoHyper' | 'hypo' | 'anechoic';
export type Calcifications = 'no' | 'macro' | 'micro';
export type Consistency    = 'solid' | 'cystic' | 'mixed';

export interface ThyroidRiskInput {
  age: number;            // 16–89 years
  sex: 'female' | 'male';
  familyHistory: boolean; // first-degree family history of thyroid cancer
  tsh: number;            // mUI/L (0–30)
  thyroiditis: boolean;   // autoimmune thyroiditis (positive Tg-Ab / TPO-Ab)
  diameter: number;       // maximum nodule diameter in mm (1–80)
  consistency: Consistency;
  echogenicity: Echogenicity;
  irregularMargins: boolean;
  calcifications: Calcifications;
  tallerThanWide: boolean;
  suspiciousNode: boolean;
}

export interface ThyroidRiskResult {
  /** Probability of malignancy 0–100 */
  risk: number;
  /** ATA / clinical warning message (may be undefined if no warning) */
  ataWarning: string | undefined;
  /** Specific cystic/anechoic message */
  cysticMessage: string | undefined;
  /** Lymph node recommendation */
  nodeMessage: string | undefined;
  /** Whether the result is forced to 0 (benign cystic) */
  isCysticBenign: boolean;
}

// ─── Echogenicity numeric map (mirrors server.R) ──────────────────────────────
const echoToNumeric: Record<Echogenicity, number> = {
  isoHyper: 0,
  hypo:     1,
  anechoic: 2,
};

// ─── TSH category helper ──────────────────────────────────────────────────────
function tshCategory(tsh: number): 'low' | 'normal' | 'high' {
  if (tsh < 0.37)  return 'low';
  if (tsh > 4.70)  return 'high';
  return 'normal';
}

// ─── Core logistic regression ──────────────────────────────────────────────────
function computeLogit(input: ThyroidRiskInput): number {
  const tshCat = tshCategory(input.tsh);
  const echoNum = echoToNumeric[input.echogenicity];

  return (
    COEF.intercept
    + (input.familyHistory ? COEF.afcdt_si : 0)
    + (input.sex === 'male' ? COEF.sex_hombre : 0)
    + COEF.edad          * input.age
    + COEF.edad_cuadrado * input.age ** 2
    + (tshCat === 'low'  ? COEF.tsh_low  : 0)
    + (tshCat === 'high' ? COEF.tsh_high : 0)
    + (input.thyroiditis ? COEF.tiroiditis : 0)
    + (input.consistency === 'solid' ? COEF.solido : 0)
    + (input.suspiciousNode ? COEF.ganglio : 0)
    + COEF.hipoecoico * echoNum
    + (input.irregularMargins ? COEF.irregulares : 0)
    + (input.calcifications === 'macro' ? COEF.macrocalc : 0)
    + (input.calcifications === 'micro' ? COEF.microcalc : 0)
    + (input.tallerThanWide ? COEF.forma_tall : 0)
  );
}

/** inverse-logistic / sigmoid */
function plogis(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// ─── ATA clinical recommendation logic (mirrors server.R) ─────────────────────
function computeAtaWarning(input: ThyroidRiskInput): string | undefined {
  const d = input.diameter;

  // Diameter < 10 mm
  if (d < 10) {
    const hasHighRiskFeature =
      input.calcifications === 'micro' ||
      input.irregularMargins ||
      input.tallerThanWide ||
      input.suspiciousNode;
    if (hasHighRiskFeature) {
      return 'CAUTION: In general, only nodules with a diameter equal to or greater than 10 mm should be studied. Assess the possibility of performing FNAB of the nodule.';
    }
    return 'CAUTION: In general, only nodules with a diameter equal to or greater than 10 mm should be studied.';
  }

  // Diameter 10–14.9 mm with high-risk US features
  if (d >= 10 && d < 15) {
    if (
      input.calcifications === 'micro' ||
      input.irregularMargins ||
      input.tallerThanWide ||
      input.suspiciousNode ||
      input.echogenicity === 'hypo' ||
      input.consistency === 'solid'
    ) {
      return 'CAUTION: FNAP of the nodule is recommended.';
    }
  }

  // Diameter 15–19.9 mm
  if (d >= 15 && d < 20) {
    if (
      input.consistency === 'solid' ||
      input.echogenicity === 'isoHyper'
    ) {
      return 'CAUTION: FNAP of the nodule is recommended.';
    }
  }

  // Diameter >= 20 mm solid
  if (d >= 20 && input.consistency === 'solid') {
    return 'CAUTION: FNAP of the nodule is recommended.';
  }

  return undefined;
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function calculateThyroidRisk(input: ThyroidRiskInput): ThyroidRiskResult {
  const isCysticBenign =
    input.echogenicity === 'anechoic' || input.consistency === 'cystic';

  if (isCysticBenign) {
    return {
      risk: 0,
      ataWarning: undefined,
      cysticMessage:
        'You have selected that the nodule is anechoic or cystic. In general, it is accepted that a cystic or anechoic nodule is benign, so the risk of thyroid cancer is considered zero. Consider FNAP to evacuate the cyst if the patient has discomfort or aesthetic discommodity.',
      nodeMessage: input.suspiciousNode
        ? 'It is recommended to perform FNAB of the suspected lymph node.'
        : undefined,
      isCysticBenign: true,
    };
  }

  const logit = computeLogit(input);
  const risk  = plogis(logit) * 100;

  return {
    risk,
    ataWarning:    computeAtaWarning(input),
    cysticMessage: undefined,
    nodeMessage:   input.suspiciousNode
      ? 'It is recommended to perform FNAB of the suspected lymph node.'
      : undefined,
    isCysticBenign: false,
  };
}
