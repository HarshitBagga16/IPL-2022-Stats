import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  log: ['error'],
});

const possibleDataDirs = [
  path.join(__dirname, '..', '..', 'Indian_Premier_League_2022-03-26'),
  path.join(__dirname, '..', '..', '..', 'Indian_Premier_League_2022-03-26'),
  path.join(__dirname, '..', '..', '..', '..', 'Indian_Premier_League_2022-03-26'),
  path.join(process.cwd(), 'Indian_Premier_League_2022-03-26'),
  path.join(process.cwd(), '..', 'Indian_Premier_League_2022-03-26'),
  path.join(process.cwd(), '..', '..', 'Indian_Premier_League_2022-03-26'),
];

const DATA_DIR = possibleDataDirs.find(d => fs.existsSync(d)) || possibleDataDirs[0];

function readJson<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

async function batchRun<T>(items: T[], batchSize: number, fn: (item: T) => Promise<any>) {
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    await Promise.all(chunk.map(item => fn(item).catch(err => console.error('Batch item error:', err?.message || err))));
  }
}

async function seedTeams() {
  console.log('Seeding teams...');
  const teams = readJson<any[]>(path.join(DATA_DIR, 'teams', 'teams.json'));
  await batchRun(teams, 10, async (team) => {
    await prisma.team.upsert({
      where: { id: team.tid },
      update: {
        name: team.title,
        shortName: team.abbr,
        logoUrl: team.logo_url || '',
        thumbUrl: team.thumb_url || '',
        country: team.country || 'in',
        abbr: team.abbr,
      },
      create: {
        id: team.tid,
        name: team.title,
        shortName: team.abbr,
        logoUrl: team.logo_url || '',
        thumbUrl: team.thumb_url || '',
        country: team.country || 'in',
        abbr: team.abbr,
      },
    });
  });
  console.log(`Seeded ${teams.length} teams`);
}

async function seedVenuesAndMatches() {
  console.log('Seeding venues and matches...');
  const matches = readJson<any[]>(path.join(DATA_DIR, 'matches', 'matches.json'));
  const venueMap = new Map<number, any>();
  for (const match of matches) {
    if (match.venue?.venue_id) {
      venueMap.set(Number(match.venue.venue_id), match.venue);
    }
  }

  await batchRun(Array.from(venueMap.entries()), 10, async ([venueId, venue]) => {
    await prisma.venue.upsert({
      where: { id: venueId },
      update: { name: venue.name, location: venue.location || '', country: venue.country || 'India' },
      create: { id: venueId, name: venue.name, location: venue.location || '', country: venue.country || 'India' },
    });
  });
  console.log(`Seeded ${venueMap.size} venues`);

  await batchRun(matches, 10, async (match) => {
    if (!match.match_id || !match.venue?.venue_id) return;
    const dateStart = match.date_start ? new Date(match.date_start) : new Date();
    const resultText = match.result || match.status_note || '';
    const statusNoteText = match.status_note || match.result || '';

    await prisma.match.upsert({
      where: { id: match.match_id },
      update: {
        title: match.title || '',
        shortTitle: match.short_title || '',
        subtitle: match.subtitle || '',
        matchNumber: match.match_number || '',
        status: match.status_str || 'Completed',
        statusNote: statusNoteText,
        teamAId: match.teama?.team_id,
        teamBId: match.teamb?.team_id,
        teamAScores: match.teama?.scores || '',
        teamAScoresFull: match.teama?.scores_full || '',
        teamAOvers: match.teama?.overs || '',
        teamBScores: match.teamb?.scores || '',
        teamBScoresFull: match.teamb?.scores_full || '',
        teamBOvers: match.teamb?.overs || '',
        dateStart,
        season: match.competition?.season || '2022',
        venueId: Number(match.venue.venue_id),
        umpires: match.umpires || '',
        referee: match.referee || '',
        result: resultText,
        resultType: match.result_type || 0,
        winMargin: match.win_margin || '',
        winningTeamId: match.winning_team_id || null,
        tossWinnerId: match.toss?.winner || null,
        tossDecision: match.toss?.decision || 2,
        tossText: match.toss?.text || '',
        dlsAffected: match.match_dls_affected === 'true',
      },
      create: {
        id: match.match_id,
        title: match.title || '',
        shortTitle: match.short_title || '',
        subtitle: match.subtitle || '',
        matchNumber: match.match_number || '',
        status: match.status_str || 'Completed',
        statusNote: statusNoteText,
        teamAId: match.teama?.team_id,
        teamBId: match.teamb?.team_id,
        teamAScores: match.teama?.scores || '',
        teamAScoresFull: match.teama?.scores_full || '',
        teamAOvers: match.teama?.overs || '',
        teamBScores: match.teamb?.scores || '',
        teamBScoresFull: match.teamb?.scores_full || '',
        teamBOvers: match.teamb?.overs || '',
        dateStart,
        season: match.competition?.season || '2022',
        venueId: Number(match.venue.venue_id),
        umpires: match.umpires || '',
        referee: match.referee || '',
        result: resultText,
        resultType: match.result_type || 0,
        winMargin: match.win_margin || '',
        winningTeamId: match.winning_team_id || null,
        tossWinnerId: match.toss?.winner || null,
        tossDecision: match.toss?.decision || 2,
        tossText: match.toss?.text || '',
        dlsAffected: match.match_dls_affected === 'true',
      },
    });
  });
  console.log(`Seeded ${matches.length} matches`);
}

