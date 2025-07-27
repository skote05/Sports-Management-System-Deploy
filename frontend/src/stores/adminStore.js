// src/stores/adminStore.js
import { create } from 'zustand';
import api from '../services/api.js';

export const useAdminStore = create((set, get) => ({
  // Data states
  players: [],
  teams: [],
  tournaments: [],
  matches: [],
  admins: [],
  venues: [],
  coaches: [],
  playerStats: [],
  
  // UI states
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // ✅ FIXED: Now returns the fetched data
  fetchAdminData: async () => {
    set({ loading: true, error: null });
    try {
      const [
        playersResponse,
        teamsResponse,
        adminsResponse,
        statsResponse,
        venuesResponse,
        tournamentsResponse,
        coachesResponse,
        matchesResponse
      ] = await Promise.all([
        api.get('/admin/players/details'),
        api.get('/admin/teams'),
        api.get('/admin/admins'),
        api.get('/admin/players/stats'),
        api.get('/admin/venues').catch(() => ({ data: { venues: [] } })),
        api.get('/admin/tournaments').catch(() => ({ data: { tournaments: [] } })),
        api.get('/admin/coaches').catch(() => ({ data: { coaches: [] } })),
        api.get('/admin/matches').catch(() => ({ data: { matches: [] } }))
      ]);

      const adminData = {
        players: playersResponse.data.players || [],
        teams: teamsResponse.data.teams || [],
        admins: adminsResponse.data.admins || [],
        playerStats: statsResponse.data.stats || [],
        venues: venuesResponse.data.venues || [],
        tournaments: tournamentsResponse.data.tournaments || [],
        coaches: coachesResponse.data.coaches || [],
        matches: matchesResponse.data.matches || [],
      };

      set({
        ...adminData,
        loading: false
      });

      // ✅ RETURN the data for React Query
      return adminData;
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      set({ error: error.message, loading: false });
      
      // ✅ RETURN empty data structure on error
      return {
        players: [],
        teams: [],
        admins: [],
        playerStats: [],
        venues: [],
        tournaments: [],
        coaches: [],
        matches: [],
      };
    }
  },
  // Team actions
  createTeam: async (teamData) => {
    try {
      const response = await api.post('/admin/teams', teamData);
      // Return success immediately, let React Query handle the refresh
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create team error:', error);
      return { success: false, error: error.response?.data?.message || 'Error creating team' };
    }
  },

  deleteTeam: async (teamId) => {
    try {
      await api.delete(`/admin/teams/${teamId}`);
      // Return success immediately, let React Query handle the refresh
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error deleting team' };
    }
  },

  // Player actions
  updatePlayerStatus: async (playerId, status) => {
    try {
      await api.put(`/admin/players/${playerId}/status`, { status });
      set((state) => ({
        players: state.players.map(player => 
          player.user_id === playerId ? { ...player, status } : player
        )
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error updating player status' };
    }
  },

  deletePlayer: async (playerId, deleteType) => {
    try {
      await api.delete(`/admin/players/${playerId}`, { data: { deleteType } });
      if (deleteType === 'permanent') {
        set((state) => ({
          players: state.players.filter(player => player.user_id !== playerId)
        }));
      } else {
        set((state) => ({
          players: state.players.map(player => 
            player.user_id === playerId ? { ...player, status: 'deleted' } : player
          )
        }));
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error deleting player' };
    }
  },

  // Admin actions
  createAdmin: async (adminData) => {
    try {
      const response = await api.post('/admin/admins', adminData);
      get().fetchAdminData(); // Refresh data
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error creating admin' };
    }
  },

  // Tournament actions
  createTournament: async (tournamentData) => {
    try {
      const response = await api.post('/admin/tournaments', tournamentData);
      const newTournament = response.data;
      set((state) => ({
        tournaments: [...state.tournaments, newTournament]
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error creating tournament' };
    }
  },

  deleteTournament: async (tournamentId) => {
    try {
      await api.delete(`/admin/tournaments/${tournamentId}`);
      set((state) => ({
        tournaments: state.tournaments.filter(tournament => tournament.tournament_id !== tournamentId)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error deleting tournament' };
    }
  },

  // Match actions
  scheduleMatch: async (matchData) => {
    try {
      const response = await api.post('/admin/matches', matchData);
      const newMatch = response.data;
      // Refresh admin data to update UI
      get().fetchAdminData();
      return { success: true, data: newMatch };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error scheduling match' };
    }
  },

  updateMatchScore: async (matchId, scoreData) => {
    try {
      const response = await api.put(`/admin/matches/${matchId}/score`, scoreData);
      // Refresh admin data to update UI
      get().fetchAdminData();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error updating match score' };
    }
  },

  deleteMatch: async (matchId) => {
    try {
      await api.delete(`/admin/matches/${matchId}`);
      // Refresh admin data to update UI
      get().fetchAdminData();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error deleting match' };
    }
  },

  // Add coach management actions
  createCoach: async (coachData) => {
    try {
      const response = await api.post('/admin/coaches', coachData);
      get().fetchAdminData(); // Refresh data
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error creating coach' };
    }
  },

  updateCoachStatus: async (coachId, status) => {
    try {
      await api.put(`/admin/coaches/${coachId}/status`, { status });
      set((state) => ({
        coaches: state.coaches.map(coach => 
          coach.user_id === coachId ? { ...coach, status } : coach
        )
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error updating coach status' };
    }
  },

  deleteCoach: async (coachId, deleteType) => {
    try {
      await api.delete(`/admin/coaches/${coachId}`, { data: { deleteType } });
      if (deleteType === 'permanent') {
        set((state) => ({
          coaches: state.coaches.filter(coach => coach.user_id !== coachId)
        }));
      } else {
        set((state) => ({
          coaches: state.coaches.map(coach => 
            coach.user_id === coachId ? { ...coach, status: 'deleted' } : coach
          )
        }));
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error deleting coach' };
    }
  },
}));
