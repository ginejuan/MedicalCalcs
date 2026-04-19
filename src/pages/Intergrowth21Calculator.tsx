import React, { useState } from 'react';
import { Typography } from '../components/ui/Typography';
import { Badge } from '../components/ui/Badge';
import { computeIntergrowthPercentile, IG, gaKey, type IntergrowthResult } from '../data/calculators/intergrowth21Logic';
import { useLanguage } from '../contexts/LanguageContext';
import { PercentileChart } from '../components/ui/PercentileChart';
import { exportIntergrowth21PDF } from '../utils/pdfExport';

export const Intergrowth21Calculator: React.FC = () => {
  const [weeks, setWeeks] = useState<number | ''>('');
  const [days, setDays] = useState<number | ''>(0);
  const [peso, setPeso] = useState<number | ''>('');
  const [sexo, setSexo] = useState<string>('');
  
  const [result, setResult] = useState<IntergrowthResult | null>(null);
  const [error, setError] = useState<string>('');
  const { t, language } = useLanguage();

  const handleCalculate = () => {
    setError('');
    
    if (weeks === '' || peso === '' || sexo === '') {
      setError(t('errFill'));
      return;
    }
    
    const d = days === '' ? 0 : days;
    
    if (weeks < 33 || weeks > 42 || d < 0 || d > 6 || (weeks === 42 && d > 6)) return setError(t('errGA_33'));
    if (peso < 500 || peso > 6000) return setError(t('errEFW'));

    const res = computeIntergrowthPercentile({ weeks, days: d, peso, sexo });
    
    if (!res) {
      setError('Could not calculate percentile for this exact gestational age.');
      return;
    }
    
    setResult(res);
  };

  const handleExportPDF = () => {
    if (!result) return;
    exportIntergrowth21PDF({ weeks, days: days === '' ? 0 : days, efw: peso, sex: sexo === 'M' ? 1 : 0 }, { percentil: result.percentil, p50: result.p50, ratio: result.pesoKg / result.p50 }, language);
  };

  const renderChart = () => {
    if (!result || sexo === '' || weeks === '' || peso === '') return null;
    const d = days === '' ? 0 : days;
    const egDecimal = weeks + d / 7;

    const table = IG[sexo];
    const gaValues: number[] = [];
    const p3: number[] = []; const p10: number[] = []; const p50: number[] = []; const p90: number[] = []; const p97: number[] = [];
    
    for (let w = 33; w <= 42; w++) {
      for (let day = 0; day <= 6; day++) {
        if (w === 42 && day > 6) continue;
        const key = gaKey(w, day);
        if (table[key]) {
          gaValues.push(Number((w + day / 7).toFixed(2)));
          // ref = [P3, P5, P10, P50, P90, P95, P97] -> ind: 0, 1, 2, 3, 4, 5, 6
          p3.push(Math.round(table[key][0] * 1000));
          p10.push(Math.round(table[key][2] * 1000));
          p50.push(Math.round(table[key][3] * 1000));
          p90.push(Math.round(table[key][4] * 1000));
          p97.push(Math.round(table[key][6] * 1000));
        }
      }
    }

    let closestIdx = 0; let minDiff = Infinity;
    gaValues.forEach((ga, i) => { 
      if (Math.abs(ga - egDecimal) < minDiff) { 
        minDiff = Math.abs(ga - egDecimal); 
        closestIdx = i; 
      } 
    });
    
    const caseData: (number | null)[] = new Array(gaValues.length).fill(null);
    caseData[closestIdx] = peso as number;

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
        <Typography variant="caption" className="text-gold">NEONATAL STANDARDS</Typography>
        <Typography variant="h1" style={{ fontSize: '2.5rem', marginTop: 'var(--space-sm)' }}>
          {t('title_ig')}
        </Typography>
        <Typography variant="body1" className="text-secondary" style={{ marginTop: 'var(--space-sm)' }}>
          {t('subtitle_ig')}
        </Typography>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 'var(--space-2xl)', alignItems: 'start' }}>
        
        {/* INPUTS COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <Typography variant="h3" className="text-green" style={{ marginBottom: 'var(--space-md)' }}>{t('h_data')}</Typography>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Typography variant="caption" style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>{t('lbl_ga')}</Typography>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                  <div style={{ flex: 1 }}>
                    <input type="number" value={weeks} onChange={e => setWeeks(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{t('unit_weeks_33')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)', marginTop: '-15px' }}>+</div>
                  <div style={{ flex: 1 }}>
                    <input type="number" value={days} onChange={e => setDays(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{t('unit_days')}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{t('lbl_weight')} ({t('unit_wt')})</label>
                <input type="number" value={peso} onChange={e => setPeso(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{t('lbl_sex')}</label>
                <select value={sexo} onChange={e => setSexo(e.target.value)} style={inputStyle}>
                  <option value="" disabled>{t('opt_select')}</option>
                  <option value="M">{t('opt_male')}</option>
                  <option value="F">{t('opt_female')}</option>
                </select>
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
                {t('info_text_ig')}
             </Typography>
          </div>
        </div>

        {/* RESULTS COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {result ? (
             <>
               <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center', borderColor: getResultColor(result.classificationRaw) }}>
                  <Typography variant="caption" style={{ color: getResultColor(result.classificationRaw), fontWeight: 'bold' }}>
                    {t('percentileLabel_ig')}
                  </Typography>
                  <Typography variant="h1" style={{ fontSize: '4rem', color: getResultColor(result.classificationRaw), marginBottom: 'var(--space-sm)' }}>
                    P {result.percentil.toFixed(1)}
                  </Typography>
                  <Badge variant="solid" style={{ backgroundColor: getResultColor(result.classificationRaw), color: 'white' }}>
                    {t(getResultLocCode(result.classificationRaw))}
                  </Badge>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-2xl)' }}>
                    <div>
                      <Typography variant="h3">{peso} g</Typography>
                      <Typography variant="caption">{t('lbl_weight')}</Typography>
                    </div>
                    <div>
                      <Typography variant="h3">{Math.round(result.p50 * 1000)} g</Typography>
                      <Typography variant="caption">{t('lbl_wt_p50')}</Typography>
                    </div>
                    <div>
                      <Typography variant="h3">{(result.pesoKg / result.p50).toFixed(3)}</Typography>
                      <Typography variant="caption">{t('lbl_ratio')}</Typography>
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
               <Typography variant="body1">Enter data and calculate to view INTERGROWTH-21st percentile</Typography>
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
