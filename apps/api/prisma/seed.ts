//importing prisma client and other required modules
//it helps us to to connect to the database and perform CRUD operations i.e for here its postgresql database
//fs module is used to read the json files from the data directory
//path module is used to resolve the path of the data directory

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

//creating an instance of prisma client because we need to use it to perform CRUD operations on the database
const prisma = new PrismaClient();

//we are trying to find the data directory in different possible locations because the seed script can be run from different locations
const possibleDataDirs = [
  //path.join(__dirname, '..', '..', 'Indian_Premier_League_2022-03-26') here is the issue because the seed script is run from the root directory of the project and not from the apps/api directory so we need to go up 4 levels to reach the root directory
  path.join(__dirname, '..', '..', '..', 'Indian_Premier_League_2022-03-26'),
  path.join(__dirname, '..', '..', '..', '..', 'Indian_Premier_League_2022-03-26'),
  //path.join with process.cwd() is used to get the current working directory of the process and then we are joining it with the data directory name to get the absolute path of the data directory
  path.join(process.cwd(), 'Indian_Premier_League_2022-03-26'),
  path.join(process.cwd(), '..', 'Indian_Premier_League_2022-03-26'),
  path.join(process.cwd(), '..', '..', 'Indian_Premier_League_2022-03-26'),
];


//we are checking if the data directory exists in any of the possible locations and if it does then we are using that location otherwise we are using the first location in the possibleDataDirs array
const DATA_DIR = possibleDataDirs.find(d => fs.existsSync(d)) || possibleDataDirs[0];


//readJson function is used to read the json files from the data directory and parse them into javascript objects as our data is in json format and we need to convert it into javascript objects to be able to use it in our code
//T is a generic type parameter that allows us to specify the type of the object that we are expecting to get from the json file so that we can have type safety and autocompletion in our code
//first read the file content in text using readFileSync then convery it into javascript object using JSON.parse and then return it as T type
function readJson<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}


//seedTeams function is used to seed the teams data into the database(basically importing the data from the json files into the database)
async function seedTeams() {
  //logging the message to the console to indicate that we are seeding the teams data
  console.log('Seeding teams...');
  //ifDATA_DIR = /home/harshit/project/Indian_Premier_League_2022-03-26 then To full path = /home/harshit/project/Indian_Premier_League_2022-03-26/teams/teams.json
  const teams = readJson<any[]>(path.join(DATA_DIR, 'teams', 'teams.json'));
  //looping over the teams array and for each team we are using the upsert method of prisma client to insert or update the team data into the database
  for (const team of teams) {
    //upsert means: update if exists, else create.
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
  }
  //that we have completed seeding the teams data into the database and logging the number of teams seeded to the console
  console.log(`Seeded ${teams.length} teams`);
}

