import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  CircularProgress,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../../services/api.js';

const TournamentMatchesDialog = ({ open, onClose, tournament, showAlert }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && tournament) {
      fetchTournamentMatches();
    }
  }, [open, tournament]);

  const fetchTournamentMatches = async () => {
    if (!tournament) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/admin/tournaments/${tournament.tournament_id}/matches`);
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error fetching tournament matches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const handleDeleteMatch = async (matchId, matchStatus) => {
    // Prevent deleting completed or in-progress matches
    if (matchStatus === 'completed' || matchStatus === 'in_progress') {
      if (showAlert) {
        showAlert('Cannot delete completed or in-progress matches', 'error');
      }
      return;
    }

    if (window.confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/matches/${matchId}`);
        // Refresh the matches list
        await fetchTournamentMatches();
        if (showAlert) {
          showAlert('Match deleted successfully', 'success');
        }
      } catch (error) {
        console.error('Error deleting match:', error);
        if (showAlert) {
          showAlert('Error deleting match', 'error');
        }
      }
    }
  };

  if (!tournament) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {tournament.tournament_name} - Matches ({tournament.sport})
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Tournament Period: {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Match Date</TableCell>
                    <TableCell>Home Team</TableCell>
                    <TableCell>Away Team</TableCell>
                    <TableCell>Venue</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No matches scheduled for this tournament yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    matches.map((match) => (
                      <TableRow key={match.match_id}>
                        <TableCell>
                          {new Date(match.match_date).toLocaleString()}
                        </TableCell>
                        <TableCell>{match.home_team_name}</TableCell>
                        <TableCell>{match.away_team_name}</TableCell>
                        <TableCell>{match.venue_name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={match.status} 
                            color={getStatusColor(match.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {match.status === 'completed' 
                            ? `${match.home_score} - ${match.away_score}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{match.duration_minutes} min</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteMatch(match.match_id, match.status)}
                            disabled={match.status === 'completed' || match.status === 'in_progress'}
                            aria-label="Delete Match"
                            title={match.status === 'completed' || match.status === 'in_progress' 
                              ? 'Cannot delete completed or in-progress matches' 
                              : 'Delete Match'
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TournamentMatchesDialog;
