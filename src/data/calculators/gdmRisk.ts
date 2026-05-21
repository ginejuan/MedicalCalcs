/**
 * Gestational Diabetes Mellitus (GDM) Risk Calculator
 *
 * Logistic regression models trained on the Hospital Universitario Puerto Real 2020-2025 cohort (n=3,981, prevalence 6.0%).
 * Source: Gestational Diabetes Mellitus Risk Calculator Technical Specification.
 */

// ─── Model Coefficients (exact values from technical specification) ───────────
export const COEF = {
  A_total: {
    intercept: -7.3336,
    coefs: { edad: 0.0751, IMC: 0.0690, ant_fam_diabetes: 0.6610, multipara: 0.0610 }
  },
  A_precoz: {
    intercept: -10.3436,
    coefs: { edad: 0.0809, IMC: 0.1117, ant_fam_diabetes: 1.0900, multipara: -0.1035 }
  },
  A_tardia: {
    intercept: -6.9871,
    coefs: { edad: 0.0728, IMC: 0.0508, ant_fam_diabetes: 0.5058, multipara: 0.1045 }
  },
  B_total: {
    intercept: -10.7932,
    coefs: { edad: 0.0675, IMC: 0.0575, ant_fam_diabetes: 0.5898, multipara: 0.0492, glucosa_basal_1t: 0.0132, hba1c_1t: 0.5829 }
  },
  B_precoz: {
    intercept: -15.9516,
    coefs: { edad: 0.0690, IMC: 0.0917, ant_fam_diabetes: 0.9329, multipara: -0.0769, glucosa_basal_1t: 0.0232, hba1c_1t: 0.9053 }
  },
  B_tardia: {
    intercept: -9.5581,
    coefs: { edad: 0.0672, IMC: 0.0435, ant_fam_diabetes: 0.4664, multipara: 0.0970, glucosa_basal_1t: 0.0081, hba1c_1t: 0.4548 }
  },
  C_total: {
    intercept: -10.4462,
    coefs: { edad: 0.0689, IMC: 0.0573, ant_fam_diabetes: 0.5903, multipara: 0.0397, glucosa_basal_1t: 0.0129, hba1c_1t: 0.5568, papp_a_mom_1t: -0.1753, bhcg_libre_mom_1t: -0.0199 }
  },
  C_precoz: {
    intercept: -15.7706,
    coefs: { edad: 0.0714, IMC: 0.0931, ant_fam_diabetes: 0.9389, multipara: -0.0675, glucosa_basal_1t: 0.0226, hba1c_1t: 0.8983, papp_a_mom_1t: -0.0338, bhcg_libre_mom_1t: -0.1451 }
  },
  C_tardia: {
    intercept: -9.1469,
    coefs: { edad: 0.0686, IMC: 0.0428, ant_fam_diabetes: 0.4678, multipara: 0.0827, glucosa_basal_1t: 0.0078, hba1c_1t: 0.4237, papp_a_mom_1t: -0.2251, bhcg_libre_mom_1t: 0.0031 }
  }
} as const;

export const AUC = {
  A: { total: 0.687, precoz: 0.815, tardia: 0.649 },
  B: { total: 0.697, precoz: 0.822, tardia: 0.660 },
  C: { total: 0.699, precoz: 0.819, tardia: 0.664 }
} as const;

// ─── Input Interface ─────────────────────────────────────────────────────────
export interface GdmRiskInput {
  age: number;               // 14–55 years
  weight: number;            // 30–200 kg (Pregestational weight)
  height: number;            // 130–210 cm
  familyHistory: boolean;    // First-degree family history of diabetes
  multipara: boolean;        // Parity (false = primigesta, true = multipara)
  glucose?: number | null;   // Glucosa basal 1T (mg/dL) - optional
  hba1c?: number | null;     // HbA1c 1T (%) - optional
  pappa?: number | null;     // PAPP-A 1T (MoM) - optional
  freeBhcg?: number | null;  // Free β-hCG 1T (MoM) - optional
}

