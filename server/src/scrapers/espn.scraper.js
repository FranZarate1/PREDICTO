// ============================================================
// ESPN Scraper — Últimos partidos de cada selección
// Usa la API pública no-oficial de ESPN (JSON, sin Playwright)
// ============================================================

import * as cheerio from 'cheerio';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

// Mapa de nombre FIFA → league ID de ESPN para selecciones nacionales
// ESPN usa 'fifa.world' para partidos de selecciones nacionales
const ESPN_LEAGUE = 'fifa.world';

// Mapa de nombres para buscar en ESPN (algunos difieren del nombre FIFA)
const ESPN_TEAM_NAMES = {
  'Czechia': 'Czech Republic',
  'Cote d\'Ivoire': 'Ivory Coast',
  'Turkey': 'Turkey',
  'DR Congo': 'Congo DR',
  'Bosnia and Herzegovina': 'Bosnia',
  'Curacao': 'Curacao',
};

/**
 * Busca el ID de ESPN para un equipo por nombre
 */
async function findESPNTeamId(teamName) {
  const searchName = ESPN_TEAM_NAMES[teamName] || teamName;
  try {
    const url = `${ESPN_BASE}/${ESPN_LEAGUE}/teams?limit=100`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AppMundial/1.0)' }
    });
    if (!res.ok) return null;
    const data = await res.json();

    const teams = data.sports?.[0]?.leagues?.[0]?.teams || [];
    const match = teams.find(t =>
      t.team.displayName.toLowerCase() === searchName.toLowerCase() ||
      t.team.shortDisplayName.toLowerCase() === searchName.toLowerCase() ||
      t.team.abbreviation.toLowerCase() === (teamName.slice(0, 3)).toLowerCase()
    );
    return match?.team?.id || null;
  } catch {
    return null;
  }
}

/**
 * Obtiene los últimos N partidos de un equipo desde ESPN
 */
async function fetchRecentMatches(espnTeamId, limit = 5) {
  try {
    const url = `${ESPN_BASE}/${ESPN_LEAGUE}/teams/${espnTeamId}/schedule?limit=${limit + 10}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AppMundial/1.0)' }
    });
    if (!res.ok) return [];

    const data = await res.json();
    const events = data.events || [];

    // Filtrar solo los partidos ya jugados y tomar los últimos N
    const played = events
      .filter(e => e.competitions?.[0]?.status?.type?.completed === true)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    return played.map(event => {
      const comp = event.competitions[0];
      const home = comp.competitors.find(c => c.homeAway === 'home');
      const away = comp.competitors.find(c => c.homeAway === 'away');

      return {
        date:          event.date,
        venue:         comp.venue?.fullName || null,
        homeTeam:      home?.team?.displayName || '',
        awayTeam:      away?.team?.displayName || '',
        homeScore:     parseInt(home?.score || '0'),
        awayScore:     parseInt(away?.score || '0'),
        competition:   event.season?.slug || event.name || 'Friendly',
        isNeutral:     comp.neutralSite || false,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Scraper principal — obtiene últimos partidos para todos los equipos
 * @param {string[]} teamNames - Lista de nombres de equipos
 * @returns {Map<string, Array>} - teamName -> array de partidos
 */
export async function scrapeRecentMatches(teamNames) {
  console.log('\n  📡 ESPN Scraper — Últimos partidos por selección');
  const results = new Map();

  for (const teamName of teamNames) {
    try {
      process.stdout.write(`     Buscando ${teamName}... `);

      const espnId = await findESPNTeamId(teamName);
      if (!espnId) {
        console.log('⚠️  no encontrado en ESPN, usando fallback');
        const fallback = await scrapeRecentMatchesFromWikipedia(teamName);
        results.set(teamName, fallback);
        continue;
      }

      const matches = await fetchRecentMatches(espnId, 5);
      console.log(`✅ ${matches.length} partidos`);
      results.set(teamName, matches);

      // Rate limiting gentil — espera 500ms entre requests
      await new Promise(r => setTimeout(r, 500));

    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      results.set(teamName, []);
    }
  }

  return results;
}

/**
 * Fallback: últimos partidos desde Wikipedia
 * Parsea la tabla de resultados recientes de la página de la selección
 */
async function scrapeRecentMatchesFromWikipedia(teamName) {
  try {
    // Wikipedia API — búsqueda de la página de la selección
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(teamName + ' national football team')}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const pageTitle = searchData.query?.search?.[0]?.title;
    if (!pageTitle) return [];

    // Obtener el HTML de la página
    const pageUrl = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(pageTitle)}`;
    const pageRes = await fetch(pageUrl, {
      headers: { 'User-Agent': 'AppMundial/1.0 (educational project)' }
    });
    if (!pageRes.ok) return [];

    const html = await pageRes.text();
    const $ = cheerio.load(html);

    const matches = [];

    // Buscar tablas con resultados — Wikipedia las tiene en secciones de resultados
    $('table.wikitable').each((_, table) => {
      const headers = $(table).find('th').map((_, el) => $(el).text().trim().toLowerCase()).get();

      // Verificar si es tabla de partidos (tiene columnas de fecha, rival, resultado)
      const hasMatchData = headers.some(h => h.includes('date') || h.includes('opponent') || h.includes('result'));
      if (!hasMatchData) return;

      $(table).find('tr').slice(1).each((_, row) => {
        const cells = $(row).find('td').map((_, td) => $(td).text().trim()).get();
        if (cells.length >= 3) {
          // Intentar parsear fecha y resultado
          const dateStr = cells[0];
          const opponent = cells[2] || cells[1];
          const result   = cells[3] || cells[2];

          if (dateStr && opponent && result && /\d/.test(result)) {
            const scoreMatch = result.match(/(\d+)[–\-](\d+)/);
            if (scoreMatch) {
              matches.push({
                date:      dateStr,
                homeTeam:  teamName,
                awayTeam:  opponent.replace(/\[.*?\]/g, '').trim(),
                homeScore: parseInt(scoreMatch[1]),
                awayScore: parseInt(scoreMatch[2]),
                competition: 'International',
                source:    'wikipedia',
              });
            }
          }
        }
      });

      if (matches.length >= 5) return false; // break each
    });

    return matches.slice(0, 5);
  } catch {
    return [];
  }
}