async function seedPlayersAndSquads() {
  console.log('Seeding players and squads...');
  const squads = readJson<any[]>(path.join(DATA_DIR, 'squads', 'squads.json'));
  
  for (const teamSquad of squads) {
    if (!teamSquad.players) continue;
    await batchRun<any>(teamSquad.players as any[], 15, async (player: any) => {
      if (!player.pid) return;
      await prisma.player.upsert({
        where: { id: player.pid },
        update: {
          name: player.title || '',
          shortName: player.short_name || '',
          firstName: player.first_name || '',
          nationality: player.nationality || '',
          birthdate: player.birthdate || '',
          birthplace: player.birthplace || '',
          country: player.country || 'in',
          playingRole: player.playing_role || '',
          battingStyle: player.batting_style || '',
          bowlingStyle: player.bowling_style || '',
          thumbUrl: player.thumb_url || '',
          fantasyRating: player.fantasy_player_rating || 0,
        },
        create: {
          id: player.pid,
          name: player.title || '',
          shortName: player.short_name || '',
          firstName: player.first_name || '',
          nationality: player.nationality || '',
          birthdate: player.birthdate || '',
          birthplace: player.birthplace || '',
          country: player.country || 'in',
          playingRole: player.playing_role || '',
          battingStyle: player.batting_style || '',
          bowlingStyle: player.bowling_style || '',
          thumbUrl: player.thumb_url || '',
          fantasyRating: player.fantasy_player_rating || 0,
        },
      });

      try {
        await prisma.squadEntry.upsert({
          where: { teamId_playerId: { teamId: teamSquad.team_id, playerId: player.pid } },
          update: {},
          create: { teamId: teamSquad.team_id, playerId: player.pid },
        });
      } catch {}
    });
  }
  console.log('Players and squads seeded');
}

async function seedBattingStats() {
  console.log('Seeding batting stats...');
  const files = [
    { file: 'batting_most_runs.json', type: 'most_runs' },
    { file: 'batting_most_run6.json', type: 'most_sixes' },
    { file: 'batting_most_run4.json', type: 'most_fours' },
    { file: 'batting_most_run100.json', type: 'most_centuries' },
    { file: 'batting_most_run50.json', type: 'most_fifties' },
    { file: 'batting_highest_average.json', type: 'highest_average' },
    { file: 'batting_highest_strikerate.json', type: 'highest_sr' },
  ];
  for (const { file, type } of files) {
    const filePath = path.join(DATA_DIR, 'batting_stats', file);
    if (!fs.existsSync(filePath)) continue;
    const data = readJson<any>(filePath);
    const stats: any[] = data?.response?.stats || [];
    
    await batchRun(stats, 15, async (stat) => {
      if (!stat.player?.pid || !stat.team?.tid) return;
      const pid = stat.player.pid;
      const tid = stat.team.tid;

      await prisma.battingStat.upsert({
        where: { playerId_teamId_statType: { playerId: pid, teamId: tid, statType: type } },
        update: {
          matches: stat.matches || 0,
          innings: stat.innings || 0,
          runs: stat.runs || 0,
          notOut: stat.notout || 0,
          highest: stat.highest || 0,
          centuries: stat.run100 || 0,
          halfCenturies: stat.run50 || 0,
          fours: stat.run4 || 0,
          sixes: stat.run6 || 0,
          average: String(stat.average || '0'),
          strikeRate: String(stat.strike || '0'),
          balls: stat.balls || 0,
        },
        create: {
          playerId: pid,
          teamId: tid,
          statType: type,
          matches: stat.matches || 0,
          innings: stat.innings || 0,
          runs: stat.runs || 0,
          notOut: stat.notout || 0,
          highest: stat.highest || 0,
          centuries: stat.run100 || 0,
          halfCenturies: stat.run50 || 0,
          fours: stat.run4 || 0,
          sixes: stat.run6 || 0,
          average: String(stat.average || '0'),
          strikeRate: String(stat.strike || '0'),
          balls: stat.balls || 0,
        },
      });
    });
    console.log(`Seeded batting stats: ${type}`);
  }
}

