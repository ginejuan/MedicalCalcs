import React, { useState } from 'react';
import { Typography } from '../components/ui/Typography';
import { Badge } from '../components/ui/Badge';
import { computeIntergrowthPercentile, type IntergrowthResult } from '../data/calculators/intergrowth21Logic';

export const Intergrowth21Calculator: React.FC = () => {
  const [weeks, setWeeks] = useState<number | ''>('');
  const [days, setDays] = useState<number | ''>(0);
  const [peso, setPeso] = useState<number | ''>('');
  const [sexo, setSexo] = useState<string>('');
  
  const [result, setResult] = useState<IntergrowthResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    setError('');
    
    if (weeks === '' || peso === '' || sexo === '') {
      setError('Please complete all fields.');
      return;
    }
    
    const d = days === '' ? 0 : days;
    
    if (weeks < 33 || weeks > 42 || d < 0 || d > 6 || (weeks === 42 && d > 6)) return setError('Gestational age must be between 33+0 and 42+6.');
    if (peso < 500 || peso > 6000) return setError('Weight must be between 500 and 6000 g.');

    const res = computeIntergrowthPercentile({ weeks, days: d, peso, sexo });
    
    if (!res) {
      setError('Could not calculate percentile for this exact gestational age.');
      return;
    }
    
    setResult(res);
  };

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <div style={{ padding: 'var(--space-xl) 0', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-xl)' }}>
        <Typography variant="caption" className="text-gold">NEONATAL STANDARDS</Typography>
        <Typography variant="h1" style={{ fontSize: '2.5rem', marginTop: 'var(--space-sm)' }}>
          INTERGROWTH-21st Weight Percentile
        </Typography>
        <Typography variant="body1" className="text-secondary" style={{ marginTop: 'var(--space-sm)' }}>
          Classifies neonatal and fetal weight against international population-based standards.
        </Typography>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: 'var(--space-xl)', alignItems: 'start' }}>
        
        {/* INPUTS COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <Typography variant="h3" className="text-green" style={{ marginBottom: 'var(--space-md)' }}>Neonatal / Fetal Data</Typography>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Gestational Age</label>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <input type="number" placeholder="Weeks (33-42)" value={weeks} onChange={e => setWeeks(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
                  <input type="number" placeholder="Days (0-6)" value={days} onChange={e => setDays(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Weight (g)</label>
                <input type="number" value={peso} onChange={e => setPeso(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Sex</label>
                <select value={sexo} onChange={e => setSexo(e.target.value)} style={inputStyle}>
                  <option value="" disabled>Select...</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
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
                    <Typography variant="h3">{peso} g</Typography>
                    <Typography variant="caption">Weight</Typography>
                  </div>
                  <div>
                    <Typography variant="h3">{Math.round(result.p50 * 1000)} g</Typography>
                    <Typography variant="caption">P50 Ref</Typography>
                  </div>
                  <div>
                    <Typography variant="h3">{(result.pesoKg / result.p50).toFixed(3)}</Typography>
                    <Typography variant="caption">Weight/P50</Typography>
                  </div>
                </div>
             </div>
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
