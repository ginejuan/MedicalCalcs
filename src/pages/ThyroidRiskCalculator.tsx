import React, { useState } from 'react';
import { Typography } from '../components/ui/Typography';
import { Badge } from '../components/ui/Badge';
import { CopyrightCC } from '../components/ui/CopyrightCC';
import { useLanguage } from '../contexts/LanguageContext';
import { calculateThyroidRisk } from '../data/calculators/thyroidRisk';
import { exportThyroidRiskPDF } from '../utils/pdfExport';
import type { ThyroidRiskInput, Echogenicity, Calcifications, Consistency } from '../data/calculators/thyroidRisk';

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Thresholds from Diagnostics 2025 external validation:
//   4.94 = maximum-sensitivity threshold
//   9.55 = optimal cut-off (Youden)

type RiskZone = 'benign' | 'low' | 'intermediate' | 'high';

function getRiskZone(risk: number, isBenign: boolean): RiskZone {
  if (isBenign) return 'benign';
  if (risk < 4.94) return 'low';
  if (risk < 9.55) return 'intermediate';
  return 'high';
}

function getRiskColor(risk: number, isBenign: boolean): string {
  const z = getRiskZone(risk, isBenign);
  if (z === 'benign' || z === 'low') return 'var(--color-accent-green)';
  if (z === 'intermediate')          return '#eab308';
  return '#ef4444';
}

function getRiskLabel(risk: number, isBenign: boolean, lang: 'en' | 'es'): string {
  const z = getRiskZone(risk, isBenign);
  if (z === 'benign')       return lang === 'en' ? 'BENIGN (CYSTIC)'   : 'BENIGNO (QUÍSTICO)';
  if (z === 'low')          return lang === 'en' ? 'LOW RISK'          : 'RIESGO BAJO';
  if (z === 'intermediate') return lang === 'en' ? 'INTERMEDIATE RISK' : 'RIESGO INTERMEDIO';
  return                           lang === 'en' ? 'HIGH RISK'         : 'RIESGO ALTO';
}

// ─── Clinical interpretation card (3-zone stratification) ────────────────────
const RiskInterpretation: React.FC<{ risk: number; language: 'en' | 'es' }> = ({ risk, language }) => {
  const zone: Exclude<RiskZone, 'benign'> = risk < 4.94 ? 'low' : risk < 9.55 ? 'intermediate' : 'high';
  const zoneColor = zone === 'low' ? 'var(--color-accent-green)' : zone === 'intermediate' ? '#eab308' : '#ef4444';

  const zoneTitle =
    zone === 'low'          ? (language === 'en' ? 'Low risk'          : 'Riesgo bajo')
    : zone === 'intermediate' ? (language === 'en' ? 'Intermediate risk' : 'Riesgo intermedio')
                              : (language === 'en' ? 'High risk'         : 'Riesgo alto');

  const interpretation =
    zone === 'low'
      ? (language === 'en'
          ? 'Low risk of malignancy. Within this range, the model provides no net clinical benefit over the standard strategy.'
          : 'Bajo riesgo de malignidad. En este rango, el modelo no aporta beneficio clínico neto sobre la estrategia estándar.')
      : zone === 'intermediate'
        ? (language === 'en'
            ? 'Uncertainty zone. Above the maximum-sensitivity threshold (4.94%) but below the optimal cut-off (9.55%). The decision should be individualized based on the clinical context and patient preference.'
            : 'Zona de incertidumbre. Por encima del umbral de máxima sensibilidad (4,94%) pero por debajo del punto de corte óptimo (9,55%). La decisión debe individualizarse según el contexto clínico y la preferencia del paciente.')
        : (language === 'en'
            ? 'High risk of malignancy. Consider FNA or thyroidectomy according to clinical indication and ATA criteria.'
            : 'Alto riesgo de malignidad. Considerar PAAF o tiroidectomía según indicación clínica y criterios ATA.');

  const metrics =
    zone === 'high'
      ? (language === 'en'
          ? 'Sensitivity 71.4% · Specificity 82.4% at the optimal cut-off of 9.55%'
          : 'Sensibilidad 71,4% · Especificidad 82,4% al punto de corte óptimo de 9,55%')
      : (language === 'en'
          ? 'Sensitivity 80.6% · Specificity 70.9% at the alternative threshold of 4.94%'
          : 'Sensibilidad 80,6% · Especificidad 70,9% al umbral alternativo de 4,94%');

  const disclaimer = language === 'en'
    ? 'This tool supports clinical decision-making but does not replace it. Clinician judgment prevails.'
    : 'Esta herramienta apoya la decisión clínica, no la sustituye. El juicio del facultativo prevalece.';

  return (
    <div className="card" style={{ padding: 'var(--space-lg)', borderLeft: `3px solid ${zoneColor}` }}>
      <Typography variant="h3" style={{ color: zoneColor, marginBottom: 'var(--space-sm)', fontSize: '0.95rem', fontWeight: 'bold', letterSpacing: '0.03em' }}>
        {language === 'en' ? 'Clinical interpretation' : 'Interpretación clínica'} · {zoneTitle}
      </Typography>
      <Typography variant="body2" style={{ marginBottom: 'var(--space-md)', lineHeight: 1.5 }}>
        {interpretation}
      </Typography>
      <Typography variant="body2" style={{ color: 'var(--color-text-secondary)', fontSize: '0.78rem', marginBottom: 'var(--space-sm)' }}>
        {metrics}
      </Typography>
      <Typography variant="caption" style={{ fontStyle: 'italic', fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--color-border)' }}>
        {disclaimer}
      </Typography>
    </div>
  );
};

// ─── Input Style (shared) ─────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  backgroundColor: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-primary)',
  fontSize: '0.9rem',
  appearance: 'none' as const,
};

