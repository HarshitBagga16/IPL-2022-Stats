//dashboard page for the IPL 2022 data platform, showing key statistics, recent matches, and analytics
'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatsCard } from '@/components/StatsCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { MatchCard } from '@/components/MatchCard';
import { TeamLogo } from '@/components/TeamLogo';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Trophy, Users, Calendar, Flame, Shield, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['overview'],
    queryFn: api.getOverviewStats,
  });

  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches', 1, 6],
    queryFn: () => api.getMatches({ page: 1, limit: 6 }),
  });

  const { data: battingStats } = useQuery({
    queryKey: ['batting', 'most_runs', 8],
    queryFn: () => api.getBattingStats('most_runs', 8),
  });

  const { data: bowlingStats } = useQuery({
    queryKey: ['bowling', 'top_wickets', 8],
    queryFn: () => api.getBowlingStats('top_wickets', 8),
  });

  const { data: standings } = useQuery({
    queryKey: ['standings'],
    queryFn: api.getStandings,
  });

  if (overviewLoading) return <LoadingSpinner />;
  if (overviewError) return <ErrorState message="Failed to load dashboard overview" />;

  const runsChartData = (battingStats || []).slice(0, 8).map((s: any) => ({
    name: s.player?.shortName || s.player?.name,
    runs: s.runs,
    team: s.team?.abbr,
  }));

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#6366f1'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-950/40 to-gray-900 border border-gray-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 mb-4 shadow-sm">
            <Trophy size={16} className="text-amber-400" />
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
              🏆 IPL 2022 Champions: Gujarat Titans (Debut Season)
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            IPL 2022 Data Platform
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-6">
            Comprehensive match analytics, complete franchise rosters, tournament leaderboards, and career statistics across 74 matches.
          </p>

          {/* Fast Navigation Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
              Browse Matches <ArrowRight size={16} />
            </Link>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors border border-gray-700"
            >
              <Sparkles size={16} className="text-amber-400" /> Analytics & Charts
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Matches" value={overview?.totalMatches || 74} icon={Calendar} color="blue" />
        <StatsCard title="IPL Teams" value={overview?.totalTeams || 10} icon={Users} color="gold" />
        <StatsCard
          title="Orange Cap (Most Runs)"
          value={overview?.topBatsman?.player?.shortName || 'Jos Buttler'}
          subtitle={`${overview?.topBatsman?.runs || 863} runs (${overview?.topBatsman?.team?.abbr || 'RR'})`}
          icon={Flame}
          color="purple"
        />
        <StatsCard
          title="Purple Cap (Top Wickets)"
          value={overview?.topBowler?.player?.shortName || 'Yuzvendra Chahal'}
          subtitle={`${overview?.topBowler?.wickets || 27} wickets (${overview?.topBowler?.team?.abbr || 'RR'})`}
          icon={Shield}
          color="green"
        />
      </div>

      {/* Main Grid: Batting Chart + Standings Preview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Run Scorers Bar Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame size={18} className="text-amber-400" /> Orange Cap Race (Top Run Scorers)
              </h2>
              <p className="text-xs text-gray-400">Total runs scored in IPL 2022 season</p>
            </div>
            <Link href="/analytics" className="text-xs font-semibold text-amber-400 hover:underline">
              Full Analytics →
            </Link>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={runsChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} interval={0} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12 }}
                  labelStyle={{ color: '#f9fafb', fontWeight: 'bold' }}
                  itemStyle={{ color: '#f59e0b' }}
                  formatter={(value: any, name: any, item: any) => [`${value} runs (${item.payload.team})`, 'Runs']}
                />
                <Bar dataKey="runs" radius={[6, 6, 0, 0]}>
                  {runsChartData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Points Table Preview */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy size={18} className="text-amber-400" /> Points Table
              </h2>
              <Link href="/standings" className="text-xs font-semibold text-amber-400 hover:underline">
                View all (10) →
              </Link>
            </div>

            <div className="space-y-2.5">
              {(standings || []).slice(0, 5).map((s: any, i: number) => (
                <Link
                  key={s.id}
                  href={`/teams/${s.teamId}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-gray-950/60 hover:bg-gray-800 border border-gray-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-center text-xs font-bold text-gray-500 group-hover:text-amber-400">
                      {i + 1}
                    </span>
                    <TeamLogo team={s.team} size={22} />
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-white">
                      {s.team?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-mono">
                      {s.won}W / {s.lost}L
                    </span>
                    <span className="w-7 text-right font-black text-amber-400 text-sm">{s.points}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800/80 text-[11px] text-gray-500 text-center">
            Top 4 teams qualified for playoffs
          </div>
        </div>
      </div>

      {/* Recent Matches Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🏟️</span> Recent Matches
            </h2>
            <p className="text-xs text-gray-400">Latest completed match results and scorecards</p>
          </div>
          <Link
            href="/matches"
            className="text-sm font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            View All 74 Matches <ArrowRight size={14} />
          </Link>
        </div>

        {matchesLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(matchesData?.matches || []).map((match: any) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
