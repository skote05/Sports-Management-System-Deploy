import express from 'express';
import { 
  getPlayerMatches, 
  registerForTournament, 
  getPlayerTeams,
  getPlayerProfile,
  updatePlayerProfile,
  getPlayerSports,
  addPlayerSport,
  updatePlayerSport,
  deletePlayerSport,
  getPlayerTournaments,
  getPlayerNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getTeamDetails,
  getCoachInfo
} from '../controllers/playerController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['player', 'admin']));

// Existing routes
router.get('/matches', getPlayerMatches);
router.post('/register-tournament', registerForTournament);
router.get('/teams', getPlayerTeams);

// New profile management routes
router.get('/profile', getPlayerProfile);
router.put('/profile', updatePlayerProfile);

// Sports management routes
router.get('/sports', getPlayerSports);
router.post('/sports', addPlayerSport);
router.put('/sports/:sportId', updatePlayerSport);
router.delete('/sports/:sportId', deletePlayerSport);

// Tournament routes
router.get('/tournaments', getPlayerTournaments);

// Notification routes
router.get('/notifications', getPlayerNotifications);
router.put('/notifications/:notificationId/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);

// Team and coach information routes
router.get('/teams/:teamId/details', getTeamDetails);
router.get('/coaches/:coachId', getCoachInfo);

export default router;