// ─── Field wrapper component ──────────────────────────────────────────────────
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
      {label}
    </label>
    {children}
  </div>
);

// ─── Page component ───────────────────────────────────────────────────────────
export const ThyroidRiskCalculator: React.FC = () => {
  const { language } = useLanguage();

  // Patient characteristics
  const [age,            setAge]            = useState<number>(45);
  const [sex,            setSex]            = useState<'female' | 'male'>('female');
  const [familyHistory,  setFamilyHistory]  = useState<boolean>(false);
  const [tsh,            setTsh]            = useState<number>(2);
  const [thyroiditis,    setThyroiditis]    = useState<boolean>(false);

  // Nodule characteristics
  const [diameter,        setDiameter]        = useState<number>(10);
  const [consistency,     setConsistency]     = useState<Consistency>('mixed');
  const [echogenicity,    setEchogenicity]    = useState<Echogenicity>('isoHyper');
  const [irregularMargins, setIrregularMargins] = useState<boolean>(false);
  const [calcifications,  setCalcifications]  = useState<Calcifications>('no');
  const [tallerThanWide,  setTallerThanWide]  = useState<boolean>(false);
  const [suspiciousNode,  setSuspiciousNode]  = useState<boolean>(false);

  const [result, setResult] = useState<ReturnType<typeof calculateThyroidRisk> | null>(null);
  const [error,  setError]  = useState<string>('');

  // Auto-lock cystic fields (mirrors Shiny reactive behaviour)
  const isCysticLocked = consistency === 'cystic' || echogenicity === 'anechoic';

  function handleCalculate() {
    setError('');
    if (age < 16 || age > 89)         { setError('Age must be between 16 and 89 years.'); return; }
    if (tsh < 0 || tsh > 30)          { setError('TSH must be between 0 and 30 mUI/L.'); return; }
    if (diameter < 1 || diameter > 80){ setError('Diameter must be between 1 and 80 mm.'); return; }

    const input: ThyroidRiskInput = {
      age, sex, familyHistory, tsh, thyroiditis, diameter,
      consistency:     isCysticLocked ? 'cystic'     : consistency,
      echogenicity:    isCysticLocked && echogenicity !== 'anechoic' ? echogenicity : echogenicity,
      irregularMargins: isCysticLocked ? false : irregularMargins,
      calcifications:  isCysticLocked ? 'no'         : calcifications,
      tallerThanWide:  isCysticLocked ? false         : tallerThanWide,
      suspiciousNode,
    };
    setResult(calculateThyroidRisk(input));
  }

  function handleExportPDF() {
    if (!result) return;
    exportThyroidRiskPDF(
      { age, sex, familyHistory, tsh, thyroiditis, diameter, consistency, echogenicity, irregularMargins, calcifications, tallerThanWide, suspiciousNode },
      result,
      language
    );
  }

  const riskColor = result ? getRiskColor(result.risk, result.isCysticBenign) : 'var(--color-accent-green)';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>

      {/* Header */}
      <div style={{ paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-xl)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-xl)' }}>
        <Typography variant="caption" className="text-gold" style={{ letterSpacing: '0.05em' }}>ENDOCRINOLOGY</Typography>
        <Typography variant="h1" style={{ fontSize: '2rem', marginTop: 'var(--space-xs)' }}>
          {language === 'en' ? 'Thyroid Nodule Malignancy Risk Calculator' : 'Calculadora de Riesgo de Malignidad de Nódulo Tiroideo'}
        </Typography>
        <Typography variant="body1" className="text-secondary" style={{ marginTop: 'var(--space-xs)' }}>
          {language === 'en' ? 'Individualized cancer risk assessment for thyroid nodules' : 'Evaluación individualizada del riesgo de cáncer en nódulos tiroideos'}
        </Typography>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 'var(--space-lg)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          <div style={{ maxWidth: '70%', lineHeight: '1.4' }}>
            Carral F, Fernández Alba JJ, Jiménez JM, et al.<br/>
            <em>Endocr Pract.</em> 2020;26(10):1077–1084. <a href="https://doi.org/10.4158/EP-2020-0053" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>doi:10.4158/EP-2020-0053</a>
            <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--color-border)' }}>
              <em>{language === 'en' ? 'External validation:' : 'Validación externa:'}</em><br/>
              Fernández Alba JJ, Carral F, Ayala Ortega C, et al.<br/>
              <em>Diagnostics.</em> 2025;15(6):686. <a href="https://doi.org/10.3390/diagnostics15060686" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>doi:10.3390/diagnostics15060686</a>
            </div>
          </div>
          <CopyrightCC />
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 'var(--space-2xl)', alignItems: 'start' }}>

        {/* ── INPUTS COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

          {/* Patient */}
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <Typography variant="h3" className="text-gold" style={{ marginBottom: 'var(--space-md)' }}>
              A. {language === 'en' ? 'Patient characteristics' : 'Características del paciente'}
            </Typography>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

              <Field label={`1. ${language === 'en' ? 'Age (years)' : 'Edad (años)'}`}>
                <input
                  type="range" min={16} max={89} step={1} value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-accent-gold)' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-accent-gold)', fontWeight: 'bold' }}>{age} {language === 'en' ? 'years' : 'años'}</span>
              </Field>

              <Field label={`2. ${language === 'en' ? 'Sex' : 'Sexo'}`}>
                <select value={sex} onChange={e => setSex(e.target.value as 'female' | 'male')} style={inputStyle}>
                  <option value="female">{language === 'en' ? 'Female' : 'Mujer'}</option>
                  <option value="male">{language === 'en' ? 'Male' : 'Hombre'}</option>
                </select>
              </Field>

              <Field label={`3. ${language === 'en' ? 'Family history (1st degree) of thyroid cancer' : 'Antecedente familiar (1.er grado) de cáncer de tiroides'}`}>
                <select value={familyHistory ? 'yes' : 'no'} onChange={e => setFamilyHistory(e.target.value === 'yes')} style={inputStyle}>
                  <option value="no">{language === 'en' ? 'No' : 'No'}</option>
                  <option value="yes">{language === 'en' ? 'Yes' : 'Sí'}</option>
                </select>
              </Field>

              <Field label={`4. ${language === 'en' ? 'TSH levels (mUI/L)' : 'Niveles de TSH (mUI/L)'}`}>
                <input
                  type="range" min={0} max={30} step={0.1} value={tsh}
                  onChange={e => setTsh(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-accent-gold)' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-accent-gold)', fontWeight: 'bold' }}>{tsh.toFixed(1)} mUI/L</span>
              </Field>

              <Field label={`5. ${language === 'en' ? 'Autoimmune thyroiditis (Tg-Ab or TPO-Ab positive)' : 'Tiroiditis autoinmune (Tg-Ab o TPO-Ab positivos)'}`}>
                <select value={thyroiditis ? 'yes' : 'no'} onChange={e => setThyroiditis(e.target.value === 'yes')} style={inputStyle}>
                  <option value="no">{language === 'en' ? 'No' : 'No'}</option>
                  <option value="yes">{language === 'en' ? 'Yes' : 'Sí'}</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Nodule */}
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <Typography variant="h3" className="text-gold" style={{ marginBottom: 'var(--space-md)' }}>
              B. {language === 'en' ? 'Nodule ultrasonographic characteristics' : 'Características ecográficas del nódulo'}
            </Typography>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

              <Field label={`1. ${language === 'en' ? 'Maximum diameter (mm)' : 'Diámetro máximo (mm)'}`}>
                <input
                  type="range" min={1} max={80} step={0.5} value={diameter}
                  onChange={e => setDiameter(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-accent-gold)' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-accent-gold)', fontWeight: 'bold' }}>{diameter} mm</span>
              </Field>

              <Field label={`2. ${language === 'en' ? 'Content' : 'Contenido'}`}>
                <select value={consistency} onChange={e => setConsistency(e.target.value as Consistency)} style={inputStyle}>
                  <option value="cystic">{language === 'en' ? 'Cystic' : 'Quístico'}</option>
                  <option value="mixed">{language === 'en' ? 'Mixed / Spongiform' : 'Mixto / Espongiforme'}</option>
                  <option value="solid">{language === 'en' ? 'Solid' : 'Sólido'}</option>
                </select>
              </Field>

              <Field label={`3. ${language === 'en' ? 'Echogenicity' : 'Ecogenicidad'}`}>
                <select value={echogenicity} onChange={e => setEchogenicity(e.target.value as Echogenicity)} style={inputStyle}>
                  <option value="anechoic">{language === 'en' ? 'Anechoic' : 'Anecoico'}</option>
                  <option value="isoHyper">{language === 'en' ? 'Isoechoic or Hyperechoic' : 'Isoecoico o Hiperecoico'}</option>
                  <option value="hypo">{language === 'en' ? 'Hypoechoic' : 'Hipoecoico'}</option>
                </select>
              </Field>

              <Field label={`4. ${language === 'en' ? 'Margins' : 'Márgenes'}`}>
                <select
                  value={isCysticLocked ? 'regular' : (irregularMargins ? 'irregular' : 'regular')}
                  onChange={e => setIrregularMargins(e.target.value === 'irregular')}
                  disabled={isCysticLocked}
                  style={{ ...inputStyle, opacity: isCysticLocked ? 0.5 : 1 }}
                >
                  <option value="regular">{language === 'en' ? 'Well-defined' : 'Bien definidos'}</option>
                  <option value="irregular">{language === 'en' ? 'Irregular (microlobulated or spiculated)' : 'Irregulares (microlobulados o espiculados)'}</option>
                </select>
              </Field>

              <Field label={`5. ${language === 'en' ? 'Calcifications' : 'Calcificaciones'}`}>
                <select
                  value={isCysticLocked ? 'no' : calcifications}
                  onChange={e => setCalcifications(e.target.value as Calcifications)}
                  disabled={isCysticLocked}
                  style={{ ...inputStyle, opacity: isCysticLocked ? 0.5 : 1 }}
                >
                  <option value="no">{language === 'en' ? 'No' : 'No'}</option>
                  <option value="macro">{language === 'en' ? 'Macrocalcifications' : 'Macrocalcificaciones'}</option>
                  <option value="micro">{language === 'en' ? 'Microcalcifications' : 'Microcalcificaciones'}</option>
                </select>
              </Field>

              <Field label={`6. ${language === 'en' ? 'Shape' : 'Forma'}`}>
                <select
                  value={isCysticLocked ? 'wider' : (tallerThanWide ? 'taller' : 'wider')}
                  onChange={e => setTallerThanWide(e.target.value === 'taller')}
                  disabled={isCysticLocked}
                  style={{ ...inputStyle, opacity: isCysticLocked ? 0.5 : 1 }}
                >
                  <option value="wider">{language === 'en' ? 'Oval (wider than tall)' : 'Ovalado (más ancho que alto)'}</option>
                  <option value="taller">{language === 'en' ? 'Taller than wide' : 'Más alto que ancho'}</option>
                </select>
              </Field>

              <Field label={`7. ${language === 'en' ? 'Suspicious lymph node' : 'Ganglio linfático sospechoso'}`}>
                <select value={suspiciousNode ? 'yes' : 'no'} onChange={e => setSuspiciousNode(e.target.value === 'yes')} style={inputStyle}>
                  <option value="no">{language === 'en' ? 'No' : 'No'}</option>
                  <option value="yes">{language === 'en' ? 'Yes' : 'Sí'}</option>
                </select>
              </Field>
            </div>
          </div>

          <button onClick={handleCalculate} style={{
            backgroundColor: 'var(--color-accent-gold)', color: '#0a0e17', padding: '12px',
            borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
            transition: 'background 0.2s', fontSize: '1rem',
          }}>
            {language === 'en' ? 'Calculate risk' : 'Calcular riesgo'}
          </button>

          {error && <Typography variant="body2" style={{ color: '#ef4444' }}>{error}</Typography>}

          {/* Statistical info */}
          <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
            <Typography variant="body2" style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.75rem' }}>
              {language === 'en'
                ? 'External validation (n = 455 patients): AUC = 0.84 (95% CI: 0.80–0.89). Sensitivity 71.4% · Specificity 82.4% at the optimal cut-off of 9.55%.'
                : 'Validación externa (n = 455 pacientes): AUC = 0,84 (IC 95%: 0,80–0,89). Sensibilidad 71,4% · Especificidad 82,4% al punto de corte óptimo de 9,55%.'}
            </Typography>
          </div>
        </div>

        {/* ── RESULTS COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {result ? (
            <>
              {/* Main result */}
              <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center', borderColor: riskColor }}>
                <Typography variant="caption" style={{ color: riskColor, fontWeight: 'bold', letterSpacing: '0.08em' }}>
                  {language === 'en' ? 'THYROID CANCER RISK' : 'RIESGO DE CÁNCER DE TIROIDES'}
                </Typography>

                <Typography variant="h1" style={{ fontSize: '4rem', color: riskColor, margin: 'var(--space-sm) 0', lineHeight: 1 }}>
                  {result.isCysticBenign ? '0' : result.risk.toFixed(1)}%
                </Typography>

                <Badge variant="solid" style={{ backgroundColor: riskColor, color: (!result.isCysticBenign && result.risk >= 9.55) ? 'white' : '#0a0e17' }}>
                  {getRiskLabel(result.risk, result.isCysticBenign, language)}
                </Badge>

                {/* Risk gauge bar */}
                <div style={{ marginTop: 'var(--space-lg)', height: '8px', background: 'var(--color-bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(result.risk, 100)}%`,
                    background: `linear-gradient(90deg, var(--color-accent-green) 0%, #eab308 40%, #f97316 70%, #ef4444 100%)`,
                    transition: 'width 0.6s ease',
                    backgroundSize: '300px 100%',
                    backgroundPosition: `${result.risk * -3}px 0`,
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                </div>
              </div>

              {/* Clinical alerts */}
              {(result.ataWarning || result.cysticMessage || result.nodeMessage) && (
                <div className="card" style={{ padding: 'var(--space-lg)', borderColor: '#f97316' }}>
                  <Typography variant="h3" style={{ color: '#f97316', marginBottom: 'var(--space-md)', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                    ⚠ {language === 'en' ? 'CLINICAL ALERT' : 'ALERTA CLÍNICA'}
                  </Typography>
                  {result.ataWarning   && <Typography variant="body2" style={{ marginBottom: 'var(--space-sm)' }}>{result.ataWarning}</Typography>}
                  {result.cysticMessage && <Typography variant="body2" style={{ marginBottom: 'var(--space-sm)', color: 'var(--color-accent-green)' }}>{result.cysticMessage}</Typography>}
                  {result.nodeMessage  && <Typography variant="body2" style={{ color: '#eab308' }}>{result.nodeMessage}</Typography>}
                </div>
              )}

              {/* Clinical interpretation (3-zone stratification from Diagnostics 2025) */}
              {!result.isCysticBenign && (
                <RiskInterpretation risk={result.risk} language={language} />
              )}

              {/* PDF export button */}
              <button onClick={handleExportPDF} style={{
                backgroundColor: '#546E7A', color: 'white', padding: '10px 16px',
                borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                transition: 'background 0.2s', marginTop: 'var(--space-sm)', width: '100%',
              }}>
                {language === 'en' ? 'Export to PDF' : 'Exportar a PDF'}
              </button>

              {/* Disclaimer */}
              <div className="card" style={{ padding: 'var(--space-lg)', opacity: 0.7 }}>
                <Typography variant="caption" style={{ fontStyle: 'italic', fontSize: '0.72rem', lineHeight: '1.5' }}>
                  {language === 'en'
                    ? 'This calculator is designed for USE EXCLUSIVELY BY HEALTH PROFESSIONALS. The information provided must always be interpreted by a healthcare professional and does not replace medical consultation or any diagnostic or therapeutic procedure. The authors are not responsible for inappropriate use of this calculator.'
                    : 'Esta calculadora está diseñada para uso EXCLUSIVO DE PROFESIONALES SANITARIOS. La información arrojada debe ser siempre interpretada por un profesional y no sustituye la consulta médica ni ninguna actuación diagnóstica ni terapéutica. Los autores no se hacen responsables del uso inapropiado de la misma.'}
                </Typography>
              </div>
            </>
          ) : (
            <div className="card" style={{ padding: 'var(--space-3xl)', textAlign: 'center', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <Typography variant="body1">
                {language === 'en'
                  ? 'Enter patient and nodule data, then press "Calculate risk"'
                  : 'Introduzca los datos del paciente y del nódulo y pulse "Calcular riesgo"'}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
