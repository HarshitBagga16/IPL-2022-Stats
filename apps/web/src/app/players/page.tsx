'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Search, X, ChevronLeft, ChevronRight, User, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

const roles = ['', 'bat', 'bowl', 'all', 'wk'];
const roleLabels: Record<string, string> = {
  '': 'All Roles',
  bat: '🏏 Batters',
  bowl: '🎯 Bowlers',
  all: '⚡ All-rounders',
  wk: '🧤 Wicket-keepers',
};

function PlayersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const initialSearch = searchParams.get('search') || '';
  const initialRole = searchParams.get('role') || '';

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [role, setRole] = useState(initialRole);
  const [page, setPage] = useState(initialPage);
  const limit = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== debouncedSearch) setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (role) params.set('role', role);
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [page, debouncedSearch, role, pathname, router]);

  useEffect(() => {
    setPage(Math.max(1, Number(searchParams.get('page')) || 1));
    setSearch(searchParams.get('search') || '');
    setDebouncedSearch(searchParams.get('search') || '');
    setRole(searchParams.get('role') || '');
  }, [searchParams]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['players', page, limit, debouncedSearch, role],
    queryFn: () =>
      api.getPlayers({
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        role: role || undefined,
      }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
          <span>👥</span> Player Directory
        </h1>
        <p className="text-gray-400">
          Search and view comprehensive profiles, career records, and IPL 2022 statistics for all 247+ players
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-8 shadow-xl space-y-4">
        <div className="relative w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search players by name (e.g. Virat Kohli, Abhijeet Tomar, Jos Buttler)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-950 border border-gray-800 focus:border-amber-500/60 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setDebouncedSearch('');
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Role Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-800/60">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                role === r
                  ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {roleLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Players Grid */}
      {isLoading && <LoadingSpinner />}
      {error && <ErrorState message="Failed to load players." />}

      {!isLoading && !error && (
        <>
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-sm font-medium text-gray-400">
              Showing {data?.players?.length || 0} of {data?.meta?.total || 0} players
              {debouncedSearch && ` matching "${debouncedSearch}"`}
            </span>
            {data?.meta && data.meta.totalPages > 1 && (
              <span className="text-xs bg-gray-800/80 border border-gray-700/60 text-amber-400 px-3 py-1 rounded-full font-semibold">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
            )}
          </div>

          {data?.players?.length === 0 ? (
            <EmptyState message="No players found matching your search." />
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {data?.players?.map((player: any) => {
                const team = player.squadEntries?.[0]?.team;
                return (
                  <Link key={player.id} href={`/players/${player.id}`}>
                    <div className="bg-gray-900 border border-gray-800 hover:border-amber-500/50 hover:bg-gray-900/90 rounded-2xl p-4 transition-all duration-200 group cursor-pointer h-full flex flex-col justify-between shadow-md">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700/60 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                            {player.thumbUrl ? (
                              <img src={player.thumbUrl} alt={player.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              '🏏'
                            )}
                          </div>
                          {team && (
                            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                              {team.abbr}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                          {player.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 capitalize flex items-center gap-1.5">
                          <span>{player.playingRole || 'Player'}</span>
                          <span>•</span>
                          <span>{player.nationality || 'India'}</span>
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
                        <span className="truncate">{player.battingStyle || 'Right Hand Bat'}</span>
                        <span className="text-amber-400 font-medium group-hover:translate-x-0.5 transition-transform">
                          View stats →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-800/80">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 disabled:opacity-40 hover:bg-gray-800 text-sm font-medium text-gray-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-sm text-gray-400 px-3">
                Page <strong className="text-white">{data.meta.page}</strong> of{' '}
                <strong className="text-white">{data.meta.totalPages}</strong>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 disabled:opacity-40 hover:bg-gray-800 text-sm font-medium text-gray-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PlayersPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PlayersContent />
    </Suspense>
  );
}
