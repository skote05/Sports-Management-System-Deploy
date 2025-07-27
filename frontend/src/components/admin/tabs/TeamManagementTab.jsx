import React, { useState } from 'react';
import { useAdminStore } from '../../../stores/adminStore.js';
import { useQueryClient } from '@tanstack/react-query';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CreateTeamDialog from '../dialogs/CreateTeamDialog.jsx';
import ManagePlayersDialog from '../dialogs/ManagePlayersDialog.jsx';
import AssignCoachDialog from '../dialogs/AssignCoachDialog.jsx';

const TeamManagementTab = ({ showAlert }) => {
  const { teams, deleteTeam } = useAdminStore();
  const queryClient = useQueryClient();
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [openManagePlayersDialog, setOpenManagePlayersDialog] = useState(false);
  const [openAssignCoachDialog, setOpenAssignCoachDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team? All players will be removed from the team.')) {
      const result = await deleteTeam(teamId);
      if (result.success) {
        showAlert('Team deleted successfully', 'success');
        // Invalidate the admin data cache to refresh teams
        queryClient.invalidateQueries({ queryKey: ['adminData'] });
      } else {
        showAlert(result.error, 'error');
      }
    }
  };

  const handleManagePlayers = (team) => {
    setSelectedTeam(team);
    setOpenManagePlayersDialog(true);
  };

  const handleAssignCoach = (team) => {
    setSelectedTeam(team);
    setOpenAssignCoachDialog(true);
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Teams</Typography>
              <Button 
                variant="contained" 
                onClick={() => setOpenTeamDialog(true)}
              >
                Create Team
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Team Name</TableCell>
                    <TableCell>Sport</TableCell>
                    <TableCell>Players</TableCell>
                    <TableCell>Coach</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.team_id}>
                      <TableCell>{team.team_name}</TableCell>
                      <TableCell>{team.sport}</TableCell>
                      <TableCell>
                        {team.current_players || 0}/{team.max_players}
                      </TableCell>
                      <TableCell>{team.coach_name || 'None'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PersonAddIcon />}
                            onClick={() => handleManagePlayers(team)}
                          >
                            Manage Players
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleAssignCoach(team)}
                          >
                            Assign Coach
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTeam(team.team_id)}
                            aria-label="Delete Team"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <CreateTeamDialog 
        open={openTeamDialog} 
        onClose={() => setOpenTeamDialog(false)} 
        showAlert={showAlert} 
      />
      
      <ManagePlayersDialog
        open={openManagePlayersDialog}
        onClose={() => setOpenManagePlayersDialog(false)}
        team={selectedTeam}
        showAlert={showAlert}
      />
      
      <AssignCoachDialog
        open={openAssignCoachDialog}
        onClose={() => setOpenAssignCoachDialog(false)}
        team={selectedTeam}
        showAlert={showAlert}
      />
    </>
  );
};

export default TeamManagementTab;
