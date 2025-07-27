import React, { useState } from 'react';
import { useAdminStore } from '../../../stores/adminStore.js';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Box,
  Button
} from '@mui/material';
import CreateAdminDialog from '../dialogs/CreateAdminDialog.jsx';
import CreateTeamDialog from '../dialogs/CreateTeamDialog.jsx';
import CreateTournamentDialog from '../dialogs/CreateTournamentDialog.jsx';
import ScheduleMatchDialog from '../dialogs/ScheduleMatchDialog.jsx';

const OverviewTab = ({ showAlert }) => {
  const { players, teams, admins, tournaments } = useAdminStore();
  const [openAdminDialog, setOpenAdminDialog] = useState(false);
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [openTournamentDialog, setOpenTournamentDialog] = useState(false);
  const [openScheduleMatchDialog, setOpenScheduleMatchDialog] = useState(false);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Admins
              </Typography>
              <Typography variant="h5" component="h2">
                {admins.filter(admin => admin.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Players
              </Typography>
              <Typography variant="h5" component="h2">
                {players.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Teams
              </Typography>
              <Typography variant="h5" component="h2">
                {teams.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tournaments
              </Typography>
              <Typography variant="h5" component="h2">
                {tournaments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => setOpenAdminDialog(true)}
              >
                Create Admin
              </Button>
              <Button 
                variant="contained" 
                color="secondary"
                onClick={() => setOpenTeamDialog(true)}
              >
                Create Team
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => setOpenTournamentDialog(true)}
              >
                Create Tournament
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={() => setOpenScheduleMatchDialog(true)}
              >
                Schedule Match
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <CreateAdminDialog 
        open={openAdminDialog} 
        onClose={() => setOpenAdminDialog(false)} 
        showAlert={showAlert} 
      />
      <CreateTeamDialog 
        open={openTeamDialog} 
        onClose={() => setOpenTeamDialog(false)} 
        showAlert={showAlert} 
      />
      <CreateTournamentDialog 
        open={openTournamentDialog} 
        onClose={() => setOpenTournamentDialog(false)} 
        showAlert={showAlert} 
      />
      <ScheduleMatchDialog 
        open={openScheduleMatchDialog} 
        onClose={() => setOpenScheduleMatchDialog(false)} 
        showAlert={showAlert} 
      />
    </>
  );
};

export default OverviewTab;
