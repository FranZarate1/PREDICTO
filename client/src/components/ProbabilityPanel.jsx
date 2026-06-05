/**
 * ProbabilityPanel — Panel sticky.
 * - 1 grupo seleccionado → muestra su probabilidad dentro del 100%
 * - Más de 1 grupo       → muestra probabilidad combinada
 */

import { formatProbability } from '../services/probability.js';

function ProbabilityPanel({ groups, predictions, groupProbs, combinedProb, singleGroupProb, completedGroups, totalGroups }) {
  const progress = (completedGroups / (totalGroups || 12)) * 100;

  const teamNameById = {};
  groups.forEach(g => g.groupTeams?.forEach(gt => { teamNameById[gt.team.id] = gt.team.name; }));

  const isSingle   = completedGroups === 1;
  const isMultiple = completedGroups > 1;

  return (
    <div className="glass" style={{
      position: 'sticky', bottom: 'var(--spacing-lg)',
      padding: 'var(--spacing-lg) var(--spacing-xl)',
      marginTop: 'var(--spacing-xl)', zIndex: 10,
      borderColor: completedGroups > 0 ? 'rgba(99,102,241,0.3)' : 'var(--border-color)',
    }}>
      {/* Barra de progreso */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Progreso</span>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: completedGroups === totalGroups ? 'var(--color-success)' : 'var(--text-secondary)' }}>
            {completedGroups}/{totalGroups} grupos
          </span>
        </div>
        <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', borderRadius: 99, transition: 'width var(--transition-slow)' }} />
        </div>
      </div>

      {/* Probabilidad principal */}
      {completedGroups === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-base)' }}>
          Elegí el 1° y 2° de un grupo para ver su probabilidad.
        </p>
      ) : isSingle && singleGroupProb ? (
        /* ── Un solo grupo ── */
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
            <span className="gradient-text" style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>
              {formatProbability(singleGroupProb.groupProb)}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            de probabilidad de que ocurra exactamente esto en este grupo
          </p>
          <div style={{ marginTop: 6, display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>🥇 P(1°) ≈ <strong style={{ color: 'var(--color-primary-light)' }}>{singleGroupProb.firstProb.toFixed(1)}%</strong></span>
            <span>🥈 P(2°) ≈ <strong style={{ color: 'var(--color-accent-light)' }}>{singleGroupProb.secondProb.toFixed(1)}%</strong></span>
            {singleGroupProb.thirdProb !== null && (
              <span>🥉 P(3°) ≈ <strong style={{ color: 'var(--color-success)' }}>{singleGroupProb.thirdProb.toFixed(1)}%</strong></span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 4, fontStyle: 'italic' }}>
            Seleccioná más grupos para ver la probabilidad combinada del pronóstico completo
          </p>
        </div>
      ) : isMultiple && combinedProb !== null ? (
        /* ── Múltiples grupos ── */
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
            <span className="gradient-text" style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>
              {formatProbability(combinedProb)}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            probabilidad combinada de acertar los {completedGroups} grupos seleccionados
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 4, fontStyle: 'italic' }}>
            ⚡ Estimada con ranking FIFA — se actualizará con cuotas reales al inicio del torneo
          </p>
        </div>
      ) : null}

      {/* Desglose por grupo */}
      {Object.keys(groupProbs).length > 0 && (
        <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--spacing-sm)' }}>
            Desglose por grupo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 'var(--spacing-sm)' }}>
            {groups.map(group => {
              const pred = predictions[group.id];
              const gp   = groupProbs[group.id];
              if (!pred?.firstPlaceTeamId || !pred?.secondPlaceTeamId) return null;
              return (
                <div key={group.id} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 3 }}>{group.name}</div>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--color-accent-light)', marginBottom: 4 }}>
                    {gp ? formatProbability(gp.groupProb) : '—'}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <div>🥇 <span style={{ color: 'var(--color-primary-light)' }}>{teamNameById[pred.firstPlaceTeamId]?.split(' ')[0]}</span></div>
                    <div>🥈 <span style={{ color: 'var(--color-accent-light)' }}>{teamNameById[pred.secondPlaceTeamId]?.split(' ')[0]}</span></div>
                    {pred.thirdPlaceTeamId && (
                      <div>🥉 <span style={{ color: 'var(--color-success)' }}>{teamNameById[pred.thirdPlaceTeamId]?.split(' ')[0]}</span></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProbabilityPanel;
