import React from 'react';
import { usePlayerStore } from '../../../stores/playerStore.js';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';

const NotificationsTab = ({ showAlert }) => {
  const { upcomingMatches, tournaments } = usePlayerStore();
  
  // Filter for upcoming tournaments (all tournaments that haven't ended)
  const upcomingTournaments = tournaments.filter(tournament => 
    new Date(tournament.end_date) >= new Date() && tournament.status !== 'cancelled'
  );

  // Filter for tournaments player is participating in
  const myTournaments = tournaments.filter(tournament => 
    tournament.participation_status === 'participating'
  );

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Free';
    return `₹${parseInt(amount).toLocaleString('en-IN')}`;
  };

  const getParticipationChip = (tournament) => {
    switch (tournament.participation_status) {
      case 'participating':
        return <Chip label="Participating" size="small" color="success" />;
      case 'available':
        return <Chip label="Available" size="small" color="primary" />;
      case 'ongoing':
        return <Chip label="Ongoing" size="small" color="warning" />;
      case 'completed':
        return <Chip label="Completed" size="small" color="default" />;
      case 'cancelled':
        return <Chip label="Cancelled" size="small" color="error" />;
      default:
        return <Chip label="Unknown" size="small" variant="outlined" />;
    }
  };

  return (
    <Box>
      {/* Side by Side Layout */}
      <Grid container spacing={3}>
        {/* All Upcoming Tournaments */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 600 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                All Tournaments ({upcomingTournaments.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 520, overflow: 'auto' }}>
                {upcomingTournaments.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {upcomingTournaments.map((tournament, index) => (
                      <Box key={tournament.tournament_id}>
                        <Card variant="outlined">
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                              {tournament.tournament_name}
                            </Typography>
                            
                            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={tournament.sport} 
                                size="small" 
                                color="secondary"
                              />
                              <Chip 
                                label={tournament.status} 
                                size="small"
                                variant="outlined"
                              />
                              {getParticipationChip(tournament)}
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Start Date:</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {new Date(tournament.start_date).toLocaleDateString('en-IN')}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">End Date:</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {new Date(tournament.end_date).toLocaleDateString('en-IN')}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Entry Fee:</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {formatCurrency(tournament.entry_fee)}
                                </Typography>
                              </Box>
                              
                              {tournament.max_teams && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Teams:</Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {tournament.registered_teams || 0} / {tournament.max_teams}
                                  </Typography>
                                </Box>
                              )}
                              
                              {tournament.team_name && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">My Team:</Typography>
                                  <Typography variant="body2" fontWeight="medium" color="primary">
                                    {tournament.team_name}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                        {index < upcomingTournaments.length - 1 && <Divider sx={{ my: 1 }} />}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No tournaments available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Check back later for new tournament announcements.
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Matches */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 600 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Matches ({(upcomingMatches || []).length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 520, overflow: 'auto' }}>
                {upcomingMatches && upcomingMatches.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {upcomingMatches.map((match, index) => (
                      <Box key={match.match_id}>
                        <Card variant="outlined">
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                              {match.home_team_name} vs {match.away_team_name}
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              <Chip 
                                label={match.sport} 
                                size="small" 
                                sx={{ mr: 1 }}
                              />
                              {match.tournament_name ? (
                                <Chip 
                                  label="Tournament" 
                                  size="small"
                                  variant="outlined"
                                />
                              ) : (
                                <Chip 
                                  label="Friendly" 
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Date:</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {new Date(match.match_date).toLocaleDateString('en-IN')}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Time:</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {new Date(match.match_date).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Venue:</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {match.venue_name}
                                </Typography>
                              </Box>
                              
                              {match.tournament_name && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Tournament:</Typography>
                                  <Typography variant="body2" fontWeight="medium" color="primary">
                                    {match.tournament_name}
                                  </Typography>
                                </Box>
                              )}
                              
                              {match.player_team_side && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Team Side:</Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {match.player_team_side === 'home' ? 'Home' : 'Away'}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                        {index < upcomingMatches.length - 1 && <Divider sx={{ my: 1 }} />}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No upcoming matches
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Check back later for new match schedules.
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NotificationsTab;
