import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Home } from './pages/Home';
import { FetalWeightCalculator } from './pages/FetalWeightCalculator';
import { FetalBmiCalculator } from './pages/FetalBmiCalculator';
import { Intergrowth21Calculator } from './pages/Intergrowth21Calculator';
import { ThyroidRiskCalculator } from './pages/ThyroidRiskCalculator';
import { BrcaCalculator } from './pages/BrcaCalculator';
import { Badge } from './components/ui/Badge';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function Header() {
  const { language, setLanguage } = useLanguage();
  return (
    <header className="container flex items-center justify-between" style={{ padding: 'var(--space-xl)', borderBottom: '1px solid transparent' }}>
      <Link to="/" className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        <span>Medical</span><span className="text-gold italic font-serif">Calcs</span>
      </Link>
      <div className="flex gap-4 items-center">
        <Badge variant="outline">OPEN ACCESS · EVIDENCE-BASED</Badge>
        <button 
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: 'var(--color-text-secondary)',
            fontSize: '0.8rem'
          }}
        >
          {language === 'es' ? 'EN' : 'ES'}
        </button>
      </div>
    </header>
  );
}

function App() {
  // Redirect .org to .com preserving path and query
  useEffect(() => {
    if (window.location.hostname.toLowerCase().includes('medicalcalcs.org')) {
      const newUrl = `https://MedicalCalcs.com${window.location.pathname}${window.location.search}`;
      window.location.replace(newUrl);
    }
  }, []);
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main className="container" style={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/fetal-weight" element={<FetalWeightCalculator />} />
              <Route path="/fetal-bmi" element={<FetalBmiCalculator />} />
              <Route path="/intergrowth21" element={<Intergrowth21Calculator />} />
              <Route path="/thyroid-risk" element={<ThyroidRiskCalculator />} />
              <Route path="/brca" element={<BrcaCalculator />} />
            </Routes>
          </main>
          <footer className="container" style={{ padding: 'var(--space-2xl) var(--space-xl)', borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
            <div className="flex justify-between" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              <div className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
                <span>Medical</span><span className="text-gold italic">Calcs</span>
              </div>
              <div style={{ maxWidth: '500px' }}>
                <p style={{ marginBottom: 'var(--space-sm)' }}>
                  Developed by <strong style={{ color: 'var(--color-text-primary)' }}>Juan J. Fernández-Alba</strong>, MD PhD — Professor of Obstetrics & Gynecology, Universidad de Cádiz. Head of OB/GYN Service, Hospital Universitario Puerto Real, Spain.
                </p>
                <p>
                  These tools are intended for clinical and research use only and do not constitute medical advice. All calculators are open access and free of charge.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
