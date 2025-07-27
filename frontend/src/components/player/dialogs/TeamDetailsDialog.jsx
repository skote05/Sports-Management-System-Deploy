import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  Chip,
  Box
} from '@mui/material';

const TeamDetailsDialog = ({ open, onClose, teamDetails }) => {
  if (!teamDetails) return null;

  // Extract team info from the correct structure
  const team = teamDetails.team || teamDetails;
  const teammates = teamDetails.teammates || [];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" color="primary">
          {team.team_name || 'Team Details'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {team.sport || 'N/A'} Team
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Team Information Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Team Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Team Name</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {team.team_name || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Sport</Typography>
                    <Chip 
                      label={team.sport || 'N/A'} 
                      color="info" 
                      size="small"
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Maximum Players</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {team.max_players || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Current Players</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {teammates.length || 0}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Team Status</Typography>
                    <Chip 
                      label={team.status || 'Active'} 
                      color={team.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Coach Information Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Coach Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {team.coach_name ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Coach Name</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {team.coach_name}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {team.coach_email || 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {team.coach_phone || 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Coach Status</Typography>
                      <Chip 
                        label="Assigned" 
                        color="success" 
                        size="small"
                      />
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No coach assigned to this team
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Contact an administrator to assign a coach
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Teammates Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Team Roster ({teammates.length} Players)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {teammates.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Player Name</strong></TableCell>
                          <TableCell><strong>Position</strong></TableCell>
                          <TableCell><strong>Jersey #</strong></TableCell>
                          <TableCell><strong>Skill Level</strong></TableCell>
                          <TableCell><strong>Joined Date</strong></TableCell>
                          <TableCell><strong>Player Status</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teammates.map((teammate, index) => (
                          <TableRow key={teammate.player_id || teammate.user_id || index}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {teammate.first_name} {teammate.last_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {teammate.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {teammate.position || 'Not assigned'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={teammate.jersey_number ? `#${teammate.jersey_number}` : 'N/A'}
                                color={teammate.jersey_number ? 'primary' : 'default'}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {teammate.skill_level ? (
                                <Chip
                                  label={teammate.skill_level.charAt(0).toUpperCase() + teammate.skill_level.slice(1)}
                                  color={
                                    teammate.skill_level === 'expert' ? 'success' :
                                    teammate.skill_level === 'advanced' ? 'primary' :
                                    teammate.skill_level === 'intermediate' ? 'default' : 'warning'
                                  }
                                  size="small"
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">N/A</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {teammate.joined_date ? 
                                  new Date(teammate.joined_date).toLocaleDateString() : 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {/* Since we use hard deletes, if player is in the list, they are active */}
                              <Chip
                                label="Active"
                                color="success"
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No team members found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This team doesn't have any players assigned yet.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          size="large"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamDetailsDialog;
