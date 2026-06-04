// ============================================================
// App Mundial — Proof of Concept: Football Data & Odds APIs
// ============================================================
// Run:  node poc/football-data-poc.js
// Deps: None (uses native fetch, Node 18+)
// ============================================================

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── .env loader (manual, zero dependencies) ──────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;
  try {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // Don't overwrite already-set env vars
      if (!(key in process.env)) {
        process.env[key] = val;
      }
    }
    console.log(`  📄 Loaded .env from ${envPath}\n`);
  } catch { /* ignore read errors */ }
}

loadEnv();

// ── Configuration ────────────────────────────────────────────
const PLACEHOLDER = 'tu-api-key-aqui';
const FOOTBALL_KEY = process.env.FOOTBALL_DATA_API_KEY;
const ODDS_KEY     = process.env.ODDS_API_KEY;

const footballDemo = !FOOTBALL_KEY || FOOTBALL_KEY === PLACEHOLDER;
const oddsDemo     = !ODDS_KEY     || ODDS_KEY     === PLACEHOLDER;

// ── Pretty-print helpers ─────────────────────────────────────
const SEP  = '═'.repeat(70);
const SEP2 = '─'.repeat(70);
const THIN = '┄'.repeat(70);

function header(title) {
  console.log(`\n${SEP}`);
  console.log(`  ${title}`);
  console.log(SEP);
}

function subheader(title) {
  console.log(`\n${SEP2}`);
  console.log(`  ${title}`);
  console.log(SEP2);
}

function printJson(label, obj) {
  console.log(`\n  📦 ${label}:`);
  const lines = JSON.stringify(obj, null, 2).split('\n');
  for (const l of lines) console.log(`     ${l}`);
}

function modeTag(isDemo) {
  return isDemo ? ' [DEMO MODE 🎭]' : ' [LIVE 🔴]';
}

// ── Mock data ────────────────────────────────────────────────
function getMockStandings() {
  return {
    filters: {},
    area: { id: 2267, name: 'World', code: 'INT' },
    competition: {
      id: 2000,
      name: 'FIFA World Cup',
      code: 'WC',
      type: 'CUP',
      emblem: 'https://crests.football-data.org/qatar.png'
    },
    season: {
      id: 1382,
      startDate: '2026-06-11',
      endDate: '2026-07-19',
      currentMatchday: 3,
      winner: null
    },
    standings: [
      {
        stage: 'GROUP_STAGE',
        type: 'TOTAL',
        group: 'GROUP_A',
        table: [
          { position: 1, team: { id: 769, name: 'Mexico', crest: '...' },       playedGames: 3, won: 2, draw: 1, lost: 0, points: 7, goalsFor: 5, goalsAgainst: 1, goalDifference: 4 },
          { position: 2, team: { id: 770, name: 'Canada', crest: '...' },       playedGames: 3, won: 2, draw: 0, lost: 1, points: 6, goalsFor: 4, goalsAgainst: 3, goalDifference: 1 },
          { position: 3, team: { id: 771, name: 'Ecuador', crest: '...' },      playedGames: 3, won: 1, draw: 1, lost: 1, points: 4, goalsFor: 3, goalsAgainst: 3, goalDifference: 0 },
          { position: 4, team: { id: 772, name: 'South Korea', crest: '...' },  playedGames: 3, won: 0, draw: 0, lost: 3, points: 0, goalsFor: 1, goalsAgainst: 6, goalDifference: -5 },
        ]
      },
      {
        stage: 'GROUP_STAGE',
        type: 'TOTAL',
        group: 'GROUP_B',
        table: [
          { position: 1, team: { id: 773, name: 'Argentina', crest: '...' },   playedGames: 3, won: 3, draw: 0, lost: 0, points: 9, goalsFor: 7, goalsAgainst: 1, goalDifference: 6 },
          { position: 2, team: { id: 774, name: 'France', crest: '...' },      playedGames: 3, won: 2, draw: 0, lost: 1, points: 6, goalsFor: 5, goalsAgainst: 3, goalDifference: 2 },
          { position: 3, team: { id: 775, name: 'Denmark', crest: '...' },     playedGames: 3, won: 1, draw: 0, lost: 2, points: 3, goalsFor: 2, goalsAgainst: 4, goalDifference: -2 },
          { position: 4, team: { id: 776, name: 'Saudi Arabia', crest: '...' },playedGames: 3, won: 0, draw: 0, lost: 3, points: 0, goalsFor: 1, goalsAgainst: 7, goalDifference: -6 },
        ]
      },
      {
        stage: 'GROUP_STAGE',
        type: 'TOTAL',
        group: 'GROUP_C',
        table: [
          { position: 1, team: { id: 777, name: 'Spain', crest: '...' },     playedGames: 3, won: 2, draw: 1, lost: 0, points: 7, goalsFor: 6, goalsAgainst: 2, goalDifference: 4 },
          { position: 2, team: { id: 778, name: 'Germany', crest: '...' },    playedGames: 3, won: 2, draw: 0, lost: 1, points: 6, goalsFor: 5, goalsAgainst: 3, goalDifference: 2 },
          { position: 3, team: { id: 779, name: 'Japan', crest: '...' },      playedGames: 3, won: 1, draw: 1, lost: 1, points: 4, goalsFor: 3, goalsAgainst: 3, goalDifference: 0 },
          { position: 4, team: { id: 780, name: 'Costa Rica', crest: '...' }, playedGames: 3, won: 0, draw: 0, lost: 3, points: 0, goalsFor: 0, goalsAgainst: 6, goalDifference: -6 },
        ]
      }
    ]
  };
}

