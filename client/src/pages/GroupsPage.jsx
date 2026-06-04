/**
 * GroupsPage — Sub-fase 1D.1
 * Pantalla principal: grilla con los 8 grupos del Mundial.
 * Cada grupo permite seleccionar el 1ro y 2do clasificado.
 */

import { useState, useEffect } from 'react';
import GroupCard from '../components/GroupCard.jsx';
import ProbabilityPanel from '../components/ProbabilityPanel.jsx';
import api from '../services/api.js';

function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [probability, setProbability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar grupos al montar
  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await api.get('/api/groups');
        setGroups(response.data.data);
      } catch (err) {
        setError('No se pudieron cargar los grupos. ¿Está corriendo el servidor?');
        console.error('Error cargando grupos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  // Manejar selección de predicción para un grupo
  const handlePrediction = (groupId, firstPlaceTeamId, secondPlaceTeamId) => {
    setPredictions((prev) => ({
      ...prev,
      [groupId]: { groupId, firstPlaceTeamId, secondPlaceTeamId },
    }));
  };

  // Calcular probabilidad combinada
  const handleCalculate = async () => {
    const items = Object.values(predictions);
    if (items.length === 0) return;

    try {
      const response = await api.post('/api/predictions/calculate', { items });
      setProbability(response.data.data);
    } catch (err) {
      console.error('Error calculando probabilidad:', err);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
      }}>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-size-lg)',
          animation: 'pulse 1.5s infinite',
        }}>
          Cargando grupos del Mundial...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--spacing-2xl)',
        color: 'var(--color-error)',
      }}>
        <p style={{ fontSize: 'var(--font-size-lg)' }}>{error}</p>
        <p style={{
          color: 'var(--text-muted)',
          marginTop: 'var(--spacing-md)',
          fontSize: 'var(--font-size-sm)',
        }}>
          Ejecutá <code>npm run dev:server</code> para iniciar el backend.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Título de sección */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 700,
          marginBottom: 'var(--spacing-sm)',
        }}>
          Fase de Grupos
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Seleccioná el 1ro y 2do clasificado de cada grupo para ver tu probabilidad combinada.
        </p>
      </div>

      {/* Grilla de grupos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-2xl)',
      }}>
        {groups.map((group, index) => (
          <div
            key={group.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <GroupCard
              group={group}
              prediction={predictions[group.id]}
              onPrediction={handlePrediction}
            />
          </div>
        ))}
      </div>

      {/* Panel de probabilidad */}
      <ProbabilityPanel
        predictions={predictions}
        groups={groups}
        probability={probability}
        onCalculate={handleCalculate}
      />
    </div>
  );
}

export default GroupsPage;
