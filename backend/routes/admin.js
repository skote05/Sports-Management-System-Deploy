import express from 'express';
import { body, param, query } from 'express-validator';
import { 
  getAllPlayers, getAllPlayersWithStatus, deletePlayer, updatePlayerStatus, getPlayerStats,
  getAllAdmins, createAdmin, deleteAdmin, reactivateAdmin,
  createTeam, getAllTeams, getTeamById, getTeamPlayers, addPlayersToTeam, removePlayerFromTeam, deleteTeam,
  scheduleMatch, updateMatchScore, getAllMatches,
  createTournament, getAllTournaments, deleteTournament,
  getAllVenues, createVenue, updateTeamCoach,
  getDashboardStats, getPlayerSports, updatePlayerSports, getAvailablePlayersForTeam,
  createCoach, getAllCoaches, updateCoachStatus, updateCoachSports, deleteCoach, getCoachSports
  , promotePlayerToCoach,getTournamentMatches,getFriendlyMatches,deleteMatch
} from '../controllers/adminController.js';

import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Players
router.get('/players', getAllPlayers);
router.get('/players/details', 
  query('status').optional().isIn(['active', 'inactive', 'deleted']),
  handleValidationErrors,
  getAllPlayersWithStatus
);
router.get('/players/stats', getPlayerStats);
router.get('/players/:playerId/sports', 
  param('playerId').isInt(),
  handleValidationErrors,
  getPlayerSports
);
router.put('/players/:playerId/status', 
  param('playerId').isInt(),
  body('status').isIn(['active', 'inactive', 'deleted']),
  handleValidationErrors,
  updatePlayerStatus
);
router.put('/players/:playerId/sports', 
  param('playerId').isInt(),
  body('sports').isArray({ min: 1 }),
  handleValidationErrors,
  updatePlayerSports
);
router.delete('/players/:playerId', 
  param('playerId').isInt(),
  body('deleteType').optional().isIn(['soft', 'permanent']),
  handleValidationErrors,
  deletePlayer
);

