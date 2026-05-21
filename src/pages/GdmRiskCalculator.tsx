import React, { useState } from 'react';
import { Typography } from '../components/ui/Typography';
import { Badge } from '../components/ui/Badge';
import { CopyrightCC } from '../components/ui/CopyrightCC';
import { useLanguage } from '../contexts/LanguageContext';
import { calculateGdmRisk, getBmiCategory } from '../data/calculators/gdmRisk';
import { exportGdmRiskPDF } from '../utils/pdfExport';
import type { GdmRiskInput } from '../data/calculators/gdmRisk';

// ─── Translations Object ──────────────────────────────────────────────────────
const T = {
  es: {
    title: 'Calculadora de Riesgo de Diabetes Gestacional (GDM)',
    subtitle: 'Evaluación individualizada del riesgo de diabetes gestacional precoz y tardía',
    cohortInfo: 'Modelo de regresión logística desarrollado sobre la cohorte del Hospital Universitario Puerto Real (2020-2025, n=3.981, prevalencia 6,0%).',
    clinicalSection: 'A. Datos clínicos básicos (Obligatorios)',
    labsSection: 'B. Analítica de primer trimestre (Opcionales)',
    screeningSection: 'C. Cribado combinado de primer trimestre (Opcionales)',
    age: 'Edad materna (años)',
    weight: 'Peso pregestacional (kg)',
    height: 'Talla (cm)',
    imc: 'IMC calculado',
    familyHistory: 'Antecedente familiar de diabetes',
    parity: 'Paridad',
    primigesta: 'Primigesta',
    multipara: 'Multípara (≥1 parto previo)',
    glucose: 'Glucosa basal 1T (mg/dL)',
    hba1c: 'HbA1c 1T (%)',
    pappa: 'PAPP-A 1T (MoM)',
    freeBhcg: 'β-hCG libre 1T (MoM)',
    yes: 'Sí',
    no: 'No',
    calculate: 'Calcular riesgo',
    reset: 'Limpiar',
    resultsTitle: 'RESULTADO DE RIESGO DE DIABETES GESTACIONAL',
    totalGdm: 'Riesgo GDM Total',
    earlyGdm: 'Riesgo GDM Precoz',
    lateGdm: 'Riesgo GDM Tardía',
    activeModel: 'Modelo activo',
    recommendationTitle: 'Recomendación clínica',
    validationError: 'Por favor, corrija los campos marcados.',
    disclaimer: 'Esta calculadora está diseñada para uso EXCLUSIVO DE PROFESIONALES SANITARIOS. La información arrojada debe ser siempre interpretada por un profesional y no sustituye la consulta médica ni el protocolo de cribado estándar. Los autores no se hacen responsables del uso inapropiado.',
    enterDataPrompt: 'Introduzca los datos obligatorios del paciente para calcular la estimación del riesgo.',
    pdfButton: 'Exportar a PDF',
    standardScreening: 'Cribado estándar (O\'Sullivan 24-28 sem)',
    activeSurveillance: 'Vigilancia activa, medidas higiénico-dietéticas reforzadas',
    earlyScreening: 'Considerar O\'Sullivan anticipado en 1T',
  },
  en: {
    title: 'Gestational Diabetes Mellitus (GDM) Risk Calculator',
    subtitle: 'Individualized risk assessment for early and late gestational diabetes',
    cohortInfo: 'Logistic regression model developed on the Hospital Universitario Puerto Real cohort (2020-2025, n=3,981, prevalence 6.0%).',
    clinicalSection: 'A. Basic Clinical Data (Mandatory)',
    labsSection: 'B. First Trimester Lab Work (Optional)',
    screeningSection: 'C. First Trimester Combined Screening (Optional)',
    age: 'Maternal age (years)',
    weight: 'Pregestational weight (kg)',
    height: 'Height (cm)',
    imc: 'Calculated BMI',
    familyHistory: 'Diabetes family history',
    parity: 'Parity',
    primigesta: 'Primiparous',
    multipara: 'Multiparous (≥1 prior birth)',
    glucose: 'Fasting glucose 1T (mg/dL)',
    hba1c: 'HbA1c 1T (%)',
    pappa: 'PAPP-A 1T (MoM)',
    freeBhcg: 'Free β-hCG 1T (MoM)',
    yes: 'Yes',
    no: 'No',
    calculate: 'Calculate risk',
    reset: 'Reset',
    resultsTitle: 'GESTATIONAL DIABETES RISK ASSESSMENT',
    totalGdm: 'Total GDM Risk',
    earlyGdm: 'Early GDM Risk',
    lateGdm: 'Late GDM Risk',
    activeModel: 'Active model',
    recommendationTitle: 'Clinical recommendation',
    validationError: 'Please check the highlighted fields.',
    disclaimer: 'This calculator is designed for the EXCLUSIVE USE OF HEALTHCARE PROFESSIONALS. The information provided must always be interpreted by a professional and does not replace medical consultation or standard screening protocols. The authors are not responsible for inappropriate use.',
    enterDataPrompt: 'Enter mandatory patient data to calculate risk estimation.',
    pdfButton: 'Export to PDF',
    standardScreening: 'Standard screening (O\'Sullivan 24-28 weeks)',
    activeSurveillance: 'Active surveillance, reinforced lifestyle measures',
    earlyScreening: 'Consider early O\'Sullivan in 1T',
  }
};

