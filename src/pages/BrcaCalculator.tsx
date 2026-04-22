import React, { useState } from 'react';
import { Typography } from '../components/ui/Typography';
import { Badge } from '../components/ui/Badge';
import { CopyrightCC } from '../components/ui/CopyrightCC';
import { useLanguage } from '../contexts/LanguageContext';
import {
  BRCA_CRITERIA,
  evaluateBRCA,
  emptyAnswers,
} from '../data/calculators/brcaCriteria';
import type {
  BrcaAnswers,
  BrcaCriterion,
  BrcaCriterionId,
  BrcaResult,
} from '../data/calculators/brcaCriteria';
import { exportBrcaPDF } from '../utils/pdfExport';

// ─── Criterion checkbox row ──────────────────────────────────────────────────
const CriterionRow: React.FC<{
  criterion: BrcaCriterion;
  checked: boolean;
  onToggle: () => void;
  language: 'en' | 'es';
}> = ({ criterion, checked, onToggle, language }) => (
  <label style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-sm)',
    padding: '10px 12px',
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm)',
    transition: 'background 0.15s, border-color 0.15s',
    background: checked ? 'rgba(234, 179, 8, 0.08)' : 'var(--color-bg-surface)',
    border: `1px solid ${checked ? 'rgba(234, 179, 8, 0.35)' : 'var(--color-border)'}`,
  }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onToggle}
      style={{
        marginTop: '3px',
        accentColor: 'var(--color-accent-gold)',
        flexShrink: 0,
        width: '16px',
        height: '16px',
        cursor: 'pointer',
      }}
    />
    <span style={{ fontSize: '0.85rem', lineHeight: 1.45 }}>
      {language === 'en' ? criterion.en : criterion.es}
    </span>
  </label>
);