// Admins
router.get('/admins', getAllAdmins);
router.post('/admins', 
  body('username').isLength({ min: 3, max: 30 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().isLength({ min: 2, max: 50 }),
  body('lastName').trim().isLength({ min: 2, max: 50 }),
  body('phoneNumber').optional().matches(/^\d{10,15}$/),
  handleValidationErrors,
  createAdmin
);
router.delete('/admins/:adminId', 
  param('adminId').isInt(),
  handleValidationErrors,
  deleteAdmin
);
router.put('/admins/:adminId/reactivate', 
  param('adminId').isInt(),
  handleValidationErrors,
  reactivateAdmin
);

// Teams
router.get('/teams', getAllTeams);
router.get('/teams/:teamId', 
  param('teamId').isInt(),
  handleValidationErrors,
  getTeamById
);
router.get('/teams/:teamId/available-players', 
  param('teamId').isInt(),
  handleValidationErrors,
  getAvailablePlayersForTeam
);
router.post('/teams', 
  body('teamName').trim().isLength({ min: 2, max: 100 }),
  body('sport').isIn(['Football', 'Cricket', 'Volleyball', 'Throwball', 'Badminton']),
  body('maxPlayers').optional().isInt({ min: 5, max: 30 }),
  body('coachId').optional().isInt(),
  handleValidationErrors,
  createTeam
);
router.post('/teams/:teamId/players/add-batch', 
  param('teamId').isInt(),
  body('players').isArray({ min: 1 }),
  handleValidationErrors,
  addPlayersToTeam
);
router.delete('/teams/:teamId/players/:playerId', 
  param('teamId').isInt(),
  param('playerId').isInt(),
  handleValidationErrors,
  removePlayerFromTeam
);
router.delete('/teams/:teamId', 
  param('teamId').isInt(),
  handleValidationErrors,
  deleteTeam
);
router.get('/teams/:teamId/players', 
  param('teamId').isInt(),
  handleValidationErrors,
  getTeamPlayers
);
router.put('/teams/:teamId/coach', 
  param('teamId').isInt(),
  body('coach_id').optional({ nullable: true }).isInt(),
  handleValidationErrors,
  updateTeamCoach
);

// Matches
router.get('/matches', 
  query('status').optional().isIn(['scheduled', 'completed', 'cancelled']),
  handleValidationErrors,
  getAllMatches
);
// Matches route
// Fix the route to make tournamentId truly optional
router.post('/matches', 
  authenticateToken,
  requireRole('admin'),
  body('homeTeamId').isInt(),
  body('awayTeamId').isInt(),
  body('venueId').isInt(),
  body('matchDate').notEmpty(),
  body('tournamentId').optional({ nullable: true }), // Allow null/empty
  body('durationMinutes').optional().isInt({ min: 30, max: 180 }),
  handleValidationErrors,
  scheduleMatch
);

router.put('/matches/:matchId/score', 
  param('matchId').isInt(),
  body('homeScore').isInt({ min: 0 }),
  body('awayScore').isInt({ min: 0 }),
  handleValidationErrors,
  updateMatchScore
);

// Tournaments
router.get('/tournaments', getAllTournaments);
router.post('/tournaments', 
  body('tournamentName').trim().isLength({ min: 2, max: 100 }),
  body('sport').isIn(['Football', 'Cricket', 'Volleyball', 'Throwball', 'Badminton']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('entryFee').optional().isFloat({ min: 0 }),
  body('maxTeams').optional().isInt({ min: 2 }),
  handleValidationErrors,
  createTournament
);
router.delete('/tournaments/:tournamentId', 
  param('tournamentId').isInt(),
  handleValidationErrors,
  deleteTournament
);

// Venues
router.get('/venues', getAllVenues);
router.post('/venues', 
  body('venueName').trim().isLength({ min: 2, max: 100 }),
  body('location').trim().isLength({ min: 2, max: 200 }),
  body('capacity').optional().isInt({ min: 1 }),
  handleValidationErrors,
  createVenue
);

// Coaches
router.get('/coaches', getAllCoaches);
router.put('/players/:playerId/promote-to-coach', 
  param('playerId').isInt(),
  handleValidationErrors,
  promotePlayerToCoach
);

// Coaches
router.get('/coaches', getAllCoaches);
router.post('/coaches', 
  body('username').isLength({ min: 3, max: 30 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().isLength({ min: 2, max: 50 }),
  body('lastName').trim().isLength({ min: 2, max: 50 }),
  body('sports').isArray({ min: 1 }),
  handleValidationErrors,
  createCoach
);
router.put('/coaches/:coachId/status', 
  param('coachId').isInt(),
  body('status').isIn(['active', 'inactive', 'deleted']),
  handleValidationErrors,
  updateCoachStatus
);
router.put('/coaches/:coachId/sports', 
  param('coachId').isInt(),
  body('sports').isArray({ min: 1 }),
  handleValidationErrors,
  updateCoachSports
);
router.delete('/coaches/:coachId', 
  param('coachId').isInt(),
  body('deleteType').optional().isIn(['soft', 'permanent']),
  handleValidationErrors,
  deleteCoach
);
// Add this route in the coaches section
router.get('/coaches/:coachId/sports', 
  param('coachId').isInt(),
  handleValidationErrors,
  getCoachSports
);
// routes/admin.js - Alternative route definition
router.put('/teams/:teamId/coach', 
  param('teamId').isInt(),
  // Remove body validation to see if that's causing the issue
  updateTeamCoach
);

// Add this route for tournament matches
router.get('/tournaments/:tournamentId/matches', 
  param('tournamentId').isInt(),
  handleValidationErrors,
  getTournamentMatches
);

router.get('/matches/friendly', 
  authenticateToken,
  requireRole('admin'),
  getFriendlyMatches
);

router.delete('/matches/:matchId', 
  authenticateToken,
  requireRole('admin'),
  param('matchId').isInt(),
  handleValidationErrors,
  deleteMatch
);


export default router;
