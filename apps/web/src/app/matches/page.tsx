'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MatchCard } from '@/components/MatchCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Search, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

function MatchesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read state from URL query params
  const initialPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const initialSearch = searchParams.get('search') || '';
  const initialTeamId = searchParams.get('teamId') || '';

  const [page, setPage] = useState(initialPage);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [teamId, setTeamId] = useState(initialTeamId);
  const limit = 12;

  // Sync debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      if (searchInput !== debouncedSearch) {
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync state to URL without full page reload
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (teamId) params.set('teamId', teamId);
    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(targetUrl, { scroll: false });
  }, [page, debouncedSearch, teamId, pathname, router]);

  // Keep page in sync if URL back/forward button is clicked
  useEffect(() => {
    const urlPage = Math.max(1, Number(searchParams.get('page')) || 1);
    const urlSearch = searchParams.get('search') || '';
    const urlTeam = searchParams.get('teamId') || '';
    setPage(urlPage);
    setSearchInput(urlSearch);
    setDebouncedSearch(urlSearch);
    setTeamId(urlTeam);
  }, [searchParams]);

  // Queries
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: api.getTeams,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['matches', page, limit, debouncedSearch, teamId],
    queryFn: () =>
      api.getMatches({
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        teamId: teamId ? Number(teamId) : undefined,
      }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
          <span>🏏</span> Matches & Scorecards
        </h1>
        <p className="text-gray-400">
          Explore all 74 matches from the IPL 2022 season with full scores and results
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-8 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by team, match number (e.g. Match 6, Final), or stadium..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-950 border border-gray-800 focus:border-amber-500/60 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                setDebouncedSearch('');
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter by Team Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-gray-500 hidden sm:block" />
          <select
            value={teamId}
            onChange={(e) => {
              setTeamId(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-56 py-2.5 px-3 bg-gray-950 border border-gray-800 focus:border-amber-500/60 rounded-xl text-sm text-gray-200 focus:outline-none cursor-pointer transition-colors"
          >
            <option value="">All Teams (10)</option>
            {(teams || []).map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.abbr})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Match Results */}
      {isLoading && <LoadingSpinner />}
      {error && <ErrorState message="Failed to load matches. Please try again." />}

      {!isLoading && !error && (
        <>
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-sm font-medium text-gray-400">
              Showing {data?.matches?.length || 0} of {data?.meta?.total || 0} matches
              {debouncedSearch && ` matching "${debouncedSearch}"`}
            </span>
            {data?.meta && data.meta.totalPages > 1 && (
              <span className="text-xs bg-gray-800/80 border border-gray-700/60 text-amber-400 px-3 py-1 rounded-full font-semibold">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
            )}
          </div>

          {data?.matches?.length === 0 ? (
            <EmptyState message="No matches found matching your filters." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {data?.matches?.map((match: any) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-800/80">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 disabled:opacity-40 hover:bg-gray-800 text-sm font-medium text-gray-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                      page === p
                        ? 'bg-amber-500 text-gray-950 font-bold shadow-lg shadow-amber-500/20'
                        : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
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

export default function MatchesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MatchesContent />
    </Suspense>
  );
}
