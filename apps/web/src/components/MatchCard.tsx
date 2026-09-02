import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

export function MatchCard({ match }: { match: any }) {
  return (
    <Link href={`/matches/${match.id}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">{match.subtitle}</span>
          <span className="text-xs text-gray-400">{formatDate(match.dateStart)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {match.teamA?.logoUrl && (
                <Image src={match.teamA.logoUrl} alt={match.teamA.name} width={28} height={28} className="object-contain" unoptimized />
              )}
              <span className="font-semibold text-sm">{match.teamA?.shortName}</span>
            </div>
            <div className="text-lg font-bold text-ipl-gold">{match.teamAScores}</div>
            <div className="text-xs text-gray-400">{match.teamAOvers} ov</div>
          </div>
          <div className="text-gray-500 font-bold text-lg">vs</div>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {match.teamB?.logoUrl && (
                <Image src={match.teamB.logoUrl} alt={match.teamB.name} width={28} height={28} className="object-contain" unoptimized />
              )}
              <span className="font-semibold text-sm">{match.teamB?.shortName}</span>
            </div>
            <div className="text-lg font-bold text-ipl-gold">{match.teamBScores}</div>
            <div className="text-xs text-gray-400">{match.teamBOvers} ov</div>
          </div>
        </div>
        {(match.statusNote || match.result) && (
          <div className="mt-3 text-center text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 rounded-lg py-1 px-2">
            🏆 {match.statusNote || match.result}
          </div>
        )}
        <div className="mt-2 text-center text-xs text-gray-500 truncate">{match.venue?.name}, {match.venue?.location}</div>
      </div>
    </Link>
  );
}
