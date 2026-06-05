/**
 * GroupCard — con selector de 1°, 2° y 3°. Toggle para desmarcar.
 */

import { estimateGroupProbability, formatProbability } from '../services/probability.js';

const CONF_BADGE = {
  UEFA:     'badge-uefa',
  CONMEBOL: 'badge-conmebol',
  CONCACAF: 'badge-concacaf',
  AFC:      'badge-afc',
  CAF:      'badge-caf',
  OFC:      'badge-ofc',
};

function PositionButton({ label, active, color, hoverColor, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28,
        borderRadius: '50%',
        border: active ? `2px solid ${color}` : '1px solid var(--border-color)',
        background: active ? color : 'transparent',
        color: active ? '#fff' : 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: 10, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all var(--transition-fast)',
        fontFamily: 'var(--font-family)',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!active) { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = hoverColor; }
        else         { e.currentTarget.style.opacity = '0.65'; }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.borderColor = active ? color : 'var(--border-color)';
        e.currentTarget.style.color = active ? '#fff' : 'var(--text-muted)';
      }}
    >
      {label}
    </button>
  );
}

function TeamRow({ team, pos, onSelect }) {
  const isFirst  = pos === 1;
  const isSecond = pos === 2;
  const isThird  = pos === 3;
  const selected = isFirst || isSecond || isThird;

  const rowBg    = isFirst ? 'rgba(99,102,241,0.12)' : isSecond ? 'rgba(245,158,11,0.12)' : isThird ? 'rgba(16,185,129,0.10)' : 'transparent';
  const rowBorder= isFirst ? '1px solid rgba(99,102,241,0.4)' : isSecond ? '1px solid rgba(245,158,11,0.4)' : isThird ? '1px solid rgba(16,185,129,0.35)' : '1px solid transparent';
  const nameColor= isFirst ? 'var(--color-primary-light)' : isSecond ? 'var(--color-accent-light)' : isThird ? 'var(--color-success)' : 'var(--text-primary)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px var(--spacing-md)', borderRadius: 'var(--border-radius-sm)', background: rowBg, border: rowBorder, transition: 'all var(--transition-fast)' }}>
      {/* Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <div style={{ width: 26, height: 26, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {team.crestUrl
            ? <img src={team.crestUrl} alt={team.name} style={{ width: 22, height: 22, objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
            : <span style={{ fontSize: 16 }}>🏳️</span>}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontWeight: selected ? 700 : 500, fontSize: 'var(--font-size-sm)', color: nameColor, whiteSpace: 'nowrap' }}>{team.name}</span>
            {team.tla && <span style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }}>{team.tla}</span>}
          </div>
          <div style={{ display: 'flex', gap: 5, marginTop: 1 }}>
            {team.fifaRanking && <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>FIFA #{team.fifaRanking}</span>}
            {team.confederation && (
              <span className={CONF_BADGE[team.confederation] || ''} style={{ fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, border: '1px solid', letterSpacing: '0.03em' }}>
                {team.confederation}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botones 1°, 2°, 3° */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 6 }}>
        <PositionButton label="1°" active={isFirst}  color="var(--color-primary)"  hoverColor="var(--color-primary-light)" onClick={() => onSelect(1)} title={isFirst  ? 'Desmarcar 1ro' : '1er clasificado'} />
        <PositionButton label="2°" active={isSecond} color="var(--color-accent)"   hoverColor="var(--color-accent-light)"  onClick={() => onSelect(2)} title={isSecond ? 'Desmarcar 2do' : '2do clasificado'} />
        <PositionButton label="3°" active={isThird}  color="var(--color-success)"  hoverColor="#34d399"                    onClick={() => onSelect(3)} title={isThird  ? 'Desmarcar 3ro' : '3er clasificado'} />
      </div>
    </div>
  );
}

function GroupCard({ group, prediction, onPrediction }) {
  const teams = group.groupTeams?.map(gt => gt.team) || [];
  const { firstPlaceTeamId: fId, secondPlaceTeamId: sId, thirdPlaceTeamId: tId } = prediction || {};

  const hasFirst  = !!fId;
  const hasSecond = !!sId;
  const hasThird  = !!tId;
  const isComplete = hasFirst && hasSecond; // mínimo 1° y 2° para calcular

  // Probabilidad del grupo (calculada client-side al instante)
  const groupProb = isComplete
    ? estimateGroupProbability(teams, fId, sId, hasThird ? tId : null)
    : null;

  const handleSelect = (teamId, position) => {
    const cur = prediction || {};
    // Toggle: si ya está en esa posición → desmarcar
    if (position === 1 && cur.firstPlaceTeamId  === teamId) { onPrediction(group.id, null, cur.secondPlaceTeamId, cur.thirdPlaceTeamId); return; }
    if (position === 2 && cur.secondPlaceTeamId === teamId) { onPrediction(group.id, cur.firstPlaceTeamId, null, cur.thirdPlaceTeamId);  return; }
    if (position === 3 && cur.thirdPlaceTeamId  === teamId) { onPrediction(group.id, cur.firstPlaceTeamId, cur.secondPlaceTeamId, null);  return; }

    let next = {
      firstPlaceTeamId:  position === 1 ? teamId : cur.firstPlaceTeamId,
      secondPlaceTeamId: position === 2 ? teamId : cur.secondPlaceTeamId,
      thirdPlaceTeamId:  position === 3 ? teamId : cur.thirdPlaceTeamId,
    };
    // Validar que no haya duplicados entre posiciones
    const ids = [next.firstPlaceTeamId, next.secondPlaceTeamId, next.thirdPlaceTeamId].filter(Boolean);
    if (new Set(ids).size !== ids.length) return; // duplicado → ignorar
    onPrediction(group.id, next.firstPlaceTeamId, next.secondPlaceTeamId, next.thirdPlaceTeamId);
  };

  const posOf = (id) => {
    if (!id) return 0;
    if (id === fId) return 1;
    if (id === sId) return 2;
    if (id === tId) return 3;
    return 0;
  };

  return (
    <div
      className="glass"
      style={{ padding: 'var(--spacing-lg)', transition: 'transform var(--transition-base), box-shadow var(--transition-base)', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
    >
      {/* Barra top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: isComplete ? 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' : 'var(--border-color)', transition: 'background var(--transition-slow)' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {group.name}
        </h3>
        {isComplete && groupProb ? (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--color-accent-light)' }}>
              {formatProbability(groupProb.groupProb)}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>prob. del grupo</div>
          </div>
        ) : (
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {!hasFirst && !hasSecond ? '' : hasFirst && !hasSecond ? 'Falta 2°' : !hasFirst && hasSecond ? 'Falta 1°' : ''}
          </span>
        )}
      </div>

      {/* Equipos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
        {teams.map(team => (
          <TeamRow
            key={team.id}
            team={team}
            pos={posOf(team.id)}
            onSelect={(position) => handleSelect(team.id, position)}
          />
        ))}
      </div>

      {/* Footer resumen */}
      {isComplete && (
        <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11 }}>
          <span>🥇 <strong style={{ color: 'var(--color-primary-light)' }}>{teams.find(t => t.id === fId)?.name}</strong></span>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span>🥈 <strong style={{ color: 'var(--color-accent-light)' }}>{teams.find(t => t.id === sId)?.name}</strong></span>
          {hasThird && <><span style={{ color: 'var(--text-muted)' }}>·</span>
          <span>🥉 <strong style={{ color: 'var(--color-success)' }}>{teams.find(t => t.id === tId)?.name}</strong></span></>}
        </div>
      )}
    </div>
  );
}

export default GroupCard;
