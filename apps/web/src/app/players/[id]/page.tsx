'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { TeamLogo } from '@/components/TeamLogo';
import { ArrowLeft, User, Award, Shield, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;
  const { data: player, isLoading, error } = useQuery({
    queryKey: ['player', id],
    queryFn: () => api.getPlayer(Number(id)),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error || !player) return <ErrorState message="Player profile not found." />;

  const team = player.squadEntries?.[0]?.team;
  const iplBatting = player.battingStats?.find((s: any) => s.statType === 'most_runs') || player.battingStats?.[0];
  const iplBowling = player.bowlingStats?.find((s: any) => s.statType === 'top_wickets') || player.bowlingStats?.[0];

  const careerBattingT20 = player.careerStats?.batting?.t20;
  const careerBowlingT20 = player.careerStats?.bowling?.t20;
  const careerBattingListA = player.careerStats?.batting?.lista;

  const hasIplStats = Boolean(iplBatting || iplBowling);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-sm font-medium text-gray-300 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Players
        </button>
        <span className="text-xs text-gray-500 font-mono">Player ID: {player.id}</span>
      </div>

      {/* Header Bio Hero */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
            {player.thumbUrl ? (
              <img src={player.thumbUrl} alt={player.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              '🏏'
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{player.name}</h1>
              {player.shortName && (
                <span className="text-sm font-mono text-gray-400">({player.shortName})</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 capitalize">
              <span className="text-amber-400 font-medium">{player.playingRole || 'Player'}</span>
              <span>•</span>
              <span>{player.nationality || player.country?.toUpperCase() || 'India'}</span>
            </div>
            {team && (
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/teams/${team.id}`}
                  className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 rounded-full px-3 py-1 text-xs font-semibold text-amber-400 transition-colors"
                >
                  <TeamLogo team={team} size={18} />
                  <span>{team.name}</span>
                </Link>
                {player.fantasyRating > 0 && (
                  <span className="inline-flex items-center gap-1 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-full text-xs text-gray-300">
                    <Sparkles size={12} className="text-amber-400" /> Rating: {player.fantasyRating}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Player Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-800/80 text-sm">
          <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800/60">
            <div className="text-gray-500 text-xs mb-1">Batting Style</div>
            <div className="font-semibold text-gray-200">{player.battingStyle || 'Right Hand Bat'}</div>
          </div>
          <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800/60">
            <div className="text-gray-500 text-xs mb-1">Bowling Style</div>
            <div className="font-semibold text-gray-200">{player.bowlingStyle || '—'}</div>
          </div>
          <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800/60">
            <div className="text-gray-500 text-xs mb-1">Birth Date</div>
            <div className="font-semibold text-gray-200">{player.birthdate || '—'}</div>
          </div>
          <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800/60">
            <div className="text-gray-500 text-xs mb-1">Birthplace</div>
            <div className="font-semibold text-gray-200 truncate">{player.birthplace || '—'}</div>
          </div>
        </div>
      </div>

      {/* 1. IPL 2022 Tournament Stats */}
      {hasIplStats ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award size={20} className="text-amber-400" /> IPL 2022 Season Performance
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {iplBatting && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-amber-400 text-sm uppercase tracking-wide flex items-center gap-1.5">
                    <Zap size={16} /> Batting (IPL 2022)
                  </h3>
                  <span className="text-xs bg-gray-800 px-2.5 py-0.5 rounded-full text-gray-300">
                    {iplBatting.matches} matches
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Runs', value: iplBatting.runs, highlight: true },
                    { label: 'Innings', value: iplBatting.innings },
                    { label: 'Average', value: iplBatting.average },
                    { label: 'Strike Rate', value: iplBatting.strikeRate },
                    { label: 'Highest', value: iplBatting.highest },
                    { label: '100s / 50s', value: `${iplBatting.centuries} / ${iplBatting.halfCenturies}` },
                    { label: 'Fours', value: iplBatting.fours },
                    { label: 'Sixes', value: iplBatting.sixes },
                    { label: 'Balls Faced', value: iplBatting.balls },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-950 p-2.5 rounded-xl text-center border border-gray-800/60">
                      <div className={`text-lg font-bold ${item.highlight ? 'text-amber-400' : 'text-gray-100'}`}>
                        {item.value}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {iplBowling && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wide flex items-center gap-1.5">
                    <Shield size={16} /> Bowling (IPL 2022)
                  </h3>
                  <span className="text-xs bg-gray-800 px-2.5 py-0.5 rounded-full text-gray-300">
                    {iplBowling.matches} matches
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Wickets', value: iplBowling.wickets, highlight: true },
                    { label: 'Economy', value: iplBowling.economy },
                    { label: 'Average', value: iplBowling.average },
                    { label: 'Overs', value: iplBowling.overs },
                    { label: 'Best Bowling', value: iplBowling.bestBowling || '—' },
                    { label: 'Maidens', value: iplBowling.maidens },
                    { label: 'Runs Given', value: iplBowling.runs },
                    { label: 'Strike Rate', value: iplBowling.strikeRate },
                    { label: '5-Wkt Hauls', value: iplBowling.fiveWickets },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-950 p-2.5 rounded-xl text-center border border-gray-800/60">
                      <div className={`text-lg font-bold ${item.highlight ? 'text-emerald-400' : 'text-gray-100'}`}>
                        {item.value}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full mb-1">
            <span>🛡️</span> IPL 2022 Squad Member / Bench Reserve
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Did not appear in active match innings during the 2022 season. Career records shown below:
          </p>
        </div>
      )}

      {/* 2. Overall Career Statistics (For All Players) */}
      {(careerBattingT20 || careerBowlingT20) && (
        <div className="space-y-4 pt-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap size={20} className="text-amber-400" /> Overall Career T20 Statistics
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {careerBattingT20 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-amber-400 text-sm uppercase tracking-wide">
                    Career T20 Batting
                  </h3>
                  <span className="text-xs bg-gray-800 px-2.5 py-0.5 rounded-full text-gray-300">
                    {careerBattingT20.matches || 0} matches
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Career Runs', value: careerBattingT20.runs ?? '—', highlight: true },
                    { label: 'Innings', value: careerBattingT20.innings ?? '—' },
                    { label: 'Average', value: careerBattingT20.average ?? '—' },
                    { label: 'Strike Rate', value: careerBattingT20.strike ?? '—' },
                    { label: 'Highest Score', value: careerBattingT20.highest ?? '—' },
                    { label: '100s / 50s', value: `${careerBattingT20.run100 || 0} / ${careerBattingT20.run50 || 0}` },
                    { label: 'Fours', value: careerBattingT20.run4 ?? 0 },
                    { label: 'Sixes', value: careerBattingT20.run6 ?? 0 },
                    { label: 'Balls Faced', value: careerBattingT20.balls ?? 0 },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-950 p-2.5 rounded-xl text-center border border-gray-800/60">
                      <div className={`text-lg font-bold ${item.highlight ? 'text-amber-400' : 'text-gray-100'}`}>
                        {item.value}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {careerBowlingT20 && Number(careerBowlingT20.overs || careerBowlingT20.wickets || 0) > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wide">
                    Career T20 Bowling
                  </h3>
                  <span className="text-xs bg-gray-800 px-2.5 py-0.5 rounded-full text-gray-300">
                    {careerBowlingT20.matches || 0} matches
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Wickets', value: careerBowlingT20.wickets ?? 0, highlight: true },
                    { label: 'Economy', value: careerBowlingT20.econ || '—' },
                    { label: 'Average', value: careerBowlingT20.average || '—' },
                    { label: 'Overs Bowled', value: careerBowlingT20.overs ?? 0 },
                    { label: 'Runs Conceded', value: careerBowlingT20.runs ?? 0 },
                    { label: 'Best Inning', value: careerBowlingT20.bestinning || '—' },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-950 p-2.5 rounded-xl text-center border border-gray-800/60">
                      <div className={`text-lg font-bold ${item.highlight ? 'text-emerald-400' : 'text-gray-100'}`}>
                        {item.value}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. List A Domestic Career (Bonus) */}
      {careerBattingListA && Number(careerBattingListA.matches || 0) > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
            <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wide">
              Domestic / List A Records
            </h3>
            <span className="text-xs bg-gray-800 px-2.5 py-0.5 rounded-full text-gray-400">
              {careerBattingListA.matches} matches
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-950 p-2.5 rounded-xl text-center border border-gray-800/60">
              <div className="text-base font-bold text-amber-400">{careerBattingListA.runs}</div>
              <div className="text-[11px] text-gray-500">List A Runs</div>
            </div>
            <div className="bg-gray-950 p-2.5 rounded-xl text-center border border-gray-800/60">
              <div className="text-base font-bold text-gray-200">{careerBattingListA.average}</div>
              <div className="text-[11px] text-gray-500">Average</div>
            </div>
            <div className="bg-gray-950 p-2.5 rounded-xl text-center border border-gray-800/60">
              <div className="text-base font-bold text-gray-200">{careerBattingListA.highest}</div>
              <div className="text-[11px] text-gray-500">Highest Score</div>
            </div>
            <div className="bg-gray-950 p-2.5 rounded-xl text-center border border-gray-800/60">
              <div className="text-base font-bold text-gray-200">
                {careerBattingListA.run100} / {careerBattingListA.run50}
              </div>
              <div className="text-[11px] text-gray-500">100s / 50s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
