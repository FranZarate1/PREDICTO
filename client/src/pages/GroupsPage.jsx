import { useState, useEffect, useMemo } from 'react';
import GroupCard from '../components/GroupCard.jsx';
import ProbabilityPanel from '../components/ProbabilityPanel.jsx';
import HowItWorksModal from '../components/HowItWorksModal.jsx';
import api from '../services/api.js';
import { estimateGroupProbability, combineProbabilities, formatProbability } from '../services/probability.js';

function GroupsPage() {
  const [groups, setGroups]           = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [showModal, setShowModal]     = useState(false);

  useEffect(() => {
    api.get('/api/groups')
      .then(r => setGroups(r.data.data))
      .catch(() => setError('No se pudieron cargar los grupos. ¿Está corriendo el servidor?'))
      .finally(() => setLoading(false));
  }, []);

  // Acepta thirdPlaceTeamId también
  const handlePrediction = (groupId, firstPlaceTeamId, secondPlaceTeamId, thirdPlaceTeamId = null) => {
    setPredictions(prev => {
      // Si no hay ninguna selección → borrar el grupo
      if (!firstPlaceTeamId && !secondPlaceTeamId && !thirdPlaceTeamId) {
        const next = { ...prev };
        delete next[groupId];
        return next;
      }
      return { ...prev, [groupId]: { groupId, firstPlaceTeamId, secondPlaceTeamId, thirdPlaceTeamId } };
    });
  };

  // Recalcula probabilidades cada vez que cambia predictions o groups
  const { groupProbs, combinedProb, completedGroups } = useMemo(() => {
    const groupProbs = {};
    const allProbs   = [];

    for (const group of groups) {
      const pred = predictions[group.id];
      // Necesita al menos 1° y 2° para calcular
      if (!pred?.firstPlaceTeamId || !pred?.secondPlaceTeamId) continue;

      const teams  = group.groupTeams?.map(gt => gt.team) || [];
      const result = estimateGroupProbability(
        teams,
        pred.firstPlaceTeamId,
        pred.secondPlaceTeamId,
        pred.thirdPlaceTeamId || null,
      );

      if (result) {
        groupProbs[group.id] = result;
        allProbs.push(result.groupProb);
      }
    }

    return {
      groupProbs,
      combinedProb:    allProbs.length > 1 ? combineProbabilities(allProbs) : null,
      completedGroups: allProbs.length,
    };
  }, [groups, predictions]);

  // Prob del único grupo seleccionado (para mostrar "dentro del 100%")
  const singleGroupId  = completedGroups === 1 ? Object.keys(groupProbs)[0] : null;
  const singleGroupProb = singleGroupId ? groupProbs[singleGroupId] : null;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 'var(--spacing-md)' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)' }}>Cargando grupos del Mundial 2026...</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
      <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>⚠️</div>
      <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>{error}</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
        Ejecutá <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>npm run dev</code> para iniciar el servidor.
      </p>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--spacing-xs)', letterSpacing: '-0.02em' }}>
            Fase de Grupos
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 520 }}>
            Elegí el <strong style={{ color: 'var(--color-primary-light)' }}>1°</strong>,{' '}
            <strong style={{ color: 'var(--color-accent)' }}>2°</strong> y opcionalmente{' '}
            <strong style={{ color: 'var(--color-success)' }}>3°</strong> de cada grupo.
            Click de nuevo para desmarcar.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 'var(--border-radius-xl)',
            border: '1px solid rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.08)',
            color: 'var(--color-primary-light)', cursor: 'pointer',
            fontSize: 'var(--font-size-sm)', fontWeight: 600, fontFamily: 'var(--font-family)',
            transition: 'all var(--transition-fast)', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.16)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
        >
          💡 ¿Cómo funciona?
        </button>
      </div>

      {/* Badges de progreso */}
      {completedGroups > 0 && (
        <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          <div style={{ padding: '5px 14px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 99 }}>
            <span style={{ color: 'var(--color-primary-light)', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
              ✓ {completedGroups}/{groups.length} grupos
            </span>
          </div>

          {/* Un solo grupo → mostrar su prob "dentro del 100%" */}
          {singleGroupProb && (
            <div style={{ padding: '5px 14px', background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 99 }}>
              <span style={{ color: 'var(--color-accent-light)', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                {formatProbability(singleGroupProb.groupProb)} de probabilidad en este grupo
              </span>
            </div>
          )}

          {/* Múltiples grupos → mostrar combinada */}
          {combinedProb !== null && (
            <div style={{ padding: '5px 14px', background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 99 }}>
              <span style={{ color: 'var(--color-accent-light)', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                ⚡ {formatProbability(combinedProb)} combinado
              </span>
            </div>
          )}
        </div>
      )}

      {/* Grid de grupos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-2xl)' }}>
        {groups.map((group, index) => (
          <div key={group.id} className="animate-slide-up" style={{ animationDelay: `${index * 40}ms` }}>
            <GroupCard
              group={group}
              prediction={predictions[group.id]}
              onPrediction={handlePrediction}
            />
          </div>
        ))}
      </div>

      {/* Panel inferior */}
      <ProbabilityPanel
        groups={groups}
        predictions={predictions}
        groupProbs={groupProbs}
        combinedProb={combinedProb}
        singleGroupProb={singleGroupProb}
        completedGroups={completedGroups}
        totalGroups={groups.length}
      />

      {showModal && <HowItWorksModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default GroupsPage;
