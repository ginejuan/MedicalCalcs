// src/data/calculators/fetalWeightLogic.ts
// Mathematical logic for Customized Fetal Weight Percentile Calculator
// Method: Fernández-Alba JJ et al. Fetal Diagn Ther. 2016;39(3):198-208.

export const CV_PESO = 0.12;

export function peso40(pc: number, tM: number, sex: number, par: number): number {
  return 1597.43 + 6.71 * pc + 7.59 * tM + 121.27 * sex + 41.19 * par;
}

export function gardosiProp(eg: number): number {
  return 299.1 - 31.85 * eg + 1.094 * eg * eg - 0.01055 * eg * eg * eg;
}

export function corregirPeso(pesoKg: number, tallaCm: number): number {
  const tM = tallaCm / 100;
  const imc = pesoKg / (tM * tM);
  if (imc >= 30) return 30 * tM * tM;
  if (imc < 18.5) return 18.5 * tM * tM;
  return pesoKg;
}

// Standard normal CDF (Abramowitz & Stegun)
export function normCdf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const tt = 1 / (1 + p * x);
  const y = 1 - (((((a5 * tt + a4) * tt) + a3) * tt + a2) * tt + a1) * tt * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

// Inverse normal CDF
export function normInv(p: number): number {
  if (p <= 0) return -Infinity; 
  if (p >= 1) return Infinity; 
  if (p === 0.5) return 0;
  
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0, -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0, 3.754408661907416e0];
  const pLow = 0.02425, pHigh = 1 - pLow; 
  let q, r;
  
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}

export type FetalWeightInput = {
  egDecimal: number;
  efw: number;
  sexo: number; // 1 = male, 0 = female
  tallaM: number;
  pesoPreg: number;
  paridad: number; // 0 = nulliparous, 1 = multiparous
};

export type FetalWeightResult = {
  pesoCorr: number;
  pesoEst: number;
  z: number;
  percentil: number;
  classificationRaw: 'iugr' | 'sga' | 'aga' | 'lga';
};

export function computePercentile(input: FetalWeightInput): FetalWeightResult {
  const { egDecimal, efw, sexo, tallaM, pesoPreg, paridad } = input;
  const pesoCorr = corregirPeso(pesoPreg, tallaM);
  const p40 = peso40(pesoCorr, tallaM, sexo, paridad);

  // Expected weight at actual GA
  const pesoEst = p40 * gardosiProp(egDecimal) / gardosiProp(40);

  const z = (efw / pesoEst - 1) / CV_PESO;
  const percentil = normCdf(z) * 100;

  let classificationRaw: 'iugr' | 'sga' | 'aga' | 'lga' = 'aga';
  if (percentil < 3) classificationRaw = 'iugr';
  else if (percentil < 10) classificationRaw = 'sga';
  else if (percentil > 90) classificationRaw = 'lga';

  return { pesoCorr, pesoEst, z, percentil, classificationRaw };
}

export function expectedWeightAtGa(ga: number, pesoCorr: number, tallaM: number, sexo: number, paridad: number): number {
  const p40v = peso40(pesoCorr, tallaM, sexo, paridad);
  return p40v * gardosiProp(ga) / gardosiProp(40);
}
