import React, { useState } from 'react';
import { usePlayerStore } from '../../../stores/playerStore.js';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import TeamDetailsDialog from '../dialogs/TeamDetailsDialog.jsx';

const TeamsTab = ({ showAlert }) => {
  const { teams, fetchTeamDetails } = usePlayerStore();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleViewDetails = async (team) => {
    setSelectedTeam(team);
    setLoading(true);
    try {
      const result = await fetchTeamDetails(team.team_id);
      if (result.success) {
        setTeamDetails(result.data);
        setDialogOpen(true);
      } else {
        showAlert(result.error, 'error');
      }
    } catch (error) {
      showAlert('Failed to load team details', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              My Teams ({teams.length})
            </Typography>
            {teams.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Team Name</TableCell>
                      <TableCell>Sport</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Jersey Number</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teams.map((team) => (
                      <TableRow key={team.team_id}>
                        <TableCell>{team.team_name}</TableCell>
                        <TableCell>{team.sport}</TableCell>
                        <TableCell>{team.position || 'N/A'}</TableCell>
                        <TableCell>{team.jersey_number || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewDetails(team)}
                            disabled={loading}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">
                You are not assigned to any teams yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <TeamDetailsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        teamDetails={teamDetails}
      />
    </>
  );
};

export default TeamsTab; 