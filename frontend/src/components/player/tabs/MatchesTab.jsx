import React from 'react';
import { usePlayerStore } from '../../../stores/playerStore.js';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';

const MatchesTab = ({ showAlert }) => {
  const { upcomingMatches, matchHistory, tournaments } = usePlayerStore();
  
  // Combine all matches for display
  const allMatches = [...(upcomingMatches || []), ...(matchHistory || [])];
  
  // Filter for current/active tournaments only
  const currentTournaments = tournaments.filter(tournament => 
    new Date(tournament.start_date) <= new Date() && 
    new Date(tournament.end_date) >= new Date()
  );

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Free';
    return `₹${parseInt(amount).toLocaleString('en-IN')}`;
  };

  const getMatchStatus = (match) => {
    const matchDate = new Date(match.match_date);
    const now = new Date();
    
    if (match.status === 'completed') return 'Completed';
    if (matchDate > now) return 'Upcoming';
    return 'In Progress';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Upcoming': return 'info';
      case 'In Progress': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Player's Matches */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            My Matches ({allMatches.length})
          </Typography>
          {allMatches.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Date & Time</strong></TableCell>
                    <TableCell><strong>Teams</strong></TableCell>
                    <TableCell><strong>Venue</strong></TableCell>
                    <TableCell><strong>Tournament</strong></TableCell>
                    <TableCell><strong>My Side</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Score</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allMatches.map((match) => {
                    const status = getMatchStatus(match);
                    return (
                      <TableRow key={match.match_id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {new Date(match.match_date).toLocaleDateString('en-IN')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(match.match_date).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {match.home_team_name} vs {match.away_team_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {match.sport}
                          </Typography>
                        </TableCell>
                        <TableCell>{match.venue_name}</TableCell>
                        <TableCell>
                          {match.tournament_name ? (
                            <Chip 
                              label={match.tournament_name} 
                              size="small" 
                              color="primary"
                            />
                          ) : (
                            <Chip 
                              label="Friendly" 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {match.player_team_side ? (
                            <Chip 
                              label={match.player_team_side === 'home' ? 'Home' : 'Away'} 
                              size="small"
                              color={match.player_team_side === 'home' ? 'success' : 'info'}
                            />
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={status} 
                            size="small"
                            color={getStatusColor(status)}
                          />
                        </TableCell>
                        <TableCell>
                          {status === 'Completed' ? (
                            <Typography variant="body2" fontWeight="medium">
                              {match.home_score} - {match.away_score}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No matches found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don't have any matches scheduled yet.
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Current Tournaments */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Current Tournaments ({currentTournaments.length})
          </Typography>
          {currentTournaments.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Tournament Name</strong></TableCell>
                    <TableCell><strong>Sport</strong></TableCell>
                    <TableCell><strong>My Team</strong></TableCell>
                    <TableCell><strong>Start Date</strong></TableCell>
                    <TableCell><strong>End Date</strong></TableCell>
                    <TableCell><strong>Entry Fee</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentTournaments.map((tournament) => (
                    <TableRow key={tournament.tournament_id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {tournament.tournament_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={tournament.sport} 
                          size="small"
                          color="secondary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="primary" fontWeight="medium">
                          {tournament.team_name || 'Not assigned'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(tournament.start_date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>
                        {new Date(tournament.end_date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(tournament.entry_fee)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No current tournaments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check back later for new tournaments.
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default MatchesTab;
