/**
 * GroupCard — Sub-fase 1D.2
 * Card de un grupo con sus equipos y selector de predicción.
 */

function GroupCard({ group, prediction, onPrediction }) {
  const teams = group.groupTeams?.map((gt) => gt.team) || [];

  const handleSelect = (teamId, position) => {
    const current = prediction || {};
    const newPrediction = {
      firstPlaceTeamId: position === 'first' ? teamId : current.firstPlaceTeamId,
      secondPlaceTeamId: position === 'second' ? teamId : current.secondPlaceTeamId,
    };

    // No permitir que el mismo equipo sea 1ro y 2do
    if (newPrediction.firstPlaceTeamId === newPrediction.secondPlaceTeamId) {
      return;
    }

    onPrediction(group.id, newPrediction.firstPlaceTeamId, newPrediction.secondPlaceTeamId);
  };

  const isFirstPlace = (teamId) => prediction?.firstPlaceTeamId === teamId;
  const isSecondPlace = (teamId) => prediction?.secondPlaceTeamId === teamId;

  return (
    <div className="glass" style={{
      padding: 'var(--spacing-lg)',
      transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
      cursor: 'default',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* Header del grupo */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)',
        paddingBottom: 'var(--spacing-sm)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <h3 style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 700,
          color: 'var(--color-primary-light)',
        }}>
          {group.name.replace('GROUP_', 'Grupo ')}
        </h3>
        {prediction?.firstPlaceTeamId && prediction?.secondPlaceTeamId && (
          <span style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-success)',
            fontWeight: 600,
          }}>
            ✓ Completo
          </span>
        )}
      </div>

      {/* Lista de equipos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {teams.map((team) => (
          <div
            key={team.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--border-radius-sm)',
              background: isFirstPlace(team.id)
                ? 'rgba(99, 102, 241, 0.15)'
                : isSecondPlace(team.id)
                ? 'rgba(245, 158, 11, 0.15)'
                : 'transparent',
              border: isFirstPlace(team.id)
                ? '1px solid var(--color-primary)'
                : isSecondPlace(team.id)
                ? '1px solid var(--color-accent)'
                : '1px solid transparent',
              transition: 'all var(--transition-fast)',
            }}
          >
            {/* Info del equipo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              {team.crestUrl && (
                <img
                  src={team.crestUrl}
                  alt={team.name}
                  style={{ width: 24, height: 24, objectFit: 'contain' }}
                />
              )}
              <span style={{
                fontWeight: isFirstPlace(team.id) || isSecondPlace(team.id) ? 600 : 400,
                fontSize: 'var(--font-size-sm)',
              }}>
                {team.name}
              </span>
              {team.tla && (
                <span style={{
                  color: 'var(--text-muted)',
                  fontSize: 'var(--font-size-xs)',
                }}>
                  ({team.tla})
                </span>
              )}
            </div>

            {/* Botones de selección */}
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
              <button
                onClick={() => handleSelect(team.id, 'first')}
                title="Seleccionar como 1ro"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: isFirstPlace(team.id) ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                  background: isFirstPlace(team.id) ? 'var(--color-primary)' : 'transparent',
                  color: isFirstPlace(team.id) ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--transition-fast)',
                }}
              >
                1°
              </button>
              <button
                onClick={() => handleSelect(team.id, 'second')}
                title="Seleccionar como 2do"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: isSecondPlace(team.id) ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                  background: isSecondPlace(team.id) ? 'var(--color-accent)' : 'transparent',
                  color: isSecondPlace(team.id) ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--transition-fast)',
                }}
              >
                2°
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GroupCard;