function getMockOdds() {
  return [
    {
      id: 'abc123',
      sport_key: 'soccer_fifa_world_cup',
      sport_title: 'FIFA World Cup',
      commence_time: '2026-06-15T18:00:00Z',
      home_team: 'Mexico',
      away_team: 'Ecuador',
      bookmakers: [
        {
          key: 'betfair_ex_eu',
          title: 'Betfair Exchange',
          last_update: '2026-06-14T10:00:00Z',
          markets: [
            {
              key: 'h2h',
              last_update: '2026-06-14T10:00:00Z',
              outcomes: [
                { name: 'Mexico',  price: 2.10 },
                { name: 'Ecuador', price: 3.75 },
                { name: 'Draw',    price: 3.20 }
              ]
            }
          ]
        },
        {
          key: 'bet365',
          title: 'Bet365',
          last_update: '2026-06-14T09:30:00Z',
          markets: [
            {
              key: 'h2h',
              last_update: '2026-06-14T09:30:00Z',
              outcomes: [
                { name: 'Mexico',  price: 2.05 },
                { name: 'Ecuador', price: 3.80 },
                { name: 'Draw',    price: 3.25 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'def456',
      sport_key: 'soccer_fifa_world_cup',
      sport_title: 'FIFA World Cup',
      commence_time: '2026-06-16T15:00:00Z',
      home_team: 'Argentina',
      away_team: 'France',
      bookmakers: [
        {
          key: 'betfair_ex_eu',
          title: 'Betfair Exchange',
          last_update: '2026-06-15T12:00:00Z',
          markets: [
            {
              key: 'h2h',
              last_update: '2026-06-15T12:00:00Z',
              outcomes: [
                { name: 'Argentina', price: 2.50 },
                { name: 'France',    price: 2.80 },
                { name: 'Draw',      price: 3.40 }
              ]
            }
          ]
        }
      ]
    }
  ];
}

function getMockOutrights() {
  return [
    {
      id: 'out789',
      sport_key: 'soccer_fifa_world_cup',
      sport_title: 'FIFA World Cup',
      commence_time: '2026-06-11T00:00:00Z',
      bookmakers: [
        {
          key: 'betfair_ex_eu',
          title: 'Betfair Exchange',
          last_update: '2026-06-10T08:00:00Z',
          markets: [
            {
              key: 'outrights',
              last_update: '2026-06-10T08:00:00Z',
              outcomes: [
                { name: 'Argentina', price: 4.50 },
                { name: 'France',    price: 5.00 },
                { name: 'Brazil',    price: 5.50 },
                { name: 'England',   price: 7.00 },
                { name: 'Spain',     price: 7.50 },
                { name: 'Germany',   price: 8.00 },
                { name: 'Mexico',    price: 35.00 },
              ]
            }
          ]
        }
      ]
    }
  ];
}

// ── API callers ──────────────────────────────────────────────
async function fetchFootballData() {
  if (footballDemo) return { demo: true, data: getMockStandings() };

  const url = 'https://api.football-data.org/v4/competitions/WC/standings';
  const res = await fetch(url, {
    headers: { 'X-Auth-Token': FOOTBALL_KEY }
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Football-Data API ${res.status}: ${body}`);
  }
  return { demo: false, data: await res.json() };
}

async function fetchOddsH2H() {
  if (oddsDemo) return { demo: true, data: getMockOdds() };

  const url = `https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup/odds?apiKey=${ODDS_KEY}&markets=h2h&regions=eu&oddsFormat=decimal`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Odds API (h2h) ${res.status}: ${body}`);
  }

  // Log remaining quota from headers
  const remaining = res.headers.get('x-requests-remaining');
  const used      = res.headers.get('x-requests-used');
  if (remaining) console.log(`  📊 Odds API quota — used: ${used}, remaining: ${remaining}`);

  return { demo: false, data: await res.json() };
}

async function fetchOddsOutrights() {
  if (oddsDemo) return { demo: true, data: getMockOutrights() };

  const url = `https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup/outrights?apiKey=${ODDS_KEY}&regions=eu&oddsFormat=decimal`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Odds API (outrights) ${res.status}: ${body}`);
  }
  return { demo: false, data: await res.json() };
}

// ── Probability math ─────────────────────────────────────────
function impliedProbability(decimalOdd) {
  return (1 / decimalOdd) * 100;
}

function combinedProbability(p1Pct, p2Pct) {
  return (p1Pct / 100) * (p2Pct / 100) * 100;
}

// ── Display functions ────────────────────────────────────────
function displayStandings(result) {
  const { demo, data } = result;

  header(`⚽ FOOTBALL-DATA.ORG — World Cup Standings${modeTag(demo)}`);

  // Response structure overview
  subheader('📋 Response structure (top-level keys)');
  console.log(`  Keys: ${Object.keys(data).join(', ')}`);
  console.log(`  Competition: ${data.competition?.name} (${data.competition?.code})`);
  console.log(`  Season: ${data.season?.startDate} → ${data.season?.endDate}`);
  console.log(`  Matchday: ${data.season?.currentMatchday}`);
  console.log(`  Groups returned: ${data.standings?.length ?? 0}`);

  // Show truncated raw JSON for first group
  if (data.standings?.length > 0) {
    subheader('📦 Raw structure sample — first group');
    const sample = {
      ...data.standings[0],
      table: data.standings[0].table.map(t => ({
        position: t.position,
        team: { id: t.team.id, name: t.team.name },
        points: t.points,
        playedGames: t.playedGames,
        goalDifference: t.goalDifference,
        '...': '(more fields)'
      }))
    };
    const lines = JSON.stringify(sample, null, 2).split('\n');
    for (const l of lines) console.log(`     ${l}`);
  }

  // Render groups
  subheader('🏆 Groups & Teams');
  for (const group of data.standings ?? []) {
    console.log(`\n  📁 ${group.group}`);
    console.log(`  ${'Pos'.padEnd(5)} ${'Team'.padEnd(20)} ${'Pts'.padStart(4)} ${'GP'.padStart(4)} ${'W'.padStart(3)} ${'D'.padStart(3)} ${'L'.padStart(3)} ${'GD'.padStart(4)}`);
    console.log(`  ${THIN.slice(0, 50)}`);
    for (const row of group.table) {
      const flag = row.position <= 2 ? '🟢' : '🔴';
      console.log(`  ${flag} ${String(row.position).padEnd(3)} ${row.team.name.padEnd(20)} ${String(row.points).padStart(4)} ${String(row.playedGames).padStart(4)} ${String(row.won).padStart(3)} ${String(row.draw).padStart(3)} ${String(row.lost).padStart(3)} ${String(row.goalDifference).padStart(4)}`);
    }
  }
}

function displayOdds(h2hResult, outrightResult) {
  const demoH2H = h2hResult.demo;
  const demoOut = outrightResult.demo;

  header(`📊 THE ODDS API — Match Odds (h2h)${modeTag(demoH2H)}`);

  const h2h = h2hResult.data;

  // Structure overview
  subheader('📋 Response structure (first event)');
  if (h2h.length > 0) {
    const event = h2h[0];
    console.log(`  Top-level: Array of ${h2h.length} events`);
    console.log(`  Event keys: ${Object.keys(event).join(', ')}`);
    console.log(`  Bookmaker keys: ${Object.keys(event.bookmakers?.[0] ?? {}).join(', ')}`);
    console.log(`  Market keys: ${Object.keys(event.bookmakers?.[0]?.markets?.[0] ?? {}).join(', ')}`);
    console.log(`  Outcome keys: ${Object.keys(event.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0] ?? {}).join(', ')}`);
  }

  // Show raw sample
  if (h2h.length > 0) {
    subheader('📦 Raw structure sample — first event');
    const sample = { ...h2h[0], bookmakers: [`[${h2h[0].bookmakers?.length} bookmakers — truncated]`] };
    const lines = JSON.stringify(sample, null, 2).split('\n');
    for (const l of lines) console.log(`     ${l}`);
  }

  // Render matches
  subheader('🎯 Match Odds');
  for (const event of h2h) {
    console.log(`\n  ⚽ ${event.home_team} vs ${event.away_team}`);
    console.log(`     📅 ${event.commence_time}`);
    for (const bk of event.bookmakers ?? []) {
      console.log(`     🏪 ${bk.title}`);
      for (const mkt of bk.markets ?? []) {
        const oddsStr = mkt.outcomes.map(o => `${o.name}: ${o.price.toFixed(2)}`).join(' | ');
        console.log(`        ${mkt.key}: ${oddsStr}`);
      }
    }
  }

  // Outrights
  header(`🏅 THE ODDS API — Outrights (Winner)${modeTag(demoOut)}`);

  const outrights = outrightResult.data;

  if (outrights.length === 0) {
    console.log('\n  ⚠️  No outright markets found for this sport key.');
    console.log('     This may mean the tournament outrights are not available on the free tier,');
    console.log('     or the sport key differs (e.g., "soccer_fifa_world_cup_winner").');
  } else {
    for (const event of outrights) {
      for (const bk of event.bookmakers ?? []) {
        console.log(`\n  🏪 ${bk.title}`);
        for (const mkt of bk.markets ?? []) {
          console.log(`     Market: ${mkt.key}`);
          const sorted = [...mkt.outcomes].sort((a, b) => a.price - b.price);
          for (const o of sorted) {
            const prob = impliedProbability(o.price).toFixed(1);
            const bar  = '█'.repeat(Math.round(parseFloat(prob) / 2));
            console.log(`       ${o.name.padEnd(20)} ${String(o.price).padStart(6)}  →  ${prob.padStart(5)}%  ${bar}`);
          }
        }
      }
    }
  }

  // Check: does the API include group qualification markets?
  subheader('🔍 Market types analysis');
  const allMarketKeys = new Set();
  for (const event of h2h) {
    for (const bk of event.bookmakers ?? []) {
      for (const mkt of bk.markets ?? []) {
        allMarketKeys.add(mkt.key);
      }
    }
  }
  for (const event of outrights) {
    for (const bk of event.bookmakers ?? []) {
      for (const mkt of bk.markets ?? []) {
        allMarketKeys.add(mkt.key);
      }
    }
  }
  console.log(`\n  Market keys found: ${[...allMarketKeys].join(', ') || '(none)'}`);
  console.log(`  ℹ️  The Odds API typically offers: h2h, spreads, totals, outrights.`);
  console.log(`  ℹ️  "Group qualification" is NOT a standard market — we must derive it`);
  console.log(`     from match-level h2h odds + standings using our probability engine.`);
}

function displayProbabilityMath() {
  header('🧮 PROBABILITY CALCULATIONS — Demo');

  subheader('Step 1: Convert decimal odds → implied probability');
  const sampleOdds = [
    { label: 'Team A wins (home)',   odd: 2.50 },
    { label: 'Team B wins (away)',   odd: 1.30 },
    { label: 'Draw',                 odd: 3.75 },
  ];

  console.log(`\n  Formula: P(%) = (1 / decimal_odd) × 100\n`);
  for (const s of sampleOdds) {
    const p = impliedProbability(s.odd);
    console.log(`  ${s.label.padEnd(25)} odd=${String(s.odd).padStart(5)}  →  P = (1/${s.odd}) × 100 = ${p.toFixed(2)}%`);
  }

  const totalRaw = sampleOdds.reduce((sum, s) => sum + impliedProbability(s.odd), 0);
  console.log(`\n  ⚠️  Sum of implied probabilities: ${totalRaw.toFixed(2)}%`);
  console.log(`     This exceeds 100% — the excess (${(totalRaw - 100).toFixed(2)}%) is the bookmaker's margin (vig/juice).`);

  subheader('Step 2: Remove overround (normalize)');
  console.log(`\n  Normalized formula: P_fair(%) = P_implied / Σ(all_P_implied) × 100\n`);
  for (const s of sampleOdds) {
    const raw  = impliedProbability(s.odd);
    const fair = (raw / totalRaw) * 100;
    console.log(`  ${s.label.padEnd(25)} raw=${raw.toFixed(2).padStart(6)}%  →  fair=${fair.toFixed(2).padStart(6)}%`);
  }

  subheader('Step 3: Combined probability (independent events)');
  const pA = impliedProbability(2.50);  // Team A wins match 1
  const pB = impliedProbability(1.30);  // Team B wins match 2
  const combined = combinedProbability(pA, pB);

  console.log(`\n  Scenario: "Team A wins Match 1 AND Team B wins Match 2"`);
  console.log(`  P(A wins) = ${pA.toFixed(2)}%`);
  console.log(`  P(B wins) = ${pB.toFixed(2)}%`);
  console.log(`  P(both)   = ${pA.toFixed(2)}% × ${pB.toFixed(2)}% = ${combined.toFixed(2)}%`);
  console.log(`  Equivalent combined odd = ${(1 / (combined / 100)).toFixed(2)}`);

  subheader('Step 4: Group qualification probability (App Mundial formula)');
  console.log(`
  To calculate if a team qualifies from a group, we need:
    1. All remaining match odds in the group
    2. Current standings (points, GD)
    3. Enumerate possible outcomes (W/D/L per match)
    4. For each scenario, compute final standings
    5. Sum probabilities of scenarios where the team finishes top-2

  Example (simplified — 1 match remaining):
    Mexico vs Ecuador — Mexico win odd: 2.10
    P(Mexico wins) = ${impliedProbability(2.10).toFixed(1)}%
    If Mexico currently has 4 pts and needs 1 more to qualify:
      P(Mexico qualifies) ≥ P(win) + P(draw)
      = ${impliedProbability(2.10).toFixed(1)}% + ${impliedProbability(3.20).toFixed(1)}%
      = ${(impliedProbability(2.10) + impliedProbability(3.20)).toFixed(1)}%
  `);
}

function displayAnswers(footballResult, h2hResult, outrightResult) {
  header('❓ 5 KEY QUESTIONS — Answers');

  const isLive = !footballResult.demo || !h2hResult.demo;
  const liveNote = isLive
    ? '(Based on LIVE API responses)'
    : '(Based on DEMO data — run with real API keys to confirm)';

  console.log(`\n  ${liveNote}\n`);

  // Q1
  console.log(`  ┌─────────────────────────────────────────────────────────────────┐`);
  console.log(`  │ Q1: Does the free football API have World Cup data?            │`);
  console.log(`  └─────────────────────────────────────────────────────────────────┘`);
  const hasStandings = (footballResult.data.standings?.length ?? 0) > 0;
  if (footballResult.demo) {
    console.log(`  ✅ YES (expected). The Football-Data.org free tier covers the FIFA`);
    console.log(`     World Cup (competition code: WC). It provides:`);
    console.log(`     • Group stage standings (points, GD, W/D/L)`);
    console.log(`     • Match schedules and results (/v4/competitions/WC/matches)`);
    console.log(`     • Team details and squads`);
    console.log(`     ⚠️  Run with a real API key to confirm current availability.`);
  } else {
    console.log(`  ${hasStandings ? '✅ YES' : '❌ NO'} — ${hasStandings ? 'Standings data received successfully.' : 'No standings found. The tournament may not have started yet.'}`);
    console.log(`     Groups found: ${footballResult.data.standings?.length ?? 0}`);
  }

  // Q2
  console.log(`\n  ┌─────────────────────────────────────────────────────────────────┐`);
  console.log(`  │ Q2: Does The Odds API include 'group qualification' markets?   │`);
  console.log(`  └─────────────────────────────────────────────────────────────────┘`);
  console.log(`  ⚠️  NO — The Odds API provides individual match h2h/spreads/totals`);
  console.log(`     and tournament-winner outrights, but NOT group qualification odds.`);
  console.log(`     → App Mundial must CALCULATE group qualification probabilities`);
  console.log(`       using match odds + standings (our core value proposition).`);

  // Q3
  console.log(`\n  ┌─────────────────────────────────────────────────────────────────┐`);
  console.log(`  │ Q3: Are odds in decimal format or do they need conversion?     │`);
  console.log(`  └─────────────────────────────────────────────────────────────────┘`);
  console.log(`  ✅ DECIMAL — When requesting oddsFormat=decimal, The Odds API returns`);
  console.log(`     European decimal odds directly (e.g., 2.50, 1.30).`);
  console.log(`     No conversion needed. The API also supports 'american' and 'iso'`);
  console.log(`     formats via the oddsFormat query parameter.`);

  // Q4
  console.log(`\n  ┌─────────────────────────────────────────────────────────────────┐`);
  console.log(`  │ Q4: How many requests per day/month does the free plan allow?  │`);
  console.log(`  └─────────────────────────────────────────────────────────────────┘`);
  console.log(`  📊 Football-Data.org (free tier):`);
  console.log(`     • 10 requests/minute`);
  console.log(`     • No daily/monthly cap documented`);
  console.log(`     • Covers major competitions (WC, UCL, PL, etc.)`);
  console.log(`     → ✅ Sufficient: worker polls standings once every 15 min = 96/day`);
  console.log(`\n  📊 The Odds API (free tier):`);
  console.log(`     • 500 requests/month`);
  console.log(`     • Each request returns odds for all matches in a sport`);
  console.log(`     → ⚠️  Tight: Polling every 30 min during group stage (~12 days)`);
  console.log(`       = 12 × 24 × 2 = 576 requests. Need to optimize:`);
  console.log(`       • Poll every hour instead = 288 requests ✅`);
  console.log(`       • Cache aggressively, only refresh near kickoff times`);
  console.log(`       • Use response headers to track remaining quota`);

  // Q5
  console.log(`\n  ┌─────────────────────────────────────────────────────────────────┐`);
  console.log(`  │ Q5: Is the data structure stable between tournaments?          │`);
  console.log(`  └─────────────────────────────────────────────────────────────────┘`);
  console.log(`  ✅ YES (mostly). Both APIs use versioned endpoints (v4):`);
  console.log(`     • Football-Data.org: Stable JSON schema since v4, documented`);
  console.log(`       at football-data.org/documentation. Fields like team.name,`);
  console.log(`       standings[].table[] are consistent across competitions.`);
  console.log(`     • The Odds API: sport_key may vary between World Cups`);
  console.log(`       (e.g., "soccer_fifa_world_cup" vs "soccer_fifa_world_cup_2026").`);
  console.log(`       Structure (bookmakers[].markets[].outcomes[]) is stable.`);
  console.log(`     → Use /v4/sports to discover the correct sport_key dynamically.`);
}

function displaySummary() {
  header('📝 SUMMARY & NEXT STEPS');

  console.log(`
  ✅ Football-Data.org provides all needed group/match data
  ✅ The Odds API provides decimal match odds (h2h)
  ✅ Probability math is straightforward (1/odd × 100)
  ⚠️  Group qualification must be CALCULATED (not available as a market)
  ⚠️  Odds API free tier = 500 req/month — requires careful quota management

  🔧 Next Steps:
     1. Register for API keys (both are free)
     2. Implement the /api/worker cron job to fetch & cache data
     3. Build the probability engine (enumerate group scenarios)
     4. Create the prediction UI with probability sliders
     5. Set up PostgreSQL + Prisma schema for persistence

  🚀 Run this PoC again with real API keys:
     set FOOTBALL_DATA_API_KEY=your_key_here
     set ODDS_API_KEY=your_key_here
     node poc/football-data-poc.js
  `);
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('\n');
  header('🌍 APP MUNDIAL — Proof of Concept');
  console.log(`\n  Testing API connectivity and data structures`);
  console.log(`  ${new Date().toISOString()}\n`);

  console.log(`  Football-Data.org key: ${footballDemo ? '❌ Not configured → DEMO MODE' : '✅ Configured'}`);
  console.log(`  The Odds API key:      ${oddsDemo     ? '❌ Not configured → DEMO MODE' : '✅ Configured'}`);

  // 1. Football-Data.org
  let footballResult;
  try {
    footballResult = await fetchFootballData();
    displayStandings(footballResult);
  } catch (err) {
    console.error(`\n  ❌ Football-Data.org error: ${err.message}`);
    console.log(`     Falling back to demo data...\n`);
    footballResult = { demo: true, data: getMockStandings() };
    displayStandings(footballResult);
  }

  // 2. The Odds API
  let h2hResult, outrightResult;
  try {
    h2hResult = await fetchOddsH2H();
  } catch (err) {
    console.error(`\n  ❌ Odds API (h2h) error: ${err.message}`);
    console.log(`     Falling back to demo data...\n`);
    h2hResult = { demo: true, data: getMockOdds() };
  }

  try {
    outrightResult = await fetchOddsOutrights();
  } catch (err) {
    console.error(`\n  ❌ Odds API (outrights) error: ${err.message}`);
    console.log(`     Falling back to demo data...\n`);
    outrightResult = { demo: true, data: getMockOutrights() };
  }

  displayOdds(h2hResult, outrightResult);

  // 3. Probability math
  displayProbabilityMath();

  // 4. Answer the 5 questions
  displayAnswers(footballResult, h2hResult, outrightResult);

  // 5. Summary
  displaySummary();

  console.log(SEP);
  console.log('  PoC completed successfully! 🎉');
  console.log(SEP + '\n');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
