'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';

const BATTING_TYPES = [
  { value: 'most_runs', label: 'Most Runs' },
  { value: 'most_sixes', label: 'Most Sixes' },
  { value: 'most_fours', label: 'Most Fours' },
  { value: 'most_centuries', label: 'Most 100s' },
  { value: 'most_fifties', label: 'Most 50s' },
  { value: 'highest_average', label: 'Best Average' },
  { value: 'highest_sr', label: 'Best Strike Rate' },
];

const BOWLING_TYPES = [
  { value: 'top_wickets', label: 'Top Wickets' },
  { value: 'best_economy', label: 'Best Economy' },
  { value: 'best_average', label: 'Best Average' },
  { value: 'best_sr', label: 'Best SR' },
  { value: 'five_wickets', label: '5-Wicket Hauls' },
  { value: 'most_maidens', label: 'Most Maidens' },
];

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4', '#d4af37', '#ec4899', '#14b8a6', '#a855f7'];

export default function AnalyticsPage() {
  const [battingType, setBattingType] = useState('most_runs');
  const [bowlingType, setBowlingType] = useState('top_wickets');

  const { data: batting, isLoading: bLoading } = useQuery({
    queryKey: ['batting', battingType, 10],
    queryFn: () => api.getBattingStats(battingType, 10),
  });
  const { data: bowling, isLoading: wLoading } = useQuery({
    queryKey: ['bowling', bowlingType, 10],
    queryFn: () => api.getBowlingStats(bowlingType, 10),
  });
  const { data: toss, isLoading: tLoading } = useQuery({
    queryKey: ['toss'],
    queryFn: api.getTossStats,
  });
  const { data: standings } = useQuery({
    queryKey: ['standings'],
    queryFn: api.getStandings,
  });

  const battingChart = (batting || []).slice(0, 10).map((s: any) => ({
    name: s.player?.shortName || s.player?.name || '',
    value: s.runs ?? s.sixes ?? s.fours ?? s.centuries ?? s.halfCenturies ?? parseFloat(s.average) ?? parseFloat(s.strikeRate) ?? 0,
    team: s.team?.abbr,
  }));

  const bowlingChart = (bowling || []).slice(0, 10).map((s: any) => ({
    name: s.player?.shortName || s.player?.name || '',
    value: s.wickets ?? parseFloat(s.economy) ?? parseFloat(s.average) ?? s.maidens ?? s.fiveWickets ?? 0,
    team: s.team?.abbr,
  }));

  const tossData = toss ? [
    { name: 'Bat First Wins', value: Number(toss.batFirstWins) },
    { name: 'Field First Wins', value: Number(toss.fieldFirstWins) },
  ] : [];

  const nrrData = (standings || []).map((s: any) => ({
    team: s.team?.abbr,
    nrr: parseFloat(s.netRunRate),
    wins: s.won,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Interactive IPL 2022 data visualizations</p>
      </div>

      {/* Batting Leaderboard */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-xl font-bold">Batting Leaderboard</h2>
          <select
            value={battingType}
            onChange={e => setBattingType(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          >
            {BATTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        {bLoading ? <LoadingSpinner /> : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={battingChart} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#e5e7eb', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                formatter={(val: any) => [val, BATTING_TYPES.find(t => t.value === battingType)?.label]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {battingChart.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bowling Leaderboard */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-xl font-bold">Bowling Leaderboard</h2>
          <select
            value={bowlingType}
            onChange={e => setBowlingType(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          >
            {BOWLING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        {wLoading ? <LoadingSpinner /> : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bowlingChart} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#e5e7eb', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                formatter={(val: any) => [val, BOWLING_TYPES.find(t => t.value === bowlingType)?.label]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {bowlingChart.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Toss Analysis */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-xl font-bold mb-4">Toss Analysis</h2>
          {tLoading ? <LoadingSpinner /> : toss ? (
            <div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-ipl-gold">{toss.tossWinMatchWinPct}%</div>
                <div className="text-gray-400 text-sm">Toss winners won the match</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={tossData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                    {tossData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-3 text-center text-sm">
                <div className="bg-gray-800 rounded-lg p-2">
                  <div className="font-bold">{toss.chosenBatFirstWinPct}%</div>
                  <div className="text-gray-400 text-xs">Bat 1st wins</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-2">
                  <div className="font-bold">{toss.chosenFieldFirstWinPct}%</div>
                  <div className="text-gray-400 text-xs">Field 1st wins</div>
                </div>
              </div>
            </div>
          ) : <ErrorState message="Toss data unavailable" />}
        </div>

        {/* NRR Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-xl font-bold mb-4">Net Run Rate by Team</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={nrrData}>
              <XAxis dataKey="team" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                formatter={(val: any) => [val.toFixed(3), 'NRR']}
              />
              <Bar dataKey="nrr" radius={[4, 4, 0, 0]}>
                {nrrData.map((d: any, i: number) => <Cell key={i} fill={d.nrr >= 0 ? '#10b981' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