async function seedBowlingStats() {
  console.log('Seeding bowling stats...');
  const files = [
    { file: 'bowling_top_wicket_takers.json', type: 'top_wickets' },
    { file: 'bowling_best_averages.json', type: 'best_average' },
    { file: 'bowling_best_economy_rates.json', type: 'best_economy' },
    { file: 'bowling_best_strike_rates.json', type: 'best_sr' },
    { file: 'bowling_five_wickets.json', type: 'five_wickets' },
    { file: 'bowling_maidens.json', type: 'most_maidens' },
  ];
  for (const { file, type } of files) {
    const filePath = path.join(DATA_DIR, 'bowling_stats', file);
    if (!fs.existsSync(filePath)) continue;
    const data = readJson<any>(filePath);
    const stats: any[] = data?.response?.stats || [];
    
    await batchRun(stats, 15, async (stat) => {
      if (!stat.player?.pid || !stat.team?.tid) return;
      const pid = stat.player.pid;
      const tid = stat.team.tid;

      await prisma.bowlingStat.upsert({
        where: { playerId_teamId_statType: { playerId: pid, teamId: tid, statType: type } },
        update: {
          matches: stat.matches || 0,
          innings: stat.innings || 0,
          wickets: stat.wickets || 0,
          runs: stat.runs || 0,
          overs: String(stat.overs || '0'),
          economy: String(stat.economy || '0'),
          average: String(stat.average || '0'),
          strikeRate: String(stat.strike_rate || '0'),
          maidens: stat.maidens || 0,
          bestBowling: stat.best_bowling || '',
          fiveWickets: stat.fivewicket || 0,
          fourWickets: stat.fourwicket || 0,
        },
        create: {
          playerId: pid,
          teamId: tid,
          statType: type,
          matches: stat.matches || 0,
          innings: stat.innings || 0,
          wickets: stat.wickets || 0,
          runs: stat.runs || 0,
          overs: String(stat.overs || '0'),
          economy: String(stat.economy || '0'),
          average: String(stat.average || '0'),
          strikeRate: String(stat.strike_rate || '0'),
          maidens: stat.maidens || 0,
          bestBowling: stat.best_bowling || '',
          fiveWickets: stat.fivewicket || 0,
          fourWickets: stat.fourwicket || 0,
        },
      });
    });
    console.log(`Seeded bowling stats: ${type}`);
  }
}

async function seedStandings() {
  console.log('Seeding standings...');
  const data = readJson<any>(path.join(DATA_DIR, 'standings', 'standings.json'));
  const standingsGroups: any[] = data?.standings || [];
  for (const group of standingsGroups) {
    const entries: any[] = group?.standings || [];
    await batchRun(entries, 10, async (entry) => {
      const teamId = Number(entry.team_id);
      if (!teamId) return;
      await prisma.standing.upsert({
        where: { teamId },
        update: {
          played: Number(entry.played) || 0,
          won: Number(entry.win) || 0,
          lost: Number(entry.loss) || 0,
          draw: Number(entry.draw) || 0,
          noResult: Number(entry.nr) || 0,
          netRunRate: String(entry.netrr || '0'),
          points: Number(entry.points) || 0,
          season: '2022',
        },
        create: {
          teamId,
          played: Number(entry.played) || 0,
          won: Number(entry.win) || 0,
          lost: Number(entry.loss) || 0,
          draw: Number(entry.draw) || 0,
          noResult: Number(entry.nr) || 0,
          netRunRate: String(entry.netrr || '0'),
          points: Number(entry.points) || 0,
          season: '2022',
        },
      });
    });
  }
  console.log('Standings seeded');
}

async function seedPlayerCareerStats() {
  console.log('Seeding player career stats for all 247 players...');
  const careerDir = path.join(DATA_DIR, 'player_career_stats');
  if (!fs.existsSync(careerDir)) return;
  const files = fs.readdirSync(careerDir).filter(f => f.endsWith('.json'));
  
  await batchRun(files, 15, async (file) => {
    try {
      const data = readJson<any>(path.join(careerDir, file));
      const pid = data?.player?.pid;
      if (!pid) return;

      const careerPayload = {
        batting: data.batting || {},
        bowling: data.bowling || {},
      };

      await prisma.player.upsert({
        where: { id: pid },
        update: {
          name: data.player?.title || '',
          shortName: data.player?.short_name || '',
          nationality: data.player?.nationality || '',
          playingRole: data.player?.playing_role || '',
          battingStyle: data.player?.batting_style || '',
          bowlingStyle: data.player?.bowling_style || '',
          careerStats: careerPayload,
        },
        create: {
          id: pid,
          name: data.player?.title || '',
          shortName: data.player?.short_name || '',
          nationality: data.player?.nationality || '',
          playingRole: data.player?.playing_role || '',
          battingStyle: data.player?.batting_style || '',
          bowlingStyle: data.player?.bowling_style || '',
          careerStats: careerPayload,
        },
      });
    } catch {}
  });
  console.log(`Seeded career stats for ${files.length} players`);
}

async function main() {
  try {
    console.log('Starting high-speed database seed...');
    await seedTeams();
    await seedVenuesAndMatches();
    await seedPlayersAndSquads();
    await seedBattingStats();
    await seedBowlingStats();
    await seedStandings();
    await seedPlayerCareerStats();
    console.log('✅ Neon cloud database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
