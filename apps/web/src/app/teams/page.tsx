'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { TeamLogo } from '@/components/TeamLogo';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function TeamsPage() {
  const { data: teams, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: api.getTeams,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message="Failed to load teams" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">All Teams</h1>
      <p className="text-gray-400 mb-8">IPL 2022 — 10 teams</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(teams || []).map((team: any) => (
          <Link key={team.id} href={`/teams/${team.id}`}>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors text-center group">
              <div className="flex justify-center mb-3">
                <TeamLogo team={team} size={64} />
              </div>
              <h2 className="font-bold text-base group-hover:text-ipl-gold transition-colors">{team.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{team.abbr}</p>
              {team.standing && (
                <div className="mt-3 flex justify-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-ipl-gold">{team.standing.points}</div>
                    <div className="text-gray-500 text-xs">pts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-400">{team.standing.won}</div>
                    <div className="text-gray-500 text-xs">won</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-400">{team.standing.lost}</div>
                    <div className="text-gray-500 text-xs">lost</div>
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
