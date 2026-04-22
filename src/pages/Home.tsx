import React from 'react';
import { Typography } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CopyrightCC } from '../components/ui/CopyrightCC';
import { useLanguage } from '../contexts/LanguageContext';

export const Home: React.FC = () => {
  const { t, language } = useLanguage();
  return (
    <div style={{ paddingBottom: 'var(--space-3xl)' }}>
      {/* Hero Section */}
      <section style={{ padding: 'var(--space-3xl) 0', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <Typography variant="caption" className="text-gold">
            CLINICAL DECISION SUPPORT
          </Typography>
        </div>
        
        <div style={{ maxWidth: '1000px', marginBottom: 'var(--space-2xl)' }}>
          <Typography variant="h1" style={{ fontSize: '3rem', lineHeight: 1.2, marginBottom: 'var(--space-md)' }}>
            {language === 'en' ? 'Evidence-based calculators for' : 'Calculadoras basadas en evidencia para'}
            <br/>
            <span className="italic text-gold">{language === 'en' ? 'clinical practice' : 'práctica clínica'}</span>
          </Typography>
          <Typography variant="body1" className="text-secondary" style={{ fontSize: '1.1rem', maxWidth: '800px' }}>
            {language === 'en' ? 'Open-access, peer-reviewed tools for perinatology, gynecological oncology, and endocrinology. Designed for clinical use and validated for scientific citation.' : 'Herramientas revisadas por pares de acceso abierto para perinatología, oncología ginecológica y endocrinología. Diseñadas para uso clínico y validadas.'}
          </Typography>
        </div>

        {/* Author / Affiliation strip */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-lg)',
          padding: 'var(--space-lg) 0',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 'var(--space-2xl)',
        }}>
          {/* Affiliations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                logo: 'https://hospitalpuertoreal.es/wp-content/uploads/2025/08/Logo-HUPuertoReal.png',
                alt: 'Hospital Universitario Puerto Real',
                text: 'Hospital Universitario Puerto Real · Cádiz, España',
                height: 28,
              },
              {
                logo: 'https://inibica.es/wp-content/uploads/2022/09/INiBICA_logo.webp',
                alt: 'INIBICA',
                text: 'Instituto de Investigación e Innovación Biomédica de Cádiz (INIBICA)',
                height: 22,
              },
              {
                logo: 'https://www.uca.es/wp-content/themes/theme_main_uca/images/logoFooterUCA_05.png',
                alt: 'Universidad de Cádiz',
                text: 'Universidad de Cádiz',
                height: 26,
              },
            ].map(({ logo, alt, text, height }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={logo}
                  alt={alt}
                  height={height}
                  style={{ height: `${height}px`, width: 'auto', objectFit: 'contain', opacity: 0.85, filter: 'brightness(0) invert(1)' }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', letterSpacing: '0.01em' }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* Copyright + CC licence */}
          <CopyrightCC />
        </div>

        {/* Stats */}
        <div className="flex" style={{ gap: 'var(--space-2xl)', alignItems: 'center' }}>
          <div>
            <Typography variant="h2" style={{ fontSize: '2rem' }}>5</Typography>
            <Typography variant="caption">CALCULATORS</Typography>
          </div>
          <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--color-border)' }}></div>
          <div>
            <Typography variant="h2" style={{ fontSize: '2rem' }}>3</Typography>
            <Typography variant="caption">SPECIALTIES</Typography>
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
            title={t('title_fw')}
            description={t('fetalWeightCalcDesc')}
            link="/fetal-weight"
            activeBorder={true}
          />
          <Card 
            category="FETAL GROWTH"
            title={t('title_bmi')}
            description={t('fetalBmiCalcDesc')}
            link="/fetal-bmi"
          />
          <Card 
            category="NEONATAL STANDARDS"
            title={t('title_ig')}
            description={t('intergrowthCalcDesc')}
            link="/intergrowth21"
          />
        </div>
      </section>

      {/* Gynecologic Oncology Section */}
      <section style={{ marginTop: 'var(--space-3xl)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="flex items-center" style={{ gap: 'var(--space-md)' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899'
            }}>
               ⬢
            </div>
            <Typography variant="h3" style={{ fontSize: '1.5rem', fontWeight: 400 }} className="font-serif">
              Gynecologic Oncology
            </Typography>
          </div>
          <Badge variant="outline">1 CALCULATOR</Badge>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--space-xl)'
        }}>
          <Card
            category="HEREDITARY CANCER"
            title={language === 'en' ? 'BRCA Genetic Testing Indication' : 'Indicación de prueba genética BRCA'}
            description={language === 'en' ? 'Rule-based screening tool following SEOM clinical guidelines to assess whether BRCA1/BRCA2 genetic testing is indicated in hereditary breast and ovarian cancer (HBOC).' : 'Herramienta de cribado basada en criterios de las guías clínicas SEOM para evaluar la indicación de estudio genético de BRCA1/BRCA2 en cáncer de mama y ovario hereditario (HBOC).'}
            link="/brca"
            activeBorder={true}
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
          <Badge variant="outline">1 CALCULATOR</Badge>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--space-xl)'
        }}>
          <Card
            category="THYROID"
            title={language === 'en' ? 'Thyroid Nodule Malignancy Risk Calculator' : 'Calculadora de Riesgo de Malignidad de Nódulo Tiroideo'}
            description={language === 'en' ? 'Individualized cancer risk assessment for thyroid nodules using an externally validated logistic regression model (AUC = 0.84).' : 'Evaluación individualizada del riesgo de cáncer en nódulos tiroideos mediante un modelo de regresión logística con validación externa (AUC = 0,84).'}
            link="/thyroid-risk"
            activeBorder={true}
          />
        </div>
      </section>
    </div>
  );
};
