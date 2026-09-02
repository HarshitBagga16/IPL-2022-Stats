'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { TeamLogo } from '@/components/TeamLogo';
import { formatDate } from '@/lib/utils';
import { MapPin, Calendar, User, Trophy, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;
  const { data: match, isLoading, error } = useQuery({
    queryKey: ['match', id],
    queryFn: () => api.getMatch(Number(id)),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error || !match) return <ErrorState message="Match not found" />;

  const winningTeamId = match.winningTeamId;
  const winnerNote = match.statusNote || match.result;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-sm font-medium text-gray-300 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Matches
        </button>
        <span className="text-xs text-gray-500 font-mono">ID: {match.id}</span>
      </div>

      {/* Match Header Hero */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            {match.subtitle || 'IPL 2022'} · {match.season} Season
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{match.title}</h1>
        </div>

        {/* Team Score Display */}
        <div className="grid grid-cols-5 items-center gap-2 sm:gap-4 my-6">
          {/* Team A */}
          <div
            className={`col-span-2 text-center p-4 rounded-2xl transition-all ${
              winningTeamId === match.teamA?.id
                ? 'bg-amber-500/10 border border-amber-500/30'
                : 'bg-gray-900/40 border border-gray-800/60'
            }`}
          >
            <div className="flex justify-center mb-3">
              <TeamLogo team={match.teamA} size={64} />
            </div>
            <Link
              href={`/teams/${match.teamA?.id}`}
              className="font-bold text-base sm:text-lg text-white hover:text-amber-400 transition-colors"
            >
              {match.teamA?.name}
            </Link>
            <div className="text-xs text-gray-400 mb-2">{match.teamA?.shortName}</div>
            <div className="text-2xl sm:text-4xl font-extrabold text-amber-400">
              {match.teamAScores || '—'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {match.teamAOvers ? `${match.teamAOvers} overs` : ''}
            </div>
            {match.teamAScoresFull && (
              <div className="text-[11px] text-gray-500 mt-0.5 font-mono">{match.teamAScoresFull}</div>
            )}
            {winningTeamId === match.teamA?.id && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={12} /> Winner
              </span>
            )}
          </div>

          {/* VS Divider */}
          <div className="col-span-1 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-xs text-gray-400 shadow-inner">
              VS
            </div>
          </div>

          {/* Team B */}
          <div
            className={`col-span-2 text-center p-4 rounded-2xl transition-all ${
              winningTeamId === match.teamB?.id
                ? 'bg-amber-500/10 border border-amber-500/30'
                : 'bg-gray-900/40 border border-gray-800/60'
            }`}
          >
            <div className="flex justify-center mb-3">
              <TeamLogo team={match.teamB} size={64} />
            </div>
            <Link
              href={`/teams/${match.teamB?.id}`}
              className="font-bold text-base sm:text-lg text-white hover:text-amber-400 transition-colors"
            >
              {match.teamB?.name}
            </Link>
            <div className="text-xs text-gray-400 mb-2">{match.teamB?.shortName}</div>
            <div className="text-2xl sm:text-4xl font-extrabold text-amber-400">
              {match.teamBScores || '—'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {match.teamBOvers ? `${match.teamBOvers} overs` : ''}
            </div>
            {match.teamBScoresFull && (
              <div className="text-[11px] text-gray-500 mt-0.5 font-mono">{match.teamBScoresFull}</div>
            )}
            {winningTeamId === match.teamB?.id && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={12} /> Winner
              </span>
            )}
          </div>
        </div>

        {/* Winner Banner */}
        {winnerNote && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-600/50 rounded-2xl px-6 py-2.5 text-emerald-300 font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/40">
              <Trophy size={18} className="text-amber-400" />
              <span>{winnerNote}</span>
            </div>
          </div>
        )}
      </div>

      {/* Match Details & Toss Info Cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {/* Match Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-base border-b border-gray-800 pb-3 flex items-center gap-2">
            <Calendar size={16} className="text-amber-400" /> Match Information
          </h3>
          <div className="flex items-center justify-between text-sm py-1">
            <span className="text-gray-400">Date & Time</span>
            <span className="font-medium text-gray-200">{formatDate(match.dateStart)}</span>
          </div>
          <div className="flex items-center justify-between text-sm py-1 border-t border-gray-800/60">
            <span className="text-gray-400 flex items-center gap-1">
              <MapPin size={14} className="text-gray-500" /> Venue
            </span>
            <span className="font-medium text-gray-200 text-right">
              {match.venue?.name}, {match.venue?.location}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm py-1 border-t border-gray-800/60">
            <span className="text-gray-400 flex items-center gap-1">
              <User size={14} className="text-gray-500" /> Umpires
            </span>
            <span className="font-medium text-gray-300 text-right text-xs max-w-[200px] truncate">
              {match.umpires || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm py-1 border-t border-gray-800/60">
            <span className="text-gray-400">Match Referee</span>
            <span className="font-medium text-gray-300 text-right text-xs">
              {match.referee || 'N/A'}
            </span>
          </div>
        </div>

        {/* Toss & Conditions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-base border-b border-gray-800 pb-3 flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-400" /> Toss & Conditions
          </h3>
          <div className="flex items-center justify-between text-sm py-1">
            <span className="text-gray-400">Toss Winner</span>
            <span className="font-semibold text-amber-400">
              {match.tossWinner?.name || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm py-1 border-t border-gray-800/60">
            <span className="text-gray-400">Toss Decision</span>
            <span className="font-medium text-gray-200 capitalize">
              {match.tossDecision === 1 ? 'Elected to Bat First' : 'Elected to Field First'}
            </span>
          </div>
          <div className="text-xs bg-gray-950 p-3 rounded-xl text-gray-400 italic border border-gray-800/80">
            "{match.tossText || 'Toss details recorded'}"
          </div>
          <div className="flex items-center justify-between text-sm py-1 border-t border-gray-800/60">
            <span className="text-gray-400">DLS Method Applied</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                match.dlsAffected ? 'bg-red-900/40 text-red-400' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {match.dlsAffected ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
