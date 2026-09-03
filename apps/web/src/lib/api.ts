import axios from 'axios';

// Set the API URL based on the environment variable or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create an Axios instance with default configuration
export const apiClient = axios.create({
  // Set the base URL for the API
  baseURL: API_URL,
  // Set a timeout for requests (in milliseconds)
  timeout: 10000,
  // Set default headers for requests
  headers: { 'Content-Type': 'application/json' },
});

// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
  //now we can handle the response and errors in a centralized way
  (res) => res,
  //if no error, return the response, otherwise handle the error
  (err) => {
    const message = err.response?.data?.error || err.message || 'An error occurred';
    //we return a rejected promise with the error message, so that it can be handled in the calling code
    //we use promise here because axios returns a promise, and we want to maintain that behavior
    return Promise.reject(new Error(message));
  }
);

// API functions
export const api = {
  // Health
  health: () => apiClient.get('/health').then(r => r.data),

  // Teams
  getTeams: () => apiClient.get('/api/teams').then(r => r.data.data),
  getTeam: (id: number) => apiClient.get(`/api/teams/${id}`).then(r => r.data.data),
  getTeamMatches: (id: number, page = 1, limit = 10) =>
    apiClient.get(`/api/teams/${id}/matches`, { params: { page, limit } }).then(r => r.data.data),
  getTeamStats: (id: number) => apiClient.get(`/api/teams/${id}/stats`).then(r => r.data.data),

  // Matches
  getMatches: (params?: { page?: number; limit?: number; teamId?: number; venueId?: number; search?: string }) =>
    apiClient.get('/api/matches', { params }).then(r => r.data.data),
  getMatch: (id: number) => apiClient.get(`/api/matches/${id}`).then(r => r.data.data),

  // Players
  getPlayers: (params?: { page?: number; limit?: number; search?: string; role?: string; teamId?: number }) =>
    apiClient.get('/api/players', { params }).then(r => r.data.data),
  getPlayer: (id: number) => apiClient.get(`/api/players/${id}`).then(r => r.data.data),

  // Stats
  getBattingStats: (type = 'most_runs', limit = 20) =>
    apiClient.get('/api/stats/batting', { params: { type, limit } }).then(r => r.data.data),
  getBowlingStats: (type = 'top_wickets', limit = 20) =>
    apiClient.get('/api/stats/bowling', { params: { type, limit } }).then(r => r.data.data),
  getOverviewStats: () => apiClient.get('/api/stats/overview').then(r => r.data.data),
  getTossStats: () => apiClient.get('/api/stats/toss').then(r => r.data.data),

  // Standings
  getStandings: () => apiClient.get('/api/standings').then(r => r.data.data),
};
