import React, { useState } from 'react';
import { Typography } from '../components/ui/Typography';
import { Badge } from '../components/ui/Badge';
import { CopyrightCC } from '../components/ui/CopyrightCC';
import { useLanguage } from '../contexts/LanguageContext';
import {
  IOTA_FEATURES,
  evaluateIOTA,
  emptyIotaAnswers,
} from '../data/calculators/iotaRules';
import type {
  IotaAnswers,
  IotaFeature,
  IotaFeatureId,
  IotaResult,
} from '../data/calculators/iotaRules';
import { exportIotaPDF } from '../utils/pdfExport';

// ─── Feature checkbox row ────────────────────────────────────────────────────
const FeatureRow: React.FC<{
  feature: IotaFeature;
  checked: boolean;
  onToggle: () => void;
  language: 'en' | 'es';
  accent: string;
}> = ({ feature, checked, onToggle, language, accent }) => (
  <label style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-sm)',
    padding: '10px 12px',
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm)',
    transition: 'background 0.15s, border-color 0.15s',
    background: checked ? `${accent}14` : 'var(--color-bg-surface)',
    border: `1px solid ${checked ? `${accent}66` : 'var(--color-border)'}`,
  }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onToggle}
      style={{
        marginTop: '3px',
        accentColor: accent,
        flexShrink: 0,
        width: '16px',
        height: '16px',
        cursor: 'pointer',
      }}
    />
    <span style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.85rem', lineHeight: 1.45 }}>
      <strong style={{ color: accent, minWidth: '22px', flexShrink: 0 }}>{feature.short}</strong>
      <span>{language === 'en' ? feature.en : feature.es}</span>
    </span>
  </label>
);

