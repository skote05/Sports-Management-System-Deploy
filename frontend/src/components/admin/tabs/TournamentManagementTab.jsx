import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../../stores/adminStore.js';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CreateTournamentDialog from '../dialogs/CreateTournamentDialog.jsx';
import TournamentMatchesDialog from '../dialogs/TournamentMatchesDialog.jsx';
import api from '../../../services/api.js';

const TournamentManagementTab = ({ showAlert }) => {
  const { tournaments, deleteTournament, loading, fetchAdminData } = useAdminStore();
  const [openTournamentDialog, setOpenTournamentDialog] = useState(false);
  const [openMatchesDialog, setOpenMatchesDialog] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [friendlyMatches, setFriendlyMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Fetch friendly matches when component mounts or tab changes
  useEffect(() => {
    if (tabValue === 1) {
      fetchFriendlyMatches();
    }
  }, [tabValue]);

  const fetchFriendlyMatches = async () => {
    setLoadingMatches(true);
    try {
      const response = await api.get('/admin/matches/friendly');
      setFriendlyMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error fetching friendly matches:', error);
      showAlert('Error fetching friendly matches', 'error');
      setFriendlyMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleDeleteTournament = async (tournamentId) => {
    if (window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      const result = await deleteTournament(tournamentId);
      if (result.success) {
        showAlert('Tournament deleted successfully', 'success');
        await fetchAdminData();
      } else {
        showAlert(result.error, 'error');
      }
    }
  };

  const handleTournamentCreated = async () => {
    await fetchAdminData();
    setOpenTournamentDialog(false);
  };

  const handleViewMatches = (tournament) => {
    setSelectedTournament(tournament);
    setOpenMatchesDialog(true);
  };

  const handleDeleteMatch = async (matchId, matchStatus) => {
    // Prevent deleting completed or in-progress matches
    if (matchStatus === 'completed' || matchStatus === 'in_progress') {
      showAlert('Cannot delete completed or in-progress matches', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/matches/${matchId}`);
        showAlert('Match deleted successfully', 'success');
        await fetchAdminData(); // Refresh main admin data
        await fetchFriendlyMatches(); // Refresh friendly matches
      } catch (error) {
        showAlert('Error deleting match', 'error');
      }
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Tournament & Match Management</Typography>
              <Button 
                variant="contained" 
                onClick={() => setOpenTournamentDialog(true)}
              >
                Create Tournament
              </Button>
            </Box>

            {/* Tabs for Tournaments and Friendly Matches */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Tournaments" />
                <Tab label="Friendly Matches" />
              </Tabs>
            </Box>

            {/* Tournaments Tab */}
            {tabValue === 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tournament Name</TableCell>
                      <TableCell>Sport</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Teams</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tournaments.map((tournament) => (
                      <TableRow key={tournament.tournament_id}>
                        <TableCell>{tournament.tournament_name || 'N/A'}</TableCell>
                        <TableCell>{tournament.sport || 'N/A'}</TableCell>
                        <TableCell>
                          {tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {tournament.end_date ? new Date(tournament.end_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={tournament.status || 'upcoming'} 
                            color={
                              tournament.status === 'upcoming' ? 'primary' :
                              tournament.status === 'ongoing' ? 'warning' :
                              tournament.status === 'completed' ? 'success' : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{tournament.registered_teams || 0}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewMatches(tournament)}
                              aria-label="View Matches"
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTournament(tournament.tournament_id)}
                              aria-label="Delete Tournament"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {tournaments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No tournaments found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Friendly Matches Tab */}
            {tabValue === 1 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Friendly Matches</Typography>
                  <Button 
                    variant="outlined" 
                    onClick={fetchFriendlyMatches}
                    disabled={loadingMatches}
                  >
                    Refresh
                  </Button>
                </Box>

                {loadingMatches ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Match Date</TableCell>
                          <TableCell>Home Team</TableCell>
                          <TableCell>Away Team</TableCell>
                          <TableCell>Venue</TableCell>
                          <TableCell>Sport</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {friendlyMatches.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} align="center">
                              <Typography variant="body2" color="text.secondary">
                                No friendly matches found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          friendlyMatches.map((match) => (
                            <TableRow key={match.match_id}>
                              <TableCell>
                                {new Date(match.match_date).toLocaleString()}
                              </TableCell>
                              <TableCell>{match.home_team_name}</TableCell>
                              <TableCell>{match.away_team_name}</TableCell>
                              <TableCell>{match.venue_name}</TableCell>
                              <TableCell>{match.sport}</TableCell>
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
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <CreateTournamentDialog 
        open={openTournamentDialog} 
        onClose={handleTournamentCreated}
        showAlert={showAlert} 
      />

      <TournamentMatchesDialog
        open={openMatchesDialog}
        onClose={() => setOpenMatchesDialog(false)}
        tournament={selectedTournament}
        showAlert={showAlert}
      />
    </>
  );
};

export default TournamentManagementTab;