//venues and matches are related because each match is played at a venue so we are seeding the venues data first and then the matches data
//here this function is used to seed the venues and matches data into the database(basically importing the data from the json files into the database)
async function seedVenuesAndMatches() {
  //logging the message to the console to indicate that we are seeding the venues and matches data
  console.log('Seeding venues and matches...');
  //mapping the path where the matches.json file is located and reading the data from it using the readJson function
  const matches = readJson<any[]>(path.join(DATA_DIR, 'matches', 'matches.json'));
  //mapping the venues data into a map so that we can easily access the venue data using the venue_id as the key and the venue object as the value
  //we used map here because we want to avoid duplicate venues in the database as there can be multiple matches played at the same venue so we are using the venue_id as the key and the venue object as the value so that we can easily access the venue data using the venue_id as the key and the venue object as the value
  const venueMap = new Map<number, any>();
  //looping over the matches array and for each match we are checking if the venue data is available and if it is then we are adding the venue data into the venueMap using the venue_id as the key and the venue object as the value
  for (const match of matches) {
    if (match.venue?.venue_id) {
      venueMap.set(Number(match.venue.venue_id), match.venue);
    }
  }
  //now inserting the venues data into the database using the upsert method of prisma client to insert or update the venue data into the database
  for (const [venueId, venue] of venueMap.entries()) {
    await prisma.venue.upsert({
      //if id is available then update the venue data otherwise create a new venue data in the database
      where: { id: venueId },
      update: { name: venue.name, location: venue.location || '', country: venue.country || 'India' },
      create: { id: venueId, name: venue.name, location: venue.location || '', country: venue.country || 'India' },
    });
  }
  //logging the message to the console to indicate that we have completed seeding the venues data into the database and logging the number of venues seeded to the console
  console.log(`Seeded ${venueMap.size} venues`);
  //here we are inserting the matches data into the database using the upsert method of prisma client to insert or update the match data into the database
  //looping over the matches array and for each match we are checking if the match_id and venue_id is available and if it is then we are inserting the match data into the database using the upsert method of prisma client to insert or update the match data into the database
  for (const match of matches) {
    //if data is not available then continue to the next match we will skip this match
    if (!match.match_id || !match.venue?.venue_id) continue;
    //if date_start is available then convert it into a Date object otherwise use the current date and time as the date_start
    const dateStart = match.date_start ? new Date(match.date_start) : new Date();
    await prisma.match.upsert({
      where: { id: match.match_id },
      update: {
        title: match.title || '',
        shortTitle: match.short_title || '',
        subtitle: match.subtitle || '',
        matchNumber: match.match_number || '',
        status: match.status_str || 'Completed',
        statusNote: match.status_note || match.result || '',
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
        result: match.result || match.status_note || '',
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
        statusNote: match.status_note || match.result || '',
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
        result: match.result || match.status_note || '',
        resultType: match.result_type || 0,
        winMargin: match.win_margin || '',
        winningTeamId: match.winning_team_id || null,
        tossWinnerId: match.toss?.winner || null,
        tossDecision: match.toss?.decision || 2,
        tossText: match.toss?.text || '',
        dlsAffected: match.match_dls_affected === 'true',
      },
    });
  }
  //logging the message to the console to indicate that we have completed seeding the matches data into the database and logging the number of matches seeded to the console
  console.log(`Seeded ${matches.length} matches`);
}

//this function is used to seed the players and squads data into the database(basically importing the data from the json files into the database)
async function seedPlayersAndSquads() {
  //logging the message to the console to indicate that we are seeding the players and squads data
  console.log('Seeding players and squads...');
  //mapping the path where the squads.json file is located and reading the data from it using the readJson function
  const squads = readJson<any[]>(path.join(DATA_DIR, 'squads', 'squads.json'));
  //looping over the squads array and for each squad we are checking if the players data is available and if it is then we are inserting the players data into the database using the upsert method of prisma client to insert or update the player data into the database
  //mainly adding every player to the players table then to its team in the squadEntry table so that we can easily access the players data using the team_id and player_id as the key and the player object as the value
  for (const teamSquad of squads) {
    //if players data is not available then continue to the next squad we will skip this squad
    if (!teamSquad.players) continue;
    //looping over player array which is inside the teamSquad object and for each player we are checking if the player_id is available and if it is then we are inserting the player data into the database using the upsert method of prisma client to insert or update the player data into the database
    for (const player of teamSquad.players) {
      //if player_id is not available then continue to the next player we will skip this player
      if (!player.pid) continue;
      //upserting the player data into the database using the upsert method of prisma client to insert or update the player data into the database
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
      //here we are inserting the squadEntry data into the database using the upsert method of prisma client to insert or update the squadEntry data into the database
      try {
        //we are using try catch block here because there can be some players who are not part of any team so we are skipping those players and not inserting them into the squadEntry table
        await prisma.squadEntry.upsert({
          //if teamId and playerId is available then update the squadEntry data otherwise create a new squadEntry data in the database
          //here teamid and playerid is of same person so we are using the composite key of teamid and playerid to uniquely identify the squadEntry data in the database
          where: { teamId_playerId: { teamId: teamSquad.team_id, playerId: player.pid } },
          //we dont need to update any data in the squadEntry table because we are only interested in the teamId and playerId so we are leaving the update object empty
          update: {},
          create: { teamId: teamSquad.team_id, playerId: player.pid },
        });
      } catch {}
    }
  }
  //logging the message to the console to indicate that we have completed seeding the players and squads data into the database and logging the number of players seeded to the console
  console.log('Players and squads seeded');
}

