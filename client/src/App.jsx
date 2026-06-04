import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GroupsPage from './pages/GroupsPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        {/* Header */}
        <header style={{
          padding: 'var(--spacing-lg) 0',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 'var(--spacing-xl)',
        }}>
          <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h1 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}>
              <span className="gradient-text">⚽ App Mundial</span>
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-sm)',
            }}>
              Predicciones con probabilidades reales
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container">
          <Routes>
            <Route path="/" element={<GroupsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
