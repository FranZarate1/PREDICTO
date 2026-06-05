// ============================================================
// Wikipedia Scraper — Datos de selecciones y jugadores
// Usa la Wikipedia API pública (JSON, sin Playwright)
// ============================================================

import * as cheerio from 'cheerio';

const WP_API = 'https://en.wikipedia.org/w/api.php';
const WP_REST = 'https://en.wikipedia.org/api/rest_v1/page/html';

/**
 * Obtiene el HTML de una página de Wikipedia por título
 */
async function getPageHtml(title) {
  try {
    const res = await fetch(`${WP_REST}/${encodeURIComponent(title)}`, {
      headers: { 'User-Agent': 'AppMundial/1.0 (educational; contact: dev@appmundial.com)' }
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/**
 * Busca el título de la página Wikipedia de una selección nacional
 */
async function findTeamWikipediaTitle(teamName) {
  // Alias conocidos
  const ALIASES = {
    'USA':                    'United States men\'s national soccer team',
    'South Korea':            'South Korea national football team',
    'Czechia':                'Czech Republic national football team',
    'South Africa':           'South Africa national football team',
    "Cote d'Ivoire":          'Ivory Coast national football team',
    'Turkey':                 'Turkey national football team',
    'DR Congo':               'DR Congo national football team',
    'Bosnia and Herzegovina': 'Bosnia and Herzegovina national football team',
    'Curacao':                'Curaçao national football team',
    'Cape Verde':             'Cape Verde national football team',
    // Aliases adicionales (fallaron en la primera ejecución)
    'Norway':                 'Norway national football team',
    'Panama':                 'Panama national football team',
    'Paraguay':               'Paraguay national football team',
    'Portugal':               'Portugal national football team',
    'Algeria':                'Algeria national football team',
    'Austria':                'Austria national football team',
    'Jordan':                 'Jordan national football team',
    'Uzbekistan':             'Uzbekistan national football team',
    'Colombia':               'Colombia national football team',
    'Croatia':                'Croatia national football team',
    'Ghana':                  'Ghana national football team',
    'Iraq':                   'Iraq national football team',
    'Iran':                   'Iran national football team',
    'Egypt':                  'Egypt national football team',
    'Belgium':                'Belgium national football team',
    'Netherlands':            'Netherlands national football team',
    'Japan':                  'Japan national football team',
    'Sweden':                 'Sweden national football team',
    'Tunisia':                'Tunisia national football team',
    'Haiti':                  'Haiti national football team',
    'Morocco':                'Morocco national football team',
    'Brazil':                 'Brazil national football team',
    'France':                 'France national football team',
    'Germany':                'Germany national football team',
    'Ecuador':                'Ecuador national football team',
    'Mexico':                 'Mexico national football team',
    'England':                'England national football team',
    'Argentina':              'Argentina national football team',
    'Spain':                  'Spain national football team',
    'Uruguay':                'Uruguay national football team',
    'Australia':              'Australia national football team',
    'Canada':                 'Canada men\'s national soccer team',
    'Switzerland':            'Switzerland national football team',
    'Qatar':                  'Qatar national football team',
    'New Zealand':            'New Zealand national football team',
    'Scotland':               'Scotland national football team',
    'Senegal':                'Senegal national football team',
  };

  const searchTitle = ALIASES[teamName] || `${teamName} national football team`;

  try {
    const url = `${WP_API}?action=query&list=search&srsearch=${encodeURIComponent(searchTitle)}&format=json&origin=*&srlimit=1`;
    const res = await fetch(url);
    const data = await res.json();
    return data.query?.search?.[0]?.title || null;
  } catch {
    return null;
  }
}

/**
 * Extrae el squad (plantilla) de jugadores de la página Wikipedia de un equipo
 * Las páginas de selecciones nacionales tienen una tabla de plantilla convocada
 */
function extractSquad($, teamName) {
  const players = [];

  // Wikipedia organiza la plantilla en tablas con clase 'wikitable'
  // Buscamos la que tiene columnas de número, posición, nombre
  $('table.wikitable').each((_, table) => {
    const headers = $(table).find('th')
      .map((_, el) => $(el).text().trim().toLowerCase())
      .get();

    const hasPlayerData = 
      headers.some(h => h.includes('pos') || h.includes('position')) &&
      headers.some(h => h.includes('player') || h.includes('name'));

    if (!hasPlayerData) return;

    // Índices de columnas
    const posIdx  = headers.findIndex(h => h.includes('pos'));
    const nameIdx = headers.findIndex(h => h.includes('player') || h.includes('name'));
    const numIdx  = headers.findIndex(h => h === 'no.' || h === 'no' || h === '#');
    const clubIdx = headers.findIndex(h => h.includes('club'));

    $(table).find('tr').slice(1).each((_, row) => {
      const cells = $(row).find('td').map((_, td) => $(td).text().trim().replace(/\[.*?\]/g, '')).get();
      if (cells.length < 2) return;

      const name     = cells[nameIdx] || cells[1] || '';
      const position = cells[posIdx]  || cells[0] || '';
      const number   = numIdx >= 0 ? parseInt(cells[numIdx]) : null;
      const club     = clubIdx >= 0 ? cells[clubIdx] : null;

      if (name && name.length > 2 && !/^\d+$/.test(name)) {
        const posCode = mapPosition(position);
        players.push({
          name:     cleanPlayerName(name),
          position: posCode,
          number:   isNaN(number) ? null : number,
          club:     club?.trim() || null,
        });
      }
    });

    if (players.length > 5) return false; // Encontramos la tabla correcta, salimos
  });

  return players.slice(0, 26); // Max 26 convocados en mundiales
}

/**
 * Extrae metadata del equipo (entrenador, confederación, etc.)
 */
function extractTeamMeta($) {
  const meta = {};

  // La infobox de Wikipedia tiene los datos estructurados
  $('table.infobox').first().find('tr').each((_, row) => {
    const label = $(row).find('th').text().trim().toLowerCase();
    const value = $(row).find('td').text().trim().replace(/\[.*?\]/g, '');

    if (label.includes('coach') || label.includes('manager'))  meta.coach = value;
    if (label.includes('confederation')) meta.confederation = value;
    if (label.includes('association'))  meta.association = value;
    if (label.includes('fifa rank'))    meta.fifaRankingText = value;
  });

  // URL de la imagen del escudo
  const crestImg = $('table.infobox img').first().attr('src');
  if (crestImg) {
    meta.crestUrl = crestImg.startsWith('//') ? `https:${crestImg}` : crestImg;
  }

  return meta;
}

function mapPosition(rawPos) {
  const p = rawPos.toUpperCase().trim();
  if (p.startsWith('GK') || p === 'G') return 'GK';
  if (p.startsWith('DF') || p === 'D' || p === 'CB' || p === 'LB' || p === 'RB') return 'DEF';
  if (p.startsWith('MF') || p === 'M' || p === 'CM' || p === 'DM' || p === 'AM') return 'MID';
  if (p.startsWith('FW') || p === 'F' || p === 'CF' || p === 'ST' || p === 'LW' || p === 'RW') return 'FWD';
  return null;
}

function cleanPlayerName(name) {
  return name
    .replace(/\[.*?\]/g, '')
    .replace(/\(c\)/gi, '')
    .replace(/\*/, '')
    .trim();
}

/**
 * Scraper principal — extrae datos de una selección desde Wikipedia
 * @param {string} teamName
 * @returns {{ meta, squad, wikipediaTitle }}
 */
export async function scrapeTeamFromWikipedia(teamName) {
  const title = await findTeamWikipediaTitle(teamName);
  if (!title) {
    console.log(`     ⚠️  No se encontró página Wikipedia para ${teamName}`);
    return { meta: {}, squad: [], wikipediaTitle: null };
  }

  const html = await getPageHtml(title);
  if (!html) {
    return { meta: {}, squad: [], wikipediaTitle: title };
  }

  const $ = cheerio.load(html);
  const meta  = extractTeamMeta($);
  const squad = extractSquad($, teamName);

  return {
    meta,
    squad,
    wikipediaTitle: title,
    wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  };
}

/**
 * Scraper para todos los equipos de una lista
 * @param {Array<{id, name}>} teams
 * @returns {Map<string, {meta, squad}>}
 */
export async function scrapeAllTeams(teams) {
  console.log('\n  📖 Wikipedia Scraper — Datos de selecciones y plantillas');
  const results = new Map();

  for (const team of teams) {
    process.stdout.write(`     ${team.name}... `);

    const data = await scrapeTeamFromWikipedia(team.name);
    results.set(team.id, data);

    const squadCount = data.squad.length;
    const hasMeta    = !!data.meta.coach;
    console.log(`✅ ${squadCount} jugadores${hasMeta ? `, DT: ${data.meta.coach.split('\n')[0]}` : ''}`);

    // Rate limiting — Wikipedia pide máximo 200 req/seg pero siendo gentiles
    await new Promise(r => setTimeout(r, 1000));
  }

  return results;
}
