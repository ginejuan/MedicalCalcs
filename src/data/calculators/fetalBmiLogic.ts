// src/data/calculators/fetalBmiLogic.ts
// Mathematical logic for Customized Fetal BMI Percentile Calculator
// Method: Fernández Alba JJ et al. Diagnostics. 2025;15(7):877.

export const CV_IMC = 0.097;

export function peso40(pc: number, tM: number, sex: number, par: number): number {
  return 1597.43 + 6.71 * pc + 7.59 * tM + 121.27 * sex + 41.19 * par;
}

export function talla40(pc: number, tM: number, sex: number, age: number): number {
  return 41.075 + 0.020 * pc + 0.040 * tM + 0.791 * sex + 0.014 * age;
}

export function gardosiProp(eg: number): number {
  return 299.1 - 31.85 * eg + 1.094 * eg * eg - 0.01055 * eg * eg * eg;
}

export function lengthProp(eg: number, sex: number): number {
  return sex === 1
    ? -71.79 + 8.06 * eg - 0.12 * eg * eg + 0.00056 * eg * eg * eg
    : -72.46 + 8.19 * eg - 0.12 * eg * eg + 0.0006 * eg * eg * eg;
}

export function corregirPeso(pesoKg: number, tallaCm: number): number {
  const tM = tallaCm / 100;
  const imc = pesoKg / (tM * tM);
  if (imc >= 30) return 30 * tM * tM;
  if (imc < 18.5) return 18.5 * tM * tM;
  return pesoKg;
}

export function normCdf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const tt = 1 / (1 + p * x);
  const y = 1 - (((((a5 * tt + a4) * tt) + a3) * tt + a2) * tt + a1) * tt * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

export type FetalBmiInput = {
  egDecimal: number;
  efw: number;
  sexo: number; // 1 = male, 0 = female
  tallaM: number;
  pesoPreg: number;
  paridad: number; // 0 = nulliparous, 1 = multiparous
  edad: number;
};

export type FetalBmiResult = {
  pesoCorr: number;
  pesoEst: number;
  tallaEst: number;
  imcEst: number;
  imcObs: number;
  z: number;
  percentil: number;
  classificationRaw: 'iugr' | 'sga' | 'aga' | 'lga';
};

export function computePercentile(input: FetalBmiInput): FetalBmiResult {
  const { egDecimal, efw, sexo, tallaM, pesoPreg, paridad, edad } = input;
  const pesoCorr = corregirPeso(pesoPreg, tallaM);
  const p40 = peso40(pesoCorr, tallaM, sexo, paridad);
  const t40 = talla40(pesoCorr, tallaM, sexo, edad);

  // Expected weight & length at actual GA
  const pesoEst = p40 * gardosiProp(egDecimal) / gardosiProp(40);
  const tallaEst = t40 * lengthProp(egDecimal, sexo) / lengthProp(40, sexo);

  // Expected BMI (both weight and length from model)
  const imcEst = (pesoEst / 1000) / Math.pow(tallaEst / 100, 2);
  // Observed BMI (EFW from ultrasound, length from model)
  const imcObs = (efw / 1000) / Math.pow(tallaEst / 100, 2);

  const z = (imcObs / imcEst - 1) / CV_IMC;
  const percentil = normCdf(z) * 100;

  let classificationRaw: 'iugr' | 'sga' | 'aga' | 'lga' = 'aga';
  if (percentil < 3) classificationRaw = 'iugr';
  else if (percentil < 10) classificationRaw = 'sga';
  else if (percentil > 90) classificationRaw = 'lga';

  return { pesoCorr, pesoEst, tallaEst, imcEst, imcObs, z, percentil, classificationRaw };
}

export function expectedImcAtGa(ga: number, pesoCorr: number, tallaM: number, sexo: number, paridad: number, edad: number): number {
  const p40 = peso40(pesoCorr, tallaM, sexo, paridad);
  const t40 = talla40(pesoCorr, tallaM, sexo, edad);
  const pesoEst = p40 * gardosiProp(ga) / gardosiProp(40);
  const tallaEst = t40 * lengthProp(ga, sexo) / lengthProp(40, sexo);
  return (pesoEst / 1000) / Math.pow(tallaEst / 100, 2);
}
