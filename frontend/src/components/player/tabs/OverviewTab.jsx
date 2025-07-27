import React from 'react';
import { usePlayerStore } from '../../../stores/playerStore.js';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Divider
} from '@mui/material';

const OverviewTab = ({ showAlert }) => {
  const { teams, upcomingMatches, tournaments, notifications, sports } = usePlayerStore();
  
  // Use upcomingMatches instead of filtering matches
  const nextMatches = (upcomingMatches || []).slice(0, 3);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const primarySport = sports.find(sport => sport.is_primary) || sports[0];

  return (
    <Box>
      {/* Quick Stats Cards - Consistent Heights */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: 120 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                My Teams
              </Typography>
              <Typography variant="h5" component="h2">
                {teams.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: 120 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Upcoming Matches
              </Typography>
              <Typography variant="h5" component="h2">
                {(upcomingMatches || []).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: 120 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Active Tournaments
              </Typography>
              <Typography variant="h5" component="h2">
                {tournaments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: 120 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Unread Notifications
              </Typography>
              <Typography variant="h5" component="h2">
                {unreadCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Row - All Same Height */}
      <Grid container spacing={3}>
        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Primary Sport</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {primarySport ? `${primarySport.sport} (${primarySport.skill_level})` : 'Not set'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Sports</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {sports.length}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Teams Joined</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {teams.length}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Upcoming Games</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {(upcomingMatches || []).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* My Teams */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Teams
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 300, overflow: 'auto' }}>
                {teams.length > 0 ? (
                  teams.map((team, index) => (
                    <Box key={team.team_id}>
                      <Box sx={{ py: 2 }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          {team.team_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Sport: {team.sport}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Position: {team.position || 'Not assigned'}
                        </Typography>
                        {team.jersey_number && (
                          <Typography variant="body2" color="text.secondary">
                            Jersey: #{team.jersey_number}
                          </Typography>
                        )}
                      </Box>
                      {index < teams.length - 1 && <Divider />}
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      You are not assigned to any teams yet.
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Matches */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Matches
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 300, overflow: 'auto' }}>
                {nextMatches.length > 0 ? (
                  nextMatches.map((match, index) => (
                    <Box key={match.match_id}>
                      <Box sx={{ py: 2 }}>
                        <Typography variant="body1" fontWeight="bold" gutterBottom>
                          {match.home_team_name} vs {match.away_team_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {new Date(match.match_date).toLocaleDateString()} at {new Date(match.match_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Venue: {match.venue_name}
                        </Typography>
                        {match.tournament_name && (
                          <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                            Tournament: {match.tournament_name}
                          </Typography>
                        )}
                      </Box>
                      {index < nextMatches.length - 1 && <Divider />}
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No upcoming matches scheduled.
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

export default OverviewTab;