// ─── Page component ──────────────────────────────────────────────────────────
export const IotaCalculator: React.FC = () => {
  const { language } = useLanguage();
  const [answers, setAnswers] = useState<IotaAnswers>(emptyIotaAnswers);
  const [result,  setResult]  = useState<IotaResult | null>(null);

  const toggle = (id: IotaFeatureId) =>
    setAnswers(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCalculate = () => setResult(evaluateIOTA(answers));

  const handleReset = () => {
    setAnswers(emptyIotaAnswers());
    setResult(null);
  };

  const handleExportPDF = () => {
    if (!result) return;
    exportIotaPDF(answers, result, language);
  };

  const bFeatures = IOTA_FEATURES.filter(f => f.group === 'benign');
  const mFeatures = IOTA_FEATURES.filter(f => f.group === 'malignant');

  const benignColor    = 'var(--color-accent-green)';
  const malignantColor = '#ef4444';
  const amberColor     = '#eab308';

  const resultColor = result
    ? result.classification === 'benign'     ? benignColor
    : result.classification === 'malignant'  ? malignantColor
    : result.classification === 'inconclusive' ? amberColor
    : 'var(--color-text-secondary)'
    : 'var(--color-text-secondary)';

  const resultHeadline =
    result?.classification === 'benign'      ? (language === 'en' ? 'Suspected benign'       : 'Sospechoso de benignidad')
    : result?.classification === 'malignant' ? (language === 'en' ? 'Suspected malignant'    : 'Sospechoso de malignidad')
    : result?.classification === 'inconclusive' ? (language === 'en' ? 'Inconclusive'         : 'Indeterminado')
    :                                           (language === 'en' ? 'No features selected'  : 'Sin rasgos seleccionados');

  const clinicalNote =
    result?.classification === 'benign'
      ? (language === 'en'
          ? 'Only B-features are present. According to IOTA Simple Rules, this mass is classified as suspected benign. Clinical judgement must always prevail.'
          : 'Solo hay rasgos B presentes. Según las Reglas Simples IOTA, la masa se clasifica como sospechosa de benignidad. El juicio clínico debe siempre prevalecer.')
      : result?.classification === 'malignant'
        ? (language === 'en'
            ? 'Only M-features are present. According to IOTA Simple Rules, this mass is classified as suspected malignant. Refer for oncologic evaluation and staging.'
            : 'Solo hay rasgos M presentes. Según las Reglas Simples IOTA, la masa se clasifica como sospechosa de malignidad. Derivar para valoración oncológica y estadificación.')
        : result?.classification === 'inconclusive'
          ? (language === 'en'
              ? 'B and M features coexist — IOTA Simple Rules cannot classify this mass. Re-evaluate by an expert sonographer or apply a more extensive model (e.g. IOTA ADNEX).'
              : 'Coexisten rasgos B y M — las Reglas Simples IOTA no permiten clasificar esta masa. Revalorar por ecografista experto o aplicar un modelo más amplio (p. ej. IOTA ADNEX).')
          : (language === 'en'
              ? 'No features selected. Check the ultrasound findings that apply to the mass.'
              : 'No se ha marcado ningún rasgo. Marque los hallazgos ecográficos presentes en la masa.');

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>

      {/* Header */}
      <div style={{ paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-xl)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-xl)' }}>
        <Typography variant="caption" className="text-gold" style={{ letterSpacing: '0.05em' }}>
          {language === 'en' ? 'GYNECOLOGIC ONCOLOGY' : 'ONCOLOGÍA GINECOLÓGICA'}
        </Typography>
        <Typography variant="h1" style={{ fontSize: '2rem', marginTop: 'var(--space-xs)' }}>
          {language === 'en' ? 'IOTA Simple Rules (adnexal masses)' : 'Reglas Simples IOTA (masas anexiales)'}
        </Typography>
        <Typography variant="body1" className="text-secondary" style={{ marginTop: 'var(--space-xs)' }}>
          {language === 'en'
            ? 'Ultrasound-based classification of adnexal masses into benign, malignant or inconclusive'
            : 'Clasificación ecográfica de masas anexiales en benigna, maligna o indeterminada'}
        </Typography>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 'var(--space-lg)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          <div style={{ maxWidth: '70%', lineHeight: '1.4' }}>
            Timmerman D, Van Calster B, Testa A, et al.<br/>
            <em>Predicting the risk of malignancy in adnexal masses based on the Simple Rules from the International Ovarian Tumor Analysis group.</em><br/>
            Am J Obstet Gynecol. 2016;214(4):424–437. <a href="https://doi.org/10.1016/j.ajog.2015.09.104" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>doi:10.1016/j.ajog.2015.09.104</a>
          </div>
          <CopyrightCC />
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) 1fr', gap: 'var(--space-2xl)', alignItems: 'start' }}>

        {/* ── INPUTS COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

          {/* Benign features */}
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <Typography variant="h3" className="text-gold" style={{ marginBottom: 'var(--space-xs)' }}>
              {language === 'en' ? 'B-features (benign signs)' : 'Rasgos B (signos de benignidad)'}
            </Typography>
            <Typography variant="body2" className="text-secondary" style={{ fontSize: '0.78rem', marginBottom: 'var(--space-md)' }}>
              {language === 'en' ? 'Check every ultrasound finding present in the mass' : 'Marque cada hallazgo ecográfico presente en la masa'}
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {bFeatures.map(f => (
                <FeatureRow key={f.id} feature={f} checked={answers[f.id]} onToggle={() => toggle(f.id)} language={language} accent={benignColor} />
              ))}
            </div>
          </div>

          {/* Malignant features */}
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <Typography variant="h3" className="text-gold" style={{ marginBottom: 'var(--space-md)' }}>
              {language === 'en' ? 'M-features (malignant signs)' : 'Rasgos M (signos de malignidad)'}
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {mFeatures.map(f => (
                <FeatureRow key={f.id} feature={f} checked={answers[f.id]} onToggle={() => toggle(f.id)} language={language} accent={malignantColor} />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button onClick={handleCalculate} style={{
              flex: 1,
              backgroundColor: 'var(--color-accent-gold)', color: '#0a0e17', padding: '12px',
              borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s', fontSize: '1rem',
            }}>
              {language === 'en' ? 'Classify mass' : 'Clasificar masa'}
            </button>
            <button onClick={handleReset} style={{
              backgroundColor: 'transparent', color: 'var(--color-text-secondary)', padding: '12px 16px',
              borderRadius: '6px', border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '0.9rem',
            }}>
              {language === 'en' ? 'Clear' : 'Limpiar'}
            </button>
          </div>

          {/* Rule summary */}
          <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
            <Typography variant="body2" style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.75rem' }}>
              {language === 'en'
                ? 'Simple Rules: only M (no B) → malignant · only B (no M) → benign · both or neither → inconclusive.'
                : 'Reglas Simples: solo M (sin B) → maligno · solo B (sin M) → benigno · ambos o ninguno → indeterminado.'}
            </Typography>
          </div>
        </div>

        {/* ── RESULTS COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {result ? (
            <>
              {/* Main result */}
              <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center', borderColor: resultColor }}>
                <Typography variant="caption" style={{ color: resultColor, fontWeight: 'bold', letterSpacing: '0.08em' }}>
                  {language === 'en' ? 'IOTA SIMPLE RULES' : 'REGLAS SIMPLES IOTA'}
                </Typography>
                <Typography variant="h1" style={{ fontSize: '2rem', color: resultColor, margin: 'var(--space-sm) 0', lineHeight: 1.15 }}>
                  {resultHeadline}
                </Typography>
                <Badge variant="solid" style={{
                  backgroundColor: resultColor,
                  color: result.classification === 'malignant' ? 'white' : '#0a0e17',
                }}>
                  {language === 'en'
                    ? `${result.benignMet.length} B · ${result.malignantMet.length} M`
                    : `${result.benignMet.length} B · ${result.malignantMet.length} M`}
                </Badge>
              </div>

              {/* Features met list */}
              {(result.benignMet.length > 0 || result.malignantMet.length > 0) && (
                <div className="card" style={{ padding: 'var(--space-lg)', borderLeft: `3px solid ${resultColor}` }}>
                  <Typography variant="h3" style={{ marginBottom: 'var(--space-md)', fontSize: '0.95rem', fontWeight: 'bold', letterSpacing: '0.03em' }}>
                    {language === 'en' ? 'Features present' : 'Rasgos presentes'}
                  </Typography>
                  {result.benignMet.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                      <Typography variant="caption" style={{ color: benignColor, fontWeight: 'bold', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        {language === 'en' ? 'B-features' : 'Rasgos B'}
                      </Typography>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {result.benignMet.map(id => {
                          const f = IOTA_FEATURES.find(x => x.id === id)!;
                          return (
                            <li key={id} style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', lineHeight: 1.4 }}>
                              <strong style={{ color: benignColor, minWidth: '22px' }}>{f.short}</strong>
                              <span>{language === 'en' ? f.en : f.es}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {result.malignantMet.length > 0 && (
                    <div>
                      <Typography variant="caption" style={{ color: malignantColor, fontWeight: 'bold', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        {language === 'en' ? 'M-features' : 'Rasgos M'}
                      </Typography>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {result.malignantMet.map(id => {
                          const f = IOTA_FEATURES.find(x => x.id === id)!;
                          return (
                            <li key={id} style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', lineHeight: 1.4 }}>
                              <strong style={{ color: malignantColor, minWidth: '22px' }}>{f.short}</strong>
                              <span>{language === 'en' ? f.en : f.es}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Clinical note */}
              <div className="card" style={{ padding: 'var(--space-lg)', borderLeft: '3px solid var(--color-accent-gold)' }}>
                <Typography variant="body2" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                  {clinicalNote}
                </Typography>
              </div>

              {/* PDF export (disabled if no features selected) */}
              {result.classification !== 'empty' && (
                <button onClick={handleExportPDF} style={{
                  backgroundColor: '#546E7A', color: 'white', padding: '10px 16px',
                  borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                  transition: 'background 0.2s', marginTop: 'var(--space-sm)', width: '100%',
                }}>
                  {language === 'en' ? 'Export to PDF' : 'Exportar a PDF'}
                </button>
              )}

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
                  ? 'Check the ultrasound findings and press "Classify mass"'
                  : 'Marque los hallazgos ecográficos y pulse "Clasificar masa"'}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