// ─── Input Styles ─────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  backgroundColor: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-primary)',
  fontSize: '0.9rem',
};

// ─── Field Wrapper Component ──────────────────────────────────────────────────
const Field: React.FC<{ label: string; children: React.ReactNode; error?: string }> = ({ label, children, error }) => (
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', marginBottom: 'var(--space-sm)' }}>
    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
      {label}
    </label>
    {children}
    {error && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '2px' }}>{error}</span>}
  </div>
);

// ─── Helper to determine risk colors and labels ──────────────────────────────
interface RiskStyle {
  color: string;
  bg: string;
  label: string;
}

function getRiskStyles(p: number, lang: 'es' | 'en'): RiskStyle {
  if (p < 5) {
    return {
      color: '#0F6E56',
      bg: '#E1F5EE',
      label: lang === 'es' ? 'BAJO' : 'LOW'
    };
  }
  if (p <= 10) {
    return {
      color: '#854F0B',
      bg: '#FAEEDA',
      label: lang === 'es' ? 'INTERMEDIO' : 'INTERMEDIATE'
    };
  }
  return {
    color: '#A32D2D',
    bg: '#FCEBEB',
    label: lang === 'es' ? 'ALTO' : 'HIGH'
  };
}

export const GdmRiskCalculator: React.FC = () => {
  const { language } = useLanguage();
  const t = T[language];

  // ── Form State ──────────────────────────────────────────────────────────────
  const [age, setAge] = useState<number>(30);
  const [weight, setWeight] = useState<string>('65');
  const [height, setHeight] = useState<string>('165');
  const [familyHistory, setFamilyHistory] = useState<boolean>(false);
  const [multipara, setMultipara] = useState<boolean>(false);

  // Optional Labs
  const [glucose, setGlucose] = useState<string>('');
  const [hba1c, setHba1c] = useState<string>('');

  // Optional Screening
  const [pappa, setPappa] = useState<string>('');
  const [freeBhcg, setFreeBhcg] = useState<string>('');

  // ── Output/Validation State ──────────────────────────────────────────────────
  const [result, setResult] = useState<ReturnType<typeof calculateGdmRisk> | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string>('');

  // Real-time IMC Calculation
  const wNum = parseFloat(weight);
  const hNum = parseFloat(height);
  const imcVal = (wNum && hNum) ? wNum / Math.pow(hNum / 100, 2) : 0;
  const bmiInfo = imcVal ? getBmiCategory(imcVal) : null;

  // ── Action Handlers ─────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    setGlobalError('');

    // Age Check
    if (age < 14 || age > 55) {
      errors.age = language === 'es' ? 'Rango válido: 14–55 años' : 'Valid range: 14–55 years';
    }

    // Weight Check
    if (!weight || isNaN(wNum) || wNum < 30 || wNum > 200) {
      errors.weight = language === 'es' ? 'Rango válido: 30–200 kg' : 'Valid range: 30–200 kg';
    }

    // Height Check
    if (!height || isNaN(hNum) || hNum < 130 || hNum > 210) {
      errors.height = language === 'es' ? 'Rango válido: 130–210 cm' : 'Valid range: 130–210 cm';
    }

    // Optional Labs validation (only if filled)
    if (glucose) {
      const g = parseFloat(glucose);
      if (isNaN(g) || g < 40 || g > 200) {
        errors.glucose = language === 'es' ? 'Rango válido: 40–200 mg/dL' : 'Valid range: 40–200 mg/dL';
      }
    }
    if (hba1c) {
      const h = parseFloat(hba1c);
      if (isNaN(h) || h < 3.0 || h > 10.0) {
        errors.hba1c = language === 'es' ? 'Rango válido: 3,0–10,0%' : 'Valid range: 3.0–10.0%';
      }
    }

    // Optional Screening validation
    if (pappa) {
      const p = parseFloat(pappa);
      if (isNaN(p) || p < 0.1 || p > 5.0) {
        errors.pappa = language === 'es' ? 'Rango válido: 0,1–5,0 MoM' : 'Valid range: 0.1–5.0 MoM';
      }
    }
    if (freeBhcg) {
      const b = parseFloat(freeBhcg);
      if (isNaN(b) || b < 0.1 || b > 5.0) {
        errors.freeBhcg = language === 'es' ? 'Rango válido: 0,1–5,0 MoM' : 'Valid range: 0.1–5.0 MoM';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCalculate = () => {
    if (!validateForm()) {
      setGlobalError(t.validationError);
      return;
    }

    const inputData: GdmRiskInput = {
      age,
      weight: wNum,
      height: hNum,
      familyHistory,
      multipara,
      glucose: glucose ? parseFloat(glucose) : null,
      hba1c: hba1c ? parseFloat(hba1c) : null,
      pappa: pappa ? parseFloat(pappa) : null,
      freeBhcg: freeBhcg ? parseFloat(freeBhcg) : null,
    };

    const calculation = calculateGdmRisk(inputData);
    setResult(calculation);
  };

  const handleReset = () => {
    setAge(30);
    setWeight('65');
    setHeight('165');
    setFamilyHistory(false);
    setMultipara(false);
    setGlucose('');
    setHba1c('');
    setPappa('');
    setFreeBhcg('');
    setResult(null);
    setValidationErrors({});
    setGlobalError('');
  };

  const handleExportPDF = () => {
    if (!result) return;
    const inputData: GdmRiskInput = {
      age,
      weight: wNum,
      height: hNum,
      familyHistory,
      multipara,
      glucose: glucose ? parseFloat(glucose) : null,
      hba1c: hba1c ? parseFloat(hba1c) : null,
      pappa: pappa ? parseFloat(pappa) : null,
      freeBhcg: freeBhcg ? parseFloat(freeBhcg) : null,
    };
    exportGdmRiskPDF(inputData, result, language);
  };

  // Determine integrated recommendation text and styling
  const getRecommendation = () => {
    if (!result) return { text: '', color: '#0F6E56', bg: '#E1F5EE', label: '' };
    if (result.p_precoz > 10) {
      return {
        text: t.earlyScreening + '. ' + (language === 'es' 
          ? 'Riesgo alto de DG precoz. Considerar O\'Sullivan anticipado en el primer trimestre y, si positivo, OGTT confirmatoria precoz. Iniciar intervención sobre estilo de vida sin esperar al cribado convencional.'
          : 'High risk of early GDM. Consider early O\'Sullivan test in the first trimester and, if positive, early confirmatory OGTT. Initiate lifestyle intervention without waiting for conventional screening.'),
        color: '#A32D2D',
        bg: '#FCEBEB',
        label: t.earlyScreening
      };
    }
    if (result.p_precoz > 5 || result.p_total > 10) {
      return {
        text: t.activeSurveillance + '. ' + (language === 'es' 
          ? 'Riesgo intermedio. Vigilancia activa y refuerzo de medidas higiénico-dietéticas. Considerar adelantar el cribado de 24-28 semanas si concurren otros factores clínicos.'
          : 'Intermediate risk. Active surveillance and reinforcement of hygienic-dietary measures. Consider advancing the 24-28 week screening if other clinical factors concur.'),
        color: '#854F0B',
        bg: '#FAEEDA',
        label: t.activeSurveillance
      };
    }
    return {
      text: t.standardScreening + '. ' + (language === 'es'
        ? 'Riesgo bajo. Cribado de O\'Sullivan según protocolo estándar (semanas 24-28). Mantener recomendaciones generales de control del embarazo.'
        : 'Low risk. O\'Sullivan screening according to standard protocol (weeks 24-28). Maintain general pregnancy control recommendations.'),
      color: '#0F6E56',
      bg: '#E1F5EE',
      label: t.standardScreening
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>
      {/* ── HEADER ────────────────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-xl)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-xl)' }}>
        <Typography variant="caption" className="text-green" style={{ letterSpacing: '0.05em', fontWeight: 'bold' }}>
          PERINATOLOGY
        </Typography>
        <Typography variant="h1" style={{ fontSize: '2rem', marginTop: 'var(--space-xs)' }}>
          {t.title}
        </Typography>
        <Typography variant="body1" className="text-secondary" style={{ marginTop: 'var(--space-xs)' }}>
          {t.subtitle}
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 'var(--space-lg)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          <div style={{ maxWidth: '80%', lineHeight: '1.4' }}>
            {t.cohortInfo}
            <br/>
            <em>Hospital Universitario Puerto Real · Cádiz, España · v1 (2026)</em>
          </div>
          <CopyrightCC />
        </div>
      </div>

      {/* ── TWO COLUMN GRID ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) 1.5fr', gap: 'var(--space-2xl)', alignItems: 'start' }}>
        
        {/* ── COLUMN 1: INPUTS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          
          {/* SECTION A: Basic Clinical */}
          <div className="card" style={{ padding: 'var(--space-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)' }}>
            <Typography variant="h3" className="text-green" style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              {t.clinicalSection}
            </Typography>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              
              <Field label={t.age} error={validationErrors.age}>
                <input
                  type="range" min={14} max={55} step={1} value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-accent-green)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-accent-green)', fontWeight: 'bold', marginTop: '2px' }}>
                  {age} {language === 'es' ? 'años' : 'years'}
                </span>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Field label={t.weight} error={validationErrors.weight}>
                  <input
                    type="number" step="0.1" value={weight}
                    onChange={e => setWeight(e.target.value)}
                    style={inputStyle}
                  />
                </Field>
                <Field label={t.height} error={validationErrors.height}>
                  <input
                    type="number" step="1" value={height}
                    onChange={e => setHeight(e.target.value)}
                    style={inputStyle}
                  />
                </Field>
              </div>

              {/* BMI Real-time Feedback */}
              {bmiInfo && (
                <div style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--color-bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '2px',
                  borderLeft: `3px solid ${bmiInfo.color}`
                }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{t.imc}:</span>
                  <strong style={{ color: bmiInfo.color }}>
                    {imcVal.toFixed(1)} kg/m² ({language === 'es' ? bmiInfo.labelEs : bmiInfo.labelEn})
                  </strong>
                </div>
              )}

              <Field label={t.familyHistory}>
                <select value={familyHistory ? 'yes' : 'no'} onChange={e => setFamilyHistory(e.target.value === 'yes')} style={inputStyle}>
                  <option value="no">{t.no}</option>
                  <option value="yes">{t.yes}</option>
                </select>
              </Field>

              <Field label={t.parity}>
                <select value={multipara ? 'yes' : 'no'} onChange={e => setMultipara(e.target.value === 'yes')} style={inputStyle}>
                  <option value="no">{t.primigesta}</option>
                  <option value="yes">{t.multipara}</option>
                </select>
              </Field>
            </div>
          </div>

          {/* SECTION B: Optional Labs */}
          <div className="card" style={{ padding: 'var(--space-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)' }}>
            <Typography variant="h3" style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              {t.labsSection}
            </Typography>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Field label={t.glucose} error={validationErrors.glucose}>
                <input
                  type="number" step="1" value={glucose} placeholder="Ex: 85"
                  onChange={e => setGlucose(e.target.value)}
                  style={inputStyle}
                />
              </Field>
              <Field label={t.hba1c} error={validationErrors.hba1c}>
                <input
                  type="number" step="0.1" value={hba1c} placeholder="Ex: 5.4"
                  onChange={e => setHba1c(e.target.value)}
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>

          {/* SECTION C: Optional Screening */}
          <div className="card" style={{ padding: 'var(--space-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)' }}>
            <Typography variant="h3" style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              {t.screeningSection}
            </Typography>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Field label={t.pappa} error={validationErrors.pappa}>
                <input
                  type="number" step="0.01" value={pappa} placeholder="Ex: 0.9"
                  onChange={e => setPappa(e.target.value)}
                  style={inputStyle}
                />
              </Field>
              <Field label={t.freeBhcg} error={validationErrors.freeBhcg}>
                <input
                  type="number" step="0.01" value={freeBhcg} placeholder="Ex: 1.0"
                  onChange={e => setFreeBhcg(e.target.value)}
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>

          {/* BUTTONS */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleCalculate} style={{
              flexGrow: 2,
              backgroundColor: 'var(--color-accent-green)', color: '#0a0e17', padding: '12px',
              borderRadius: 'var(--radius-md)', fontWeight: 'bold', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s', fontSize: '1rem',
            }}>
              {t.calculate}
            </button>
            <button onClick={handleReset} style={{
              flexGrow: 1,
              backgroundColor: 'transparent', color: 'var(--color-text-secondary)', padding: '12px',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', cursor: 'pointer',
              transition: 'background 0.2s', fontSize: '0.9rem',
            }}>
              {t.reset}
            </button>
          </div>

          {globalError && (
            <Typography variant="body2" style={{ color: '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>
              {globalError}
            </Typography>
          )}
        </div>

        {/* ── COLUMN 2: RESULTS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {result ? (
            <>
              {/* RESULTS CARD */}
              <div className="card" style={{
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                borderColor: recommendation.color
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                  <Typography variant="h3" style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                    {t.resultsTitle}
                  </Typography>
                  <Badge variant="solid" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-accent-green)' }}>
                    {t.activeModel}: {result.level}
                  </Badge>
                </div>

                {/* 3 RISK METRICS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                  {[
                    { label: t.totalGdm, value: result.p_total },
                    { label: t.earlyGdm, value: result.p_precoz },
                    { label: t.lateGdm, value: result.p_tardia }
                  ].map((r, idx) => {
                    const rStyle = getRiskStyles(r.value, language);
                    const amplifiedWidth = Math.min(r.value * 3, 100); // 3x visual multiplier as requested by spec
                    
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{r.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '1.25rem', color: rStyle.color }}>{r.value.toFixed(1)}%</strong>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: rStyle.bg,
                              color: rStyle.color
                            }}>{rStyle.label}</span>
                          </div>
                        </div>
                        
                        {/* Amplified Progress Bar */}
                        <div style={{ height: '8px', backgroundColor: 'var(--color-bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${amplifiedWidth}%`,
                            backgroundColor: rStyle.color,
                            borderRadius: '4px',
                            transition: 'width 0.6s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  <span>0%</span>
                  <span>5% ({language === 'es' ? 'Límite' : 'Cutoff'})</span>
                  <span>10% ({language === 'es' ? 'Alto' : 'High'})</span>
                  <span>15%</span>
                  <span>20%+</span>
                </div>

                <div style={{ marginTop: 'var(--space-md)', padding: '6px 12px', borderTop: '1px solid var(--color-border)', fontSize: '0.72rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                  AUC Total: {result.auc.total.toFixed(3)} · Precoz: {result.auc.precoz.toFixed(3)} · Tardía: {result.auc.tardia.toFixed(3)}
                </div>
              </div>

              {/* RECOMMENDATION BLOCK */}
              <div className="card" style={{
                padding: 'var(--space-lg)',
                backgroundColor: recommendation.bg,
                borderLeft: `4px solid ${recommendation.color}`,
                borderRadius: 'var(--radius-sm)'
              }}>
                <Typography variant="h3" style={{ color: recommendation.color, fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 'var(--space-xs)' }}>
                  {t.recommendationTitle}
                </Typography>
                <Typography variant="body2" style={{ color: '#0f172a', lineHeight: 1.5, fontWeight: 500 }}>
                  {recommendation.text}
                </Typography>
              </div>

              {/* PDF BUTTON */}
              <button onClick={handleExportPDF} style={{
                backgroundColor: '#546E7A', color: 'white', padding: '12px',
                borderRadius: 'var(--radius-md)', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                transition: 'background 0.2s', width: '100%', fontSize: '1rem',
              }}>
                {t.pdfButton}
              </button>

              {/* DISCLAIMER */}
              <div style={{ padding: '0 var(--space-xs)', opacity: 0.7 }}>
                <Typography variant="caption" style={{ fontStyle: 'italic', fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: '1.4', display: 'block' }}>
                  {t.disclaimer}
                </Typography>
              </div>
            </>
          ) : (
            <div className="card" style={{
              padding: 'var(--space-3xl)',
              textAlign: 'center',
              opacity: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '350px',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)'
            }}>
              <Typography variant="body1">
                {t.enterDataPrompt}
              </Typography>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