// ─── Result Interface ────────────────────────────────────────────────────────
export interface GdmRiskResult {
  level: 'A' | 'B' | 'C';
  imc: number;
  p_total: number;  // 0 - 100
  p_precoz: number; // 0 - 100
  p_tardia: number; // 0 - 100
  auc: {
    readonly total: number;
    readonly precoz: number;
    readonly tardia: number;
  };
}

// ─── Core Calculations ───────────────────────────────────────────────────────
function logitToP(intercept: number, coefs: Record<string, number>, values: Record<string, number>): number {
  let z = intercept;
  for (const [key, val] of Object.entries(coefs)) {
    z += val * (values[key] ?? 0);
  }
  return 1 / (1 + Math.exp(-z));
}

export function calculateGdmRisk(input: GdmRiskInput): GdmRiskResult {
  const imc = input.weight / Math.pow(input.height / 100, 2);

  // Check which level is active based on available data.
  // We strictly check if B-level metrics (glucose and HbA1c) are present and valid numbers.
  const hasB =
    input.glucose !== undefined && input.glucose !== null && !isNaN(input.glucose) &&
    input.hba1c !== undefined && input.hba1c !== null && !isNaN(input.hba1c);

  // C-level needs both B-level metrics and C-level metrics (PAPP-A and free β-hCG).
  const hasC =
    hasB &&
    input.pappa !== undefined && input.pappa !== null && !isNaN(input.pappa) &&
    input.freeBhcg !== undefined && input.freeBhcg !== null && !isNaN(input.freeBhcg);

  const level: 'A' | 'B' | 'C' = hasC ? 'C' : (hasB ? 'B' : 'A');

  // Construct standard values dict mapped to internal variable names
  const values: Record<string, number> = {
    edad: input.age,
    IMC: imc,
    ant_fam_diabetes: input.familyHistory ? 1 : 0,
    multipara: input.multipara ? 1 : 0,
    glucosa_basal_1t: input.glucose ?? 0,
    hba1c_1t: input.hba1c ?? 0,
    papp_a_mom_1t: input.pappa ?? 0,
    bhcg_libre_mom_1t: input.freeBhcg ?? 0,
  };

  const modelTotal = COEF[`${level}_total` as keyof typeof COEF];
  const modelPrecoz = COEF[`${level}_precoz` as keyof typeof COEF];
  const modelTardia = COEF[`${level}_tardia` as keyof typeof COEF];

  const p_total = logitToP(modelTotal.intercept, modelTotal.coefs, values) * 100;
  const p_precoz = logitToP(modelPrecoz.intercept, modelPrecoz.coefs, values) * 100;
  const p_tardia = logitToP(modelTardia.intercept, modelTardia.coefs, values) * 100;

  return {
    level,
    imc,
    p_total,
    p_precoz,
    p_tardia,
    auc: AUC[level]
  };
}

// Helper to determine WHO BMI Category
export interface BmiCategoryInfo {
  labelEs: string;
  labelEn: string;
  color: string;
}

export function getBmiCategory(imc: number): BmiCategoryInfo {
  if (imc < 18.5) {
    return { labelEs: 'Bajo peso', labelEn: 'Underweight', color: '#854F0B' };
  }
  if (imc < 25.0) {
    return { labelEs: 'Normopeso', labelEn: 'Normal weight', color: '#0F6E56' };
  }
  if (imc < 30.0) {
    return { labelEs: 'Sobrepeso', labelEn: 'Overweight', color: '#854F0B' };
  }
  if (imc < 35.0) {
    return { labelEs: 'Obesidad I', labelEn: 'Obesity Class I', color: '#A32D2D' };
  }
  if (imc < 40.0) {
    return { labelEs: 'Obesidad II', labelEn: 'Obesity Class II', color: '#A32D2D' };
  }
  return { labelEs: 'Obesidad III', labelEn: 'Obesity Class III', color: '#A32D2D' };
}
