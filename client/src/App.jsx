import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GroupsPage from './pages/GroupsPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{
          borderBottom: '1px solid rgba(99,102,241,0.15)',
          background: 'rgba(9,14,26,0.9)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px var(--spacing-lg)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <span style={{ fontSize: 28 }}>⚽</span>
              <div>
                <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  <span className="gradient-text">PREDICTO</span>
                </h1>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Mundial 2026
                </p>
              </div>
            </div>

            <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <span style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--border-radius-xl)',
                background: 'rgba(16,185,129,0.15)',
                color: '#10b981',
                border: '1px solid rgba(16,185,129,0.3)',
                letterSpacing: '0.05em',
              }}>
                🟢 LIVE
              </span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                Jun 11 – Jul 19, 2026
              </span>
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-lg)', flex: 1 }}>
          <Routes>
            <Route path="/" element={<GroupsPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-color)',
          padding: 'var(--spacing-lg)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 'var(--font-size-xs)',
        }}>
          Predicto · FIFA World Cup 2026 · Probabilidades calculadas con ranking FIFA
        </footer>

      </div>
    </BrowserRouter>
  );
}

export default App;
