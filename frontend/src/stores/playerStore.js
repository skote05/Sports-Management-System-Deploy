// src/stores/playerStore.js
import { create } from 'zustand';
import api from '../services/api.js';

export const usePlayerStore = create((set, get) => ({
  // Data states
  profile: null,
  teams: [],
  matches: [], // Combined matches for backward compatibility
  upcomingMatches: [], // New: separate upcoming matches
  matchHistory: [], // New: separate match history
  tournaments: [],
  notifications: [],
  sports: [],
  teammates: [],
  coaches: [],
  
  // UI states
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Fetch all player data
  fetchPlayerData: async () => {
    set({ loading: true, error: null });
    try {
      const [
        profileResponse,
        teamsResponse,
        matchesResponse,
        tournamentsResponse,
        notificationsResponse,
        sportsResponse
      ] = await Promise.all([
        api.get('/players/profile'),
        api.get('/players/teams'),
        api.get('/players/matches'),
        api.get('/players/tournaments'),
        api.get('/players/notifications'),
        api.get('/players/sports')
      ]);

      // Handle the new matches structure from backend
      const matchesData = matchesResponse.data;
      const upcomingMatches = matchesData.upcomingMatches || [];
      const matchHistory = matchesData.matchHistory || [];
      const allMatches = [...upcomingMatches, ...matchHistory]; // Combined for backward compatibility

      const playerData = {
        profile: profileResponse.data.profile || null,
        teams: teamsResponse.data.teams || [],
        matches: allMatches, // Combined matches
        upcomingMatches: upcomingMatches, // Separate upcoming matches
        matchHistory: matchHistory, // Separate match history
        tournaments: tournamentsResponse.data.tournaments || [],
        notifications: notificationsResponse.data.notifications || [],
        sports: sportsResponse.data.sports || [],
      };

      set({
        ...playerData,
        loading: false,
        error: null
      });

      return playerData;
      
    } catch (error) {
      console.error('Error fetching player data:', error);
      set({ 
        error: error.message, 
        loading: false,
        // Set empty defaults on error
        profile: null,
        teams: [],
        matches: [],
        upcomingMatches: [],
        matchHistory: [],
        tournaments: [],
        notifications: [],
        sports: [],
      });
      
      return {
        profile: null,
        teams: [],
        matches: [],
        upcomingMatches: [],
        matchHistory: [],
        tournaments: [],
        notifications: [],
        sports: [],
      };
    }
  },

  // Profile management
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/players/profile', profileData);
      const updatedProfile = response.data.profile;
      set((state) => ({ 
        profile: updatedProfile 
      }));
      return { success: true, data: updatedProfile };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error updating profile' };
    }
  },

  // Sports management
  addSport: async (sportData) => {
    try {
      const response = await api.post('/players/sports', sportData);
      const newSport = response.data.sport;
      set((state) => ({ 
        sports: [...state.sports, newSport] 
      }));
      return { success: true, data: newSport };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error adding sport' };
    }
  },

  updateSport: async (sportId, sportData) => {
    try {
      const response = await api.put(`/players/sports/${sportId}`, sportData);
      const updatedSport = response.data.sport;
      set((state) => ({
        sports: state.sports.map(sport => 
          sport.id === sportId ? updatedSport : sport
        )
      }));
      return { success: true, data: updatedSport };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error updating sport' };
    }
  },

  deleteSport: async (sportId) => {
    try {
      await api.delete(`/players/sports/${sportId}`);
      set((state) => ({
        sports: state.sports.filter(sport => sport.id !== sportId)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error deleting sport' };
    }
  },

  // Refresh matches data only
  refreshMatches: async () => {
    try {
      const response = await api.get('/players/matches');
      const matchesData = response.data;
      const upcomingMatches = matchesData.upcomingMatches || [];
      const matchHistory = matchesData.matchHistory || [];
      const allMatches = [...upcomingMatches, ...matchHistory];

      set({
        matches: allMatches,
        upcomingMatches: upcomingMatches,
        matchHistory: matchHistory
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error refreshing matches' };
    }
  },

  // Refresh tournaments data only
  refreshTournaments: async () => {
    try {
      const response = await api.get('/players/tournaments');
      set({
        tournaments: response.data.tournaments || []
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error refreshing tournaments' };
    }
  },

  // Notification management
  markNotificationAsRead: async (notificationId) => {
    try {
      await api.put(`/players/notifications/${notificationId}/read`);
      set((state) => ({
        notifications: state.notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error marking notification as read' };
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      await api.put('/players/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map(notification => ({
          ...notification,
          is_read: true
        }))
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error marking all notifications as read' };
    }
  },

  // Tournament registration
  registerForTournament: async (tournamentData) => {
    try {
      const response = await api.post('/players/register-tournament', tournamentData);
      // Refresh tournaments after registration
      await get().refreshTournaments();
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error registering for tournament' };
    }
  },

  // Get team details with teammates
  fetchTeamDetails: async (teamId) => {
    try {
      const response = await api.get(`/players/teams/${teamId}/details`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error fetching team details' };
    }
  },

  // Get coach information
  fetchCoachInfo: async (coachId) => {
    try {
      const response = await api.get(`/players/coaches/${coachId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error fetching coach information' };
    }
  },

  // Utility functions for filtered data
  getUpcomingMatches: () => {
    const state = get();
    return state.upcomingMatches || [];
  },

  getMatchHistory: () => {
    const state = get();
    return state.matchHistory || [];
  },

  getUnreadNotifications: () => {
    const state = get();
    return state.notifications.filter(n => !n.is_read);
  },

  getPrimarySport: () => {
    const state = get();
    return state.sports.find(sport => sport.is_primary) || state.sports[0] || null;
  },

  // Clear all data (useful for logout)
  clearPlayerData: () => {
    set({
      profile: null,
      teams: [],
      matches: [],
      upcomingMatches: [],
      matchHistory: [],
      tournaments: [],
      notifications: [],
      sports: [],
      teammates: [],
      coaches: [],
      loading: false,
      error: null
    });
  }
}));