// ─── Page component ──────────────────────────────────────────────────────────
export const BrcaCalculator: React.FC = () => {
  const { language } = useLanguage();
  const [answers, setAnswers] = useState<BrcaAnswers>(emptyAnswers);
  const [result,  setResult]  = useState<BrcaResult | null>(null);

  const toggle = (id: BrcaCriterionId) =>
    setAnswers(prev => ({ ...prev, [id]: !prev[id] }));

  const handleCalculate = () => setResult(evaluateBRCA(answers));

  const handleReset = () => {
    setAnswers(emptyAnswers());
    setResult(null);
  };

  const handleExportPDF = () => {
    if (!result) return;
    exportBrcaPDF(answers, result, language);
  };

  const personalCriteria = BRCA_CRITERIA.filter(c => c.group === 'personal');
  const familyCriteria   = BRCA_CRITERIA.filter(c => c.group === 'family');

  const indicated   = result?.indicated ?? false;
  const resultColor = result
    ? (indicated ? '#ef4444' : 'var(--color-accent-green)')
    : 'var(--color-text-secondary)';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>

      {/* Header */}
      <div style={{ paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-xl)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-xl)' }}>
        <Typography variant="caption" className="text-gold" style={{ letterSpacing: '0.05em' }}>
          {language === 'en' ? 'GYNECOLOGIC ONCOLOGY' : 'ONCOLOGÍA GINECOLÓGICA'}
        </Typography>
        <Typography variant="h1" style={{ fontSize: '2rem', marginTop: 'var(--space-xs)' }}>
          {language === 'en' ? 'BRCA Genetic Testing Indication' : 'Indicación de prueba genética BRCA'}
        </Typography>
        <Typography variant="body1" className="text-secondary" style={{ marginTop: 'var(--space-xs)' }}>
          {language === 'en'
            ? 'Rule-based screening for hereditary breast and ovarian cancer (HBOC)'
            : 'Cribado basado en criterios para cáncer de mama y ovario hereditario (HBOC)'}
        </Typography>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 'var(--space-lg)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          <div style={{ maxWidth: '70%', lineHeight: '1.4' }}>
            González-Santiago S, Ramón y Cajal T, Aguirre E, et al.<br/>
            <em>SEOM clinical guidelines in hereditary breast and ovarian cancer (2019).</em><br/>
            Clin Transl Oncol. 2020;22(2):193–200. <a href="https://doi.org/10.1007/s12094-019-02262-0" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>doi:10.1007/s12094-019-02262-0</a>
          </div>
          <CopyrightCC />
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) 1fr', gap: 'var(--space-2xl)', alignItems: 'start' }}>

        {/* ── INPUTS COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

          {/* Section A — Personal */}
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <Typography variant="h3" className="text-gold" style={{ marginBottom: 'var(--space-xs)' }}>
              A. {language === 'en' ? 'Personal oncologic history' : 'Antecedentes personales oncológicos'}
            </Typography>
            <Typography variant="body2" className="text-secondary" style={{ fontSize: '0.78rem', marginBottom: 'var(--space-md)' }}>
              {language === 'en' ? 'Check every criterion the patient meets' : 'Marque cada criterio que cumpla el paciente'}
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {personalCriteria.map(c => (
                <CriterionRow key={c.id} criterion={c} checked={answers[c.id]} onToggle={() => toggle(c.id)} language={language} />
              ))}
            </div>
          </div>

          {/* Section B — Family */}
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <Typography variant="h3" className="text-gold" style={{ marginBottom: 'var(--space-md)' }}>
              B. {language === 'en' ? 'Family history & ancestry' : 'Antecedentes familiares y ascendencia'}
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {familyCriteria.map(c => (
                <CriterionRow key={c.id} criterion={c} checked={answers[c.id]} onToggle={() => toggle(c.id)} language={language} />
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
              {language === 'en' ? 'Evaluate indication' : 'Evaluar indicación'}
            </button>
            <button onClick={handleReset} style={{
              backgroundColor: 'transparent', color: 'var(--color-text-secondary)', padding: '12px 16px',
              borderRadius: '6px', border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '0.9rem',
            }}>
              {language === 'en' ? 'Clear' : 'Limpiar'}
            </button>
          </div>

          {/* Source info */}
          <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
            <Typography variant="body2" style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.75rem' }}>
              {language === 'en'
                ? 'Rule-based tool: testing is indicated if any criterion is met. Always confirm with genetic counselling.'
                : 'Herramienta basada en criterios: la prueba se indica si se cumple alguno. Confirmar siempre con consejo genético.'}
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
                  {language === 'en' ? 'BRCA GENETIC TESTING' : 'PRUEBA GENÉTICA BRCA'}
                </Typography>
                <Typography variant="h1" style={{ fontSize: '2.25rem', color: resultColor, margin: 'var(--space-sm) 0', lineHeight: 1.15 }}>
                  {indicated
                    ? (language === 'en' ? 'Testing indicated' : 'Se recomienda prueba')
                    : (language === 'en' ? 'Not indicated' : 'No se indica prueba')}
                </Typography>
                <Badge variant="solid" style={{ backgroundColor: resultColor, color: indicated ? 'white' : '#0a0e17' }}>
                  {indicated
                    ? (language === 'en'
                        ? `${result.criteriaMet.length} ${result.criteriaMet.length === 1 ? 'criterion' : 'criteria'} met`
                        : `${result.criteriaMet.length} ${result.criteriaMet.length === 1 ? 'criterio cumplido' : 'criterios cumplidos'}`)
                    : (language === 'en' ? 'No SEOM criteria met' : 'Ningún criterio SEOM cumplido')}
                </Badge>
              </div>

              {/* Criteria met list */}
              {indicated && (
                <div className="card" style={{ padding: 'var(--space-lg)', borderLeft: `3px solid ${resultColor}` }}>
                  <Typography variant="h3" style={{ color: resultColor, marginBottom: 'var(--space-md)', fontSize: '0.95rem', fontWeight: 'bold', letterSpacing: '0.03em' }}>
                    {language === 'en' ? 'Criteria met' : 'Criterios cumplidos'}
                  </Typography>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.criteriaMet.map(id => {
                      const c = BRCA_CRITERIA.find(x => x.id === id)!;
                      return (
                        <li key={id} style={{ display: 'flex', gap: 'var(--space-sm)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                          <span style={{ color: resultColor, flexShrink: 0 }}>▸</span>
                          <span>{language === 'en' ? c.en : c.es}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Clinical note */}
              <div className="card" style={{ padding: 'var(--space-lg)', borderLeft: '3px solid var(--color-accent-gold)' }}>
                <Typography variant="body2" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                  {indicated
                    ? (language === 'en'
                        ? 'According to SEOM HBOC guidelines, this patient meets at least one criterion for BRCA1/BRCA2 genetic testing referral. The decision should always be individualized and preceded by genetic counselling.'
                        : 'Según las guías SEOM HBOC, el paciente cumple al menos un criterio para derivación a estudio genético de BRCA1/BRCA2. La decisión debe individualizarse y siempre estar precedida de consejo genético.')
                    : (language === 'en'
                        ? 'No SEOM HBOC criteria for BRCA testing are met. Clinical judgment and individual context should always prevail over the screening rule.'
                        : 'No se cumplen criterios SEOM HBOC para estudio de BRCA. El juicio clínico y el contexto individual deben prevalecer sobre la regla de cribado.')}
                </Typography>
              </div>

              {/* PDF export */}
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
                  ? 'Check the criteria that apply and press "Evaluate indication"'
                  : 'Marque los criterios que apliquen y pulse "Evaluar indicación"'}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
