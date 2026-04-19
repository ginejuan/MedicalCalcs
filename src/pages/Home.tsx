import React from 'react';
import { Typography } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Home: React.FC = () => {
  return (
    <div style={{ paddingBottom: 'var(--space-3xl)' }}>
      {/* Hero Section */}
      <section style={{ padding: 'var(--space-3xl) 0', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <Typography variant="caption" className="text-gold">
            CLINICAL DECISION SUPPORT
          </Typography>
        </div>
        
        <div style={{ maxWidth: '800px', marginBottom: 'var(--space-2xl)' }}>
          <Typography variant="h1" style={{ fontSize: '3rem', lineHeight: 1.2, marginBottom: 'var(--space-md)' }}>
            Evidence-based calculators for <br/>
            <span className="italic text-gold">modern clinical practice</span>
          </Typography>
          <Typography variant="body1" className="text-secondary" style={{ fontSize: '1.1rem', maxWidth: '600px' }}>
            Open-access, peer-reviewed tools for perinatology, gynecological oncology,
            and endocrinology. Designed for clinical use and validated for scientific citation.
          </Typography>
        </div>

        {/* Stats */}
        <div className="flex" style={{ gap: 'var(--space-2xl)', alignItems: 'center' }}>
          <div>
            <Typography variant="h2" style={{ fontSize: '2rem' }}>3</Typography>
            <Typography variant="caption">CALCULATORS</Typography>
          </div>
          <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--color-border)' }}></div>
          <div>
            <Typography variant="h2" style={{ fontSize: '2rem' }}>1</Typography>
            <Typography variant="caption">SPECIALTY</Typography>
          </div>
          <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--color-border)' }}></div>
          <div>
            <Typography variant="h2" style={{ fontSize: '1.5rem' }}>EN · ES</Typography>
            <Typography variant="caption">LANGUAGES</Typography>
          </div>
        </div>
      </section>

      {/* Perinatology Section */}
      <section style={{ marginTop: 'var(--space-3xl)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="flex items-center" style={{ gap: 'var(--space-md)' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', 
              backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-green)'
            }}>
               ◉
            </div>
            <Typography variant="h3" style={{ fontSize: '1.5rem', fontWeight: 400 }} className="font-serif">
              Perinatology
            </Typography>
          </div>
          <Badge variant="outline">3 CALCULATORS</Badge>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: 'var(--space-xl)' 
        }}>
          <Card 
            category="FETAL GROWTH"
            title="Customized Fetal Weight Calculator"
            description="Calculates individualized estimated fetal weight percentiles adjusted for maternal anthropometric characteristics, using customized growth curves (CV = 12%)."
            link="/fetal-weight"
            activeBorder={true}
          />
          <Card 
            category="FETAL GROWTH"
            title="Customized Fetal BMI Calculator"
            description="Assesses prenatal nutritional status through individualized fetal BMI percentile curves adjusted for maternal pre-pregnancy BMI (CV = 9.7%)."
            link="/fetal-bmi"
          />
          <Card 
            category="NEONATAL STANDARDS"
            title="INTERGROWTH-21st Weight Percentile"
            description="Classifies neonatal and fetal weight against international population-based standards (33+0 to 42+6 weeks). No maternal adjustment required."
            link="/intergrowth21"
          />
        </div>
      </section>

      {/* Endocrinology Section */}
      <section style={{ marginTop: 'var(--space-3xl)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="flex items-center" style={{ gap: 'var(--space-md)' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', 
              backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7'
            }}>
               ⊞
            </div>
            <Typography variant="h3" style={{ fontSize: '1.5rem', fontWeight: 400 }} className="font-serif">
              Endocrinology
            </Typography>
          </div>
          <Badge variant="outline">COMING SOON</Badge>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: 'var(--space-xl)' 
        }}>
          <Card 
            title="More calculators"
            description=""
          />
        </div>
      </section>
    </div>
  );
};
