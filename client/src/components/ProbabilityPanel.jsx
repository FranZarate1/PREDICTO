/**
 * ProbabilityPanel — Sub-fase 1D.3 y 1D.4
 * Panel sticky que muestra la probabilidad acumulada de toda la predicción
 * y el desglose por grupo.
 */

function ProbabilityPanel({ predictions, groups, probability, onCalculate }) {
  const completedGroups = Object.values(predictions).filter(
    (p) => p.firstPlaceTeamId && p.secondPlaceTeamId
  ).length;

  const totalGroups = groups.length || 8;
  const progressPercent = (completedGroups / totalGroups) * 100;

  return (
    <div className="glass" style={{
      position: 'sticky',
      bottom: 'var(--spacing-lg)',
      padding: 'var(--spacing-lg)',
      marginTop: 'var(--spacing-xl)',
      zIndex: 10,
    }}>
      {/* Barra de progreso */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)',
      }}>
        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
          Progreso: {completedGroups}/{totalGroups} grupos
        </span>
        <span style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-size-xs)',
        }}>
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Barra visual */}
      <div style={{
        width: '100%',
        height: 6,
        background: 'var(--border-color)',
        borderRadius: 'var(--border-radius-xl)',
        overflow: 'hidden',
        marginBottom: 'var(--spacing-lg)',
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
          borderRadius: 'var(--border-radius-xl)',
          transition: 'width var(--transition-slow)',
        }} />
      </div>

      {/* Resultado de probabilidad */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-lg)',
      }}>
        <div>
          {probability ? (
            <>
              <div style={{
                fontSize: 'var(--font-size-4xl)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}>
                <span className="gradient-text">
                  {probability.combinedProbability !== null
                    ? `${probability.combinedProbability.toFixed(2)}%`
                    : '—'}
                </span>
              </div>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
              }}>
                Probabilidad combinada de tu predicción
              </p>
              {probability.totalGroupsWithOdds !== undefined && (
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: 'var(--font-size-xs)',
                  marginTop: 'var(--spacing-xs)',
                }}>
                  Basado en cuotas de {probability.totalGroupsWithOdds} grupos
                </p>
              )}
            </>
          ) : (
            <>
              <div style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 700,
                color: 'var(--text-muted)',
              }}>
                Esperando predicción...
              </div>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: 'var(--font-size-sm)',
              }}>
                Completá al menos un grupo y presioná Calcular
              </p>
            </>
          )}
        </div>

        <button
          onClick={onCalculate}
          disabled={completedGroups === 0}
          style={{
            padding: 'var(--spacing-md) var(--spacing-xl)',
            borderRadius: 'var(--border-radius-md)',
            border: 'none',
            background: completedGroups > 0
              ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))'
              : 'var(--border-color)',
            color: completedGroups > 0 ? '#fff' : 'var(--text-muted)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-base)',
            fontWeight: 700,
            cursor: completedGroups > 0 ? 'pointer' : 'not-allowed',
            transition: 'all var(--transition-base)',
            boxShadow: completedGroups > 0 ? 'var(--shadow-glow)' : 'none',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (completedGroups > 0) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ⚡ Calcular Probabilidad
        </button>
      </div>

      {/* Desglose por grupo */}
      {probability?.groupProbabilities && probability.groupProbabilities.length > 0 && (
        <div style={{
          marginTop: 'var(--spacing-lg)',
          paddingTop: 'var(--spacing-md)',
          borderTop: '1px solid var(--border-color)',
        }}>
          <h4 style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-sm)',
          }}>
            Desglose por grupo
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 'var(--spacing-sm)',
          }}>
            {probability.groupProbabilities.map((gp, i) => (
              <div key={i} style={{
                padding: 'var(--spacing-sm)',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--border-radius-sm)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-muted)',
                }}>
                  Grupo {i + 1}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 700,
                  color: gp.groupProbability
                    ? 'var(--color-accent-light)'
                    : 'var(--text-muted)',
                }}>
                  {gp.groupProbability
                    ? `${gp.groupProbability.toFixed(1)}%`
                    : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProbabilityPanel;
