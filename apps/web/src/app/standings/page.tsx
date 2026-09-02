'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { TeamLogo } from '@/components/TeamLogo';
import Link from 'next/link';

export default function StandingsPage() {
  const { data: standings, isLoading, error } = useQuery({
    queryKey: ['standings'],
    queryFn: api.getStandings,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message="Failed to load standings" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Points Table</h1>
      <p className="text-gray-400 mb-8">IPL 2022 — League Stage</p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800 text-xs text-gray-400 uppercase">
              <th className="px-4 py-3 text-left w-8">#</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-center">P</th>
              <th className="px-4 py-3 text-center">W</th>
              <th className="px-4 py-3 text-center">L</th>
              <th className="px-4 py-3 text-center">NR</th>
              <th className="px-4 py-3 text-center">NRR</th>
              <th className="px-4 py-3 text-center font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {(standings || []).map((entry: any, i: number) => (
              <tr key={entry.id} className={`border-t border-gray-800 hover:bg-gray-800/50 transition-colors ${i < 4 ? 'border-l-2 border-l-green-500' : ''}`}>
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/teams/${entry.teamId}`} className="flex items-center gap-2 hover:text-ipl-gold">
                    <TeamLogo team={entry.team} size={28} />
                    <span className="font-medium">{entry.team?.name}</span>
                    <span className="text-gray-400 text-xs">({entry.team?.abbr})</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">{entry.played}</td>
                <td className="px-4 py-3 text-center text-green-400 font-medium">{entry.won}</td>
                <td className="px-4 py-3 text-center text-red-400">{entry.lost}</td>
                <td className="px-4 py-3 text-center text-gray-400">{entry.noResult}</td>
                <td className="px-4 py-3 text-center text-blue-400">{entry.netRunRate}</td>
                <td className="px-4 py-3 text-center font-bold text-ipl-gold text-lg">{entry.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t border-gray-800 text-xs text-gray-500">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-sm mr-1 -mb-0.5"></span> Top 4 qualify for playoffs
        </div>
      </div>
    </div>
  );
}
