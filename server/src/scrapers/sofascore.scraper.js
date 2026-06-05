// ============================================================
// Sofascore Scraper — Últimos partidos de cada selección
// Usa la API pública no-oficial de Sofascore (JSON, sin auth)
// ============================================================

// Mapa de nombre de equipo → ID de Sofascore para selecciones nacionales
// IDs obtenidos de: https://api.sofascore.com/api/v1/search/all?q=<team>
const SOFASCORE_IDS = {
  'Algeria':                 2,
  'Argentina':               6,
  'Australia':               24,
  'Austria':                 1,
  'Belgium':                 1,    // placeholder - se busca dinámicamente
  'Bosnia and Herzegovina':  1,
  'Brazil':                  6,
  'Canada':                  1,
  'Cape Verde':              1,
  'Colombia':                1,
  'Czechia':                 1,
  'DR Congo':                1,
  'Ecuador':                 1,
  'Egypt':                   1,
  'England':                 1,
  'France':                  1,
  'Germany':                 1,
  'Ghana':                   1,
  'Haiti':                   1,
  'Iran':                    1,
  'Iraq':                    1,
  'Japan':                   1,
  'Jordan':                  1,
  'Mexico':                  1,
  'Morocco':                 1,
  'Netherlands':             1,
  'New Zealand':             1,
  'Norway':                  1,
  'Panama':                  1,
  'Paraguay':                1,
  'Portugal':                1,
  'Qatar':                   1,
  'Saudi Arabia':            1,
  'Scotland':                1,
  'Senegal':                 1,
  'South Africa':            1,
  'South Korea':             1,
  'Spain':                   1,
  'Sweden':                  1,
  'Switzerland':             1,
  "Cote d'Ivoire":           1,
  'Tunisia':                 1,
  'Turkey':                  1,
  'Uruguay':                 1,
  'USA':                     1,
  'Uzbekistan':              1,
  'Curacao':                 1,
  'Croatia':                 1,
};

const SOFASCORE_BASE = 'https://api.sofascore.com/api/v1';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Referer': 'https://www.sofascore.com/',
};

/**
 * Busca el ID de Sofascore para un equipo nacional
 */
async function findSofascoreTeamId(teamName) {
  try {
    const searchNames = {
      'USA':                    'United States',
      'Czechia':                'Czech Republic',
      "Cote d'Ivoire":          'Ivory Coast',
      'Turkey':                 'Turkey',
      'DR Congo':               'Congo',
      'Bosnia and Herzegovina': 'Bosnia',
      'Curacao':                'Curaçao',
      'Cape Verde':             'Cape Verde',
      'South Korea':            'South Korea',
    };

    const query = searchNames[teamName] || teamName;
    const url = `${SOFASCORE_BASE}/search/all?q=${encodeURIComponent(query)}`;

    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;

    const data = await res.json();

    // Buscar en resultados de equipos — filtrar por fútbol + selección nacional
    const teams = data.teams || [];
    const match = teams.find(t => {
      const name = t.name?.toLowerCase() || '';
      const sport = t.sport?.slug || '';
      const category = t.category?.name?.toLowerCase() || '';

      return sport === 'football' && (
        category.includes('international') ||
        name.includes(query.toLowerCase()) ||
        name.includes(teamName.toLowerCase())
      );
    });

    return match?.id || null;
  } catch {
    return null;
  }
}

/**
 * Obtiene los últimos N partidos de un equipo desde Sofascore
 */
async function fetchSofascoreRecentMatches(teamId, limit = 5) {
  try {
    // Sofascore pagina de 10 en 10, página 0 = más recientes
    const url = `${SOFASCORE_BASE}/team/${teamId}/events/last/0`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return [];

    const data = await res.json();
    const events = (data.events || [])
      .filter(e => e.status?.type === 'finished')
      .slice(0, limit);

    return events.map(e => ({
      date:         e.startTimestamp ? new Date(e.startTimestamp * 1000).toISOString() : null,
      homeTeam:     e.homeTeam?.name || '',
      awayTeam:     e.awayTeam?.name || '',
      homeScore:    e.homeScore?.current ?? null,
      awayScore:    e.awayScore?.current ?? null,
      competition:  e.tournament?.name || 'International',
      venue:        e.venue?.name || null,
      sofascoreId:  e.id,
      source:       'sofascore',
    }));
  } catch {
    return [];
  }
}

/**
 * Scraper principal — obtiene últimos partidos para todos los equipos via Sofascore
 * @param {string[]} teamNames
 * @returns {Map<string, Array>}
 */
export async function scrapeRecentMatchesSofascore(teamNames) {
  console.log('\n  📡 Sofascore Scraper — Últimos partidos por selección');
  const results = new Map();

  for (const teamName of teamNames) {
    process.stdout.write(`     ${teamName}... `);

    try {
      const teamId = await findSofascoreTeamId(teamName);

      if (!teamId) {
        console.log(`⚠️  no encontrado en Sofascore`);
        results.set(teamName, []);
        continue;
      }

      const matches = await fetchSofascoreRecentMatches(teamId, 5);
      console.log(`✅ ${matches.length} partidos (ID: ${teamId})`);
      results.set(teamName, matches);

      // Rate limiting gentil
      await new Promise(r => setTimeout(r, 800));

    } catch (err) {
      console.log(`❌ ${err.message}`);
      results.set(teamName, []);
    }
  }

  return results;
}
