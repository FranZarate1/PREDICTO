/**
 * HowItWorksModal — Explica el sistema de probabilidades al usuario
 */

function HowItWorksModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        animation: 'fadeIn 150ms ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="glass"
        style={{
          maxWidth: 600,
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: 'var(--spacing-xl)',
          position: 'relative',
          border: '1px solid rgba(99,102,241,0.3)',
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            width: 32, height: 32,
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-family)',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          ✕
        </button>

        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--spacing-xs)' }}>
          ¿Cómo funciona?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xl)' }}>
          Cómo Predicto calcula la probabilidad de tu pronóstico
        </p>

        {/* Sección 1 */}
        <Section
          emoji="🏆"
          title="El objetivo"
          color="var(--color-primary-light)"
        >
          Predecís quién va a quedar <strong>1ro y 2do</strong> en cada uno de los 12 grupos del Mundial 2026.
          Cuantos más grupos acertés, mejor tu resultado. La probabilidad te dice qué tan difícil es acertar
          tu pronóstico específico.
        </Section>

        {/* Sección 2 */}
        <Section
          emoji="📊"
          title="Cómo se calcula cada grupo"
          color="var(--color-accent)"
        >
          <p style={{ marginBottom: 10 }}>
            Para cada grupo usamos el <strong>Ranking FIFA</strong> de los 4 equipos para estimar su
            probabilidad de clasificar:
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px 14px', fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)' }}>
            <div>Fuerza del equipo = 1 ÷ Ranking FIFA</div>
            <div style={{ marginTop: 4, color: 'var(--color-accent-light)' }}>
              Argentina (#1) → fuerza 1.000<br />
              Qatar     (#35) → fuerza 0.029
            </div>
          </div>
          <p style={{ marginTop: 10 }}>
            La probabilidad de cada equipo de clasificar es proporcional a su fuerza relativa dentro del grupo.
            Un equipo con mejor ranking tiene más chance de pasar.
          </p>
        </Section>

        {/* Sección 3 */}
        <Section
          emoji="🎯"
          title="1ro vs 2do"
          color="var(--color-success)"
        >
          Las probabilidades son distintas para cada posición:
          <ul style={{ paddingLeft: 20, marginTop: 8, lineHeight: 1.9 }}>
            <li>
              <strong style={{ color: 'var(--color-primary-light)' }}>Ganar el grupo (1ro):</strong> más difícil.
              Estimamos que el equipo favorito gana el grupo el ~60% de las veces que clasificaría.
            </li>
            <li>
              <strong style={{ color: 'var(--color-accent-light)' }}>Clasificar como 2do:</strong> más fácil.
              Cualquier clasificado puede terminar 2do, estimamos ~85% de la prob base.
            </li>
          </ul>
        </Section>

        {/* Sección 4 */}
        <Section
          emoji="✖️"
          title="Probabilidad combinada"
          color="#a78bfa"
        >
          <p style={{ marginBottom: 10 }}>
            La probabilidad total de acertar <em>todos</em> los grupos que elegiste se calcula multiplicando
            las probabilidades individuales:
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px 14px', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8 }}>
            <span style={{ color: '#a78bfa' }}>P(total)</span> = P(Grupo A) × P(Grupo B) × ... × P(Grupo L)<br />
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
              Ej: 15% × 22% × 18% × ... = 0.00031%
            </span>
          </div>
          <p style={{ marginTop: 10 }}>
            Las probabilidades pequeñas no son un problema — <strong>todos los jugadores tienen probabilidades chicas</strong>.
            Lo que importa es quién tiene el pronóstico más inteligente comparado con los demás.
          </p>
        </Section>

        {/* Sección 5 */}
        <Section
          emoji="⚡"
          title="Durante el torneo"
          color="var(--color-warning)"
        >
          Cuando empiece el Mundial (11 de junio de 2026), el sistema se actualizará
          automáticamente con <strong>cuotas reales de bookmakers</strong>. Esas cuotas
          incorporan toda la información del mercado (lesiones, forma reciente, historial)
          y reemplazarán la estimación por ranking FIFA.
        </Section>

        {/* Footer del modal */}
        <div style={{ marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 28px',
              borderRadius: 'var(--border-radius-md)',
              border: 'none',
              background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light))',
              color: '#fff',
              fontFamily: 'var(--font-family)',
              fontWeight: 700,
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            ¡Entendido, a predecir! ⚽
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ emoji, title, color, children }) {
  return (
    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color }}>
          {title}
        </h3>
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7, paddingLeft: 26 }}>
        {children}
      </div>
    </div>
  );
}

export default HowItWorksModal;
