import React, { useState } from 'react';
import { Typography } from '../components/ui/Typography';
import { Badge } from '../components/ui/Badge';
import { computePercentile, type FetalBmiResult } from '../data/calculators/fetalBmiLogic';

export const FetalBmiCalculator: React.FC = () => {
  const [weeks, setWeeks] = useState<number | ''>('');
  const [days, setDays] = useState<number | ''>(0);
  const [efw, setEfw] = useState<number | ''>('');
  const [sexo, setSexo] = useState<number | ''>('');
  const [tallaM, setTallaM] = useState<number | ''>('');
  const [pesoPreg, setPesoPreg] = useState<number | ''>('');
  const [paridad, setParidad] = useState<number | ''>('');
  const [edad, setEdad] = useState<number | ''>('');
  
  const [result, setResult] = useState<FetalBmiResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    setError('');
    
    if (weeks === '' || efw === '' || sexo === '' || tallaM === '' || pesoPreg === '' || paridad === '' || edad === '') {
      setError('Please complete all fields.');
      return;
    }
    
    const d = days === '' ? 0 : days;
    const egDecimal = weeks + d / 7;
    
    if (egDecimal < 28 || egDecimal > 42 + 6/7) return setError('Gestational age must be between 28+0 and 42+6.');
    if (efw < 500 || efw > 6000) return setError('EFW must be between 500 and 6000 g.');
    if (tallaM < 130 || tallaM > 200) return setError('Height must be between 130 and 200 cm.');
    if (pesoPreg < 35 || pesoPreg > 200) return setError('Weight must be between 35 and 200 kg.');

    const res = computePercentile({
      egDecimal, efw, sexo, tallaM, pesoPreg, paridad, edad
    });
    
    setResult(res);
  };

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <div style={{ padding: 'var(--space-xl) 0', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-xl)' }}>
        <Typography variant="caption" className="text-gold">FETAL GROWTH</Typography>
        <Typography variant="h1" style={{ fontSize: '2.5rem', marginTop: 'var(--space-sm)' }}>
          Customized Fetal BMI Calculator
        </Typography>
        <Typography variant="body1" className="text-secondary" style={{ marginTop: 'var(--space-sm)' }}>
          Prenatal nutritional status assessment through individualized fetal BMI percentiles.
        </Typography>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: 'var(--space-xl)', alignItems: 'start' }}>
        
        {/* INPUTS COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <Typography variant="h3" className="text-green" style={{ marginBottom: 'var(--space-md)' }}>Fetal Data</Typography>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Gestational Age</label>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <input type="number" placeholder="Weeks" value={weeks} onChange={e => setWeeks(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
                  <input type="number" placeholder="Days" value={days} onChange={e => setDays(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>EFW (g)</label>
                <input type="number" value={efw} onChange={e => setEfw(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Fetal Sex</label>
                <select value={sexo} onChange={e => setSexo(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle}>
                  <option value="" disabled>Select...</option>
                  <option value="1">Male</option>
                  <option value="0">Female</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <Typography variant="h3" className="text-green" style={{ marginBottom: 'var(--space-md)' }}>Maternal Data</Typography>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Height (cm)</label>
                <input type="number" value={tallaM} onChange={e => setTallaM(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Pre-preg. Weight (kg)</label>
                <input type="number" step="0.1" value={pesoPreg} onChange={e => setPesoPreg(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Parity</label>
                <select value={paridad} onChange={e => setParidad(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle}>
                  <option value="" disabled>Select...</option>
                  <option value="0">Nulliparous</option>
                  <option value="1">Multiparous</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Age (Years)</label>
                <input type="number" value={edad} onChange={e => setEdad(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
              </div>
            </div>
          </div>

          <button onClick={handleCalculate} style={{ 
            backgroundColor: 'var(--color-accent-blue)', color: 'white', padding: '12px', 
            borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
            transition: 'background 0.2s'
          }}>
            Calculate Percentile
          </button>
          
          {error && <Typography variant="body2" style={{ color: '#ef4444' }}>{error}</Typography>}
        </div>

        {/* RESULTS COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {result ? (
             <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center', borderColor: getResultColor(result.classificationRaw) }}>
                <Typography variant="h1" style={{ fontSize: '4rem', color: getResultColor(result.classificationRaw), marginBottom: 'var(--space-sm)' }}>
                  P {result.percentil.toFixed(1)}
                </Typography>
                <Badge variant="solid" style={{ backgroundColor: getResultColor(result.classificationRaw), color: 'white' }}>
                  {result.classificationRaw.toUpperCase()}
                </Badge>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-2xl)' }}>
                  <div>
                    <Typography variant="h3">{result.imcObs.toFixed(2)}</Typography>
                    <Typography variant="caption">Observed BMI</Typography>
                  </div>
                  <div>
                    <Typography variant="h3">{result.imcEst.toFixed(2)}</Typography>
                    <Typography variant="caption">Expected BMI</Typography>
                  </div>
                  <div>
                    <Typography variant="h3">{result.z > 0 ? '+' : ''}{result.z.toFixed(2)}</Typography>
                    <Typography variant="caption">Z-Score</Typography>
                  </div>
                </div>
             </div>
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