//this function is used to seed the batting stats data into the database(basically importing the data from the json files into the database)
async function seedBattingStats() {
  //logging the message to the console to indicate that we are seeding the batting stats data
  console.log('Seeding batting stats...');
  //files array contains the list of json files that we need to read and the type of stat that we need to insert into the database
  //we made this variable to check the type of stat that we are inserting into the database so that we can easily access the batting stats data using the player_id, team_id and stat_type as the key and the batting stats object as the value
  const files = [
    { file: 'batting_most_runs.json', type: 'most_runs' },
    { file: 'batting_most_run6.json', type: 'most_sixes' },
    { file: 'batting_most_run4.json', type: 'most_fours' },
    { file: 'batting_most_run100.json', type: 'most_centuries' },
    { file: 'batting_most_run50.json', type: 'most_fifties' },
    { file: 'batting_highest_average.json', type: 'highest_average' },
    { file: 'batting_highest_strikerate.json', type: 'highest_sr' },
  ];
  //looping over the files array and for each file we are reading the data from the json file and inserting the batting stats data into the database using the upsert method of prisma client to insert or update the batting stats data into the database
  for (const { file, type } of files) {
    //mapping the path where the batting stats json file is located and reading the data from it using the readJson function
    const filePath = path.join(DATA_DIR, 'batting_stats', file);
    //if the file does not exist then continue to the next file we will skip this file
    if (!fs.existsSync(filePath)) continue;
    //reading the data from the json file and parsing it into javascript object using the readJson function
    const data = readJson<any>(filePath);
    //getting the stats array from the data object and if it is not available then using an empty array as the default value
    const stats: any[] = data?.response?.stats || [];
    //looping over the stats array and for each stat we are checking if the player_id and team_id is available and if it is then we are inserting the batting stats data into the database using the upsert method of prisma client to insert or update the batting stats data into the database
    for (const stat of stats) {
      //if player_id or team_id is not available then continue to the next stat we will skip this stat
      if (!stat.player?.pid || !stat.team?.tid) continue;
      //getting the player_id and team_id from the stat object and storing them in variables for easy access
      const pid = stat.player.pid;
      const tid = stat.team.tid;
      // ensure player exists
      //here we are inserting the player data into the database using the upsert method of prisma client to insert or update the player data into the database
      await prisma.player.upsert({
        //checking if the player data already exists in the database using the player_id as the key to uniquely identify the player data in the database
        where: { id: pid },
        update: { name: stat.player.title || '', shortName: stat.player.short_name || '', nationality: stat.player.nationality || '', playingRole: stat.player.playing_role || '', battingStyle: stat.player.batting_style || '', bowlingStyle: stat.player.bowling_style || '' },
        create: { id: pid, name: stat.player.title || '', shortName: stat.player.short_name || '', nationality: stat.player.nationality || '', playingRole: stat.player.playing_role || '', battingStyle: stat.player.batting_style || '', bowlingStyle: stat.player.bowling_style || '' },
      });
      //here we are inserting the batting stats data into the database using the upsert method of prisma client to insert or update the batting stats data into the database
      await prisma.battingStat.upsert({
        //checking if the batting stats data already exists in the database using the composite key of player_id, team_id and stat_type as the key to uniquely identify the batting stats data in the database
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
    }
    //logging the message to the console to indicate that we have completed seeding the batting stats data into the database and logging the type of stat seeded to the console
    console.log(`Seeded batting stats: ${type}`);
  }
}

//this function is used to seed the bowling stats data into the database(basically importing the data from the json files into the database)
async function seedBowlingStats() {
  //logging the message to the console to indicate that we are seeding the bowling stats data
  console.log('Seeding bowling stats...');
  //files have all the json files that we need to read and the type of stat that we need to insert into the database
  const files = [
    { file: 'bowling_top_wicket_takers.json', type: 'top_wickets' },
    { file: 'bowling_best_averages.json', type: 'best_average' },
    { file: 'bowling_best_economy_rates.json', type: 'best_economy' },
    { file: 'bowling_best_strike_rates.json', type: 'best_sr' },
    { file: 'bowling_five_wickets.json', type: 'five_wickets' },
    { file: 'bowling_maidens.json', type: 'most_maidens' },
  ];
  //looping over the files array and for each file we are reading the data from the json file and inserting the bowling stats data into the database using the upsert method of prisma client to insert or update the bowling stats data into the database
  for (const { file, type } of files) {
    //joining the path where the bowling stats json file is located and reading the data from it using the readJson function
    const filePath = path.join(DATA_DIR, 'bowling_stats', file);
    //if the file does not exist then continue to the next file we will skip this file
    if (!fs.existsSync(filePath)) continue;
    //reading the data from the json file and parsing it into javascript object using the readJson function
    const data = readJson<any>(filePath);
    //getting the stats array from the data object and if it is not available then using an empty array as the default value
    const stats: any[] = data?.response?.stats || [];
    //looping over the stats array and for each stat we are checking if the player_id and team_id is available and if it is then we are inserting the bowling stats data into the database using the upsert method of prisma client to insert or update the bowling stats data into the database
    for (const stat of stats) {
      if (!stat.player?.pid || !stat.team?.tid) continue;
      const pid = stat.player.pid;
      const tid = stat.team.tid;
      //ensure player exists
      //here we are inserting the player data into the database using the upsert method of prisma client to insert or update the player data into the database
      await prisma.player.upsert({
        where: { id: pid },
        update: { name: stat.player.title || '', shortName: stat.player.short_name || '', nationality: stat.player.nationality || '', playingRole: stat.player.playing_role || '' },
        create: { id: pid, name: stat.player.title || '', shortName: stat.player.short_name || '', nationality: stat.player.nationality || '', playingRole: stat.player.playing_role || '' },
      });
      //here we are inserting the bowling stats data into the database using the upsert method of prisma client to insert or update the bowling stats data into the database
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
    }
    //logging the message to the console to indicate that we have completed seeding the bowling stats data into the database and logging the type of stat seeded to the console
    console.log(`Seeded bowling stats: ${type}`);
  }
}

//this function is used to seed the standings data into the database(basically importing the data from the json files into the database)
async function seedStandings() {
  //logging the message to the console to indicate that we are seeding the standings data
  console.log('Seeding standings...');
  //mapping the path where the standings.json file is located and reading the data from it using the readJson function
  const data = readJson<any>(path.join(DATA_DIR, 'standings', 'standings.json'));
  //getting the standings array from the data object and if it is not available then using an empty array as the default value
  const standingsGroups: any[] = data?.standings || [];
  //looping over the standingsGroups array and for each group we are checking if the standings data is available and if it is then we are inserting the standings data into the database using the upsert method of prisma client to insert or update the standings data into the database
  for (const group of standingsGroups) {
    //getting the entries array from the group object and if it is not available then using an empty array as the default value
    const entries: any[] = group?.standings || [];
    //looping over the entries array and for each entry we are checking if the team_id is available and if it is then we are inserting the standings data into the database using the upsert method of prisma client to insert or update the standings data into the database
    for (const entry of entries) {
      const teamId = Number(entry.team_id);
      if (!teamId) continue;
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
    }
  }
  //logging the message to the console to indicate that we have completed seeding the standings data into the database and logging the number of standings seeded to the console
  console.log('Standings seeded');
}

//this function is used to seed the player career stats data into the database(basically importing the data from the json files into the database)
async function seedPlayerCareerStats() {
  //logging the message to the console to indicate that we are seeding the player career stats data
  console.log('Seeding player career stats for all 247 players...');
  //joining the path where the player career stats json files are located and checking if the directory exists and if it does then we are reading the data from it using the readJson function
  const careerDir = path.join(DATA_DIR, 'player_career_stats');
  //if the directory does not exist then we are logging a message to the console and returning from the function
  if (!fs.existsSync(careerDir)) {
    console.log('player_career_stats directory not found, skipping');
    return;
  }
  //reading the list of json files from the player_career_stats directory and filtering out the files that do not end with .json extension and then looping over the files array and for each file we are reading the data from the json file and inserting the player career stats data into the database using the upsert method of prisma client to insert or update the player career stats data into the database
  const files = fs.readdirSync(careerDir).filter(f => f.endsWith('.json'));
  //looping over the files array and for each file we are reading the data from the json file and inserting the player career stats data into the database using the upsert method of prisma client to insert or update the player career stats data into the database
  for (const file of files) {
    try {
      const data = readJson<any>(path.join(careerDir, file));
      const pid = data?.player?.pid;
      if (!pid) continue;

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
    } catch (err) {
      // skip corrupted files
    }
  }
  console.log(`Seeded career stats for ${files.length} players`);
}

async function main() {
  try {
    console.log('Starting database seed...');
    await seedTeams();
    await seedVenuesAndMatches();
    await seedPlayersAndSquads();
    await seedBattingStats();
    await seedBowlingStats();
    await seedStandings();
    await seedPlayerCareerStats();
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
