import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { FetalWeightCalculator } from './pages/FetalWeightCalculator';
import { FetalBmiCalculator } from './pages/FetalBmiCalculator';
import { Intergrowth21Calculator } from './pages/Intergrowth21Calculator';
import { Badge } from './components/ui/Badge';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header className="container flex items-center justify-between" style={{ padding: 'var(--space-xl)', borderBottom: '1px solid transparent' }}>
          <Link to="/" className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            <span>Medical</span><span className="text-gold italic font-serif">Calcs</span>
          </Link>
          <Badge variant="outline">OPEN ACCESS · EVIDENCE-BASED</Badge>
        </header>

        {/* Main Content */}
        <main className="container" style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fetal-weight" element={<FetalWeightCalculator />} />
            <Route path="/fetal-bmi" element={<FetalBmiCalculator />} />
            <Route path="/intergrowth21" element={<Intergrowth21Calculator />} />
          </Routes>
        </main>

        {/* Footer */}
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
  );
}

export default App;
