'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { MatchCard } from '@/components/MatchCard';
import { TeamLogo } from '@/components/TeamLogo';
import Link from 'next/link';

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const teamId = Number(params.id);

  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => api.getTeam(teamId),
  });
  const { data: matchesData } = useQuery({
    queryKey: ['team-matches', teamId],
    queryFn: () => api.getTeamMatches(teamId, 1, 6),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error || !team) return <ErrorState message="Team not found" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 flex items-center gap-6">
        <TeamLogo team={team} size={80} />
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-gray-400">{team.abbr} · {team.country?.toUpperCase()}</p>
          {team.standing && (
            <div className="flex gap-6 mt-3">
              <div><span className="text-2xl font-bold text-ipl-gold">{team.standing.points}</span><span className="text-gray-400 ml-1 text-sm">pts</span></div>
              <div><span className="text-2xl font-bold text-green-400">{team.standing.won}</span><span className="text-gray-400 ml-1 text-sm">won</span></div>
              <div><span className="text-2xl font-bold text-red-400">{team.standing.lost}</span><span className="text-gray-400 ml-1 text-sm">lost</span></div>
              <div><span className="text-lg font-bold text-blue-400">{team.standing.netRunRate}</span><span className="text-gray-400 ml-1 text-sm">NRR</span></div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Squad */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="font-bold text-lg mb-3">Squad ({team.squadPlayers?.length || 0})</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(team.squadPlayers || []).map((entry: any) => (
                <Link key={entry.playerId} href={`/players/${entry.playerId}`}>
                  <div className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <span className="text-sm">{entry.player?.name}</span>
                    <span className="text-xs text-gray-400 capitalize">{entry.player?.playingRole}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="lg:col-span-2">
          <h2 className="font-bold text-lg mb-3">Recent Matches</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {(matchesData?.matches || []).map((match: any) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
