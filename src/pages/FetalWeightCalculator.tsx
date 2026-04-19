import React, { useState } from 'react';
import { Typography } from '../components/ui/Typography';
import { Badge } from '../components/ui/Badge';
import { computePercentile, expectedWeightAtGa, CV_PESO, normInv, type FetalWeightResult } from '../data/calculators/fetalWeightLogic';
import { useLanguage } from '../contexts/LanguageContext';
import { PercentileChart } from '../components/ui/PercentileChart';
import { exportFetalWeightPDF } from '../utils/pdfExport';

export const FetalWeightCalculator: React.FC = () => {
  const [weeks, setWeeks] = useState<number | ''>('');
  const [days, setDays] = useState<number | ''>(0);
  const [efw, setEfw] = useState<number | ''>('');
  const [sexo, setSexo] = useState<number | ''>('');
  const [tallaM, setTallaM] = useState<number | ''>('');
  const [pesoPreg, setPesoPreg] = useState<number | ''>('');
  const [paridad, setParidad] = useState<number | ''>('');
  const [edad, setEdad] = useState<number | ''>('');
  
  const [result, setResult] = useState<FetalWeightResult | null>(null);
  const [error, setError] = useState<string>('');
  const { t, language } = useLanguage();

  const handleCalculate = () => {
    setError('');
    
    if (weeks === '' || efw === '' || sexo === '' || tallaM === '' || pesoPreg === '' || paridad === '' || edad === '') {
      setError(t('errFill'));
      return;
    }
    
    const d = days === '' ? 0 : days;
    const egDecimal = weeks + d / 7;
    
    if (egDecimal < 28 || egDecimal > 42 + 6/7) return setError(t('errGA_28'));
    if (efw < 500 || efw > 6000) return setError(t('errEFW'));
    if (tallaM < 130 || tallaM > 200) return setError(t('errHeight'));
    if (pesoPreg < 35 || pesoPreg > 200) return setError(t('errWeight'));

    const res = computePercentile({
      egDecimal, efw, sexo, tallaM, pesoPreg, paridad
    });
    
    setResult(res);
  };

  const handleExportPDF = () => {
    if (!result) return;
    exportFetalWeightPDF({ weeks, days: days === '' ? 0 : days, efw, sex: sexo, maternalHeight: tallaM, maternalWeight: pesoPreg, parity: paridad, maternalAge: edad }, result, language);
  };

  const renderChart = () => {
    if (!result || sexo === '' || tallaM === '' || paridad === '' || weeks === '' || efw === '') return null;
    const d = days === '' ? 0 : days;
    const egDecimal = weeks + d / 7;

    const z10 = normInv(0.10); const z90 = normInv(0.90);
    const z3 = normInv(0.03); const z97 = normInv(0.97);

    const gaValues: number[] = [];
    for (let ga = 28; ga <= 42; ga += 0.5) gaValues.push(ga);

    const p3: number[] = []; const p10: number[] = []; const p50: number[] = []; const p90: number[] = []; const p97: number[] = [];
    gaValues.forEach(ga => {
      const exp = expectedWeightAtGa(ga, result.pesoCorr, tallaM as number, sexo as number, paridad as number);
      p3.push(Math.round(exp * (1 + z3 * CV_PESO)));
      p10.push(Math.round(exp * (1 + z10 * CV_PESO)));
      p50.push(Math.round(exp));
      p90.push(Math.round(exp * (1 + z90 * CV_PESO)));
      p97.push(Math.round(exp * (1 + z97 * CV_PESO)));
    });

    let closestIdx = 0; let minDiff = Infinity;
    gaValues.forEach((ga, i) => { 
      if (Math.abs(ga - egDecimal) < minDiff) { 
        minDiff = Math.abs(ga - egDecimal); 
        closestIdx = i; 
      } 
    });
    
    const caseData: (number | null)[] = new Array(gaValues.length).fill(null);
    caseData[closestIdx] = efw as number;

    return (
      <div className="card" style={{ padding: 'var(--space-2xl)', marginTop: 'var(--space-xl)' }}>
         <Typography variant="h3" className="text-green" style={{ marginBottom: 'var(--space-md)' }}>{t('h_chart')}</Typography>
         <PercentileChart gaValues={gaValues} p3={p3} p10={p10} p50={p50} p90={p90} p97={p97} caseData={caseData} yAxisLabel={t('yAxisWt')} />
      </div>
    );
  };

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <div style={{ padding: 'var(--space-xl) 0', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-xl)' }}>
        <Typography variant="caption" className="text-gold">FETAL GROWTH</Typography>
        <Typography variant="h1" style={{ fontSize: '2.5rem', marginTop: 'var(--space-sm)' }}>
          {t('title_fw')}
        </Typography>
        <Typography variant="body1" className="text-secondary" style={{ marginTop: 'var(--space-sm)' }}>
          {t('subtitle_fw')}
        </Typography>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: 'var(--space-xl)', alignItems: 'start' }}>
        
        {/* INPUTS COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <Typography variant="h3" className="text-green" style={{ marginBottom: 'var(--space-md)' }}>{t('h_fetal')}</Typography>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{t('lbl_ga')}</label>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <input type="number" placeholder={t('unit_weeks_28')} value={weeks} onChange={e => setWeeks(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
                  <input type="number" placeholder={t('unit_days')} value={days} onChange={e => setDays(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{t('lbl_efw')}</label>
                <input type="number" placeholder={t('unit_efw')} value={efw} onChange={e => setEfw(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{t('lbl_sex')}</label>
                <select value={sexo} onChange={e => setSexo(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle}>
                  <option value="" disabled>{t('opt_select')}</option>
                  <option value="1">{t('opt_male')}</option>
                  <option value="0">{t('opt_female')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <Typography variant="h3" className="text-green" style={{ marginBottom: 'var(--space-md)' }}>{t('h_maternal')}</Typography>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{t('lbl_height')} (cm)</label>
                <input type="number" value={tallaM} onChange={e => setTallaM(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{t('lbl_weight_mat')} (kg)</label>
                <input type="number" step="0.1" value={pesoPreg} onChange={e => setPesoPreg(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{t('lbl_parity')}</label>
                <select value={paridad} onChange={e => setParidad(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle}>
                  <option value="" disabled>{t('opt_select')}</option>
                  <option value="0">{t('opt_nulli')}</option>
                  <option value="1">{t('opt_multi')}</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{t('lbl_age')} ({t('unit_age')})</label>
                <input type="number" value={edad} onChange={e => setEdad(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
              </div>
            </div>
          </div>

          <button onClick={handleCalculate} style={{ 
            backgroundColor: 'var(--color-accent-blue)', color: 'white', padding: '12px', 
            borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
            transition: 'background 0.2s'
          }}>
            {t('btnCalc')}
          </button>
          
          {error && <Typography variant="body2" style={{ color: '#ef4444' }}>{error}</Typography>}
          
          <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
             <Typography variant="body2" style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                {t('info_method_fw')}
             </Typography>
          </div>
        </div>

        {/* RESULTS COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {result ? (
             <>
               <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center', borderColor: getResultColor(result.classificationRaw) }}>
                  <Typography variant="caption" style={{ color: getResultColor(result.classificationRaw), fontWeight: 'bold' }}>
                    {t('percentileLabel_fw')}
                  </Typography>
                  <Typography variant="h1" style={{ fontSize: '4rem', color: getResultColor(result.classificationRaw), marginBottom: 'var(--space-sm)' }}>
                    P {result.percentil.toFixed(1)}
                  </Typography>
                  <Badge variant="solid" style={{ backgroundColor: getResultColor(result.classificationRaw), color: 'white' }}>
                    {t(getResultLocCode(result.classificationRaw))}
                  </Badge>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-2xl)' }}>
                    <div>
                      <Typography variant="h3">{efw} g</Typography>
                      <Typography variant="caption">{t('lbl_wt_obs')}</Typography>
                    </div>
                    <div>
                      <Typography variant="h3">{Math.round(result.pesoEst)} g</Typography>
                      <Typography variant="caption">{t('lbl_wt_exp')}</Typography>
                    </div>
                    <div>
                      <Typography variant="h3">{result.z > 0 ? '+' : ''}{result.z.toFixed(2)}</Typography>
                      <Typography variant="caption">{t('pdfZscore')}</Typography>
                    </div>
                  </div>
               </div>
               <button onClick={handleExportPDF} style={{ 
                backgroundColor: 'var(--color-text-primary)', color: 'white', padding: '12px', 
                borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                transition: 'background 0.2s', marginTop: 'var(--space-md)'
              }}>
                {t('btnPdfText')}
              </button>
              {renderChart()}
             </>
          ) : (
            <div className="card" style={{ padding: 'var(--space-3xl)', textAlign: 'center', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Typography variant="body1">Enter data and calculate to view customized percentile</Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-bg-surface)',
  color: 'var(--color-text-primary)'
};

function getResultColor(c: string) {
  if (c === 'iugr') return '#ef4444';
  if (c === 'sga') return '#f97316';
  if (c === 'lga') return '#3b82f6';
  return '#10b981'; // aga
}

function getResultLocCode(c: string): keyof typeof import('../contexts/LanguageContext').translations.en {
  if (c === 'iugr') return 'iugr';
  if (c === 'sga') return 'peg';
  if (c === 'lga') return 'geg';
  return 'aeg';
}
