import React, { useState, useMemo } from 'react';
import { useAdminStore } from '../../../stores/adminStore.js';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CreateCoachDialog from '../dialogs/CreateCoachDialog.jsx';
import CoachSportsDialog from '../dialogs/CoachSportsDialog.jsx';

const CoachManagementTab = ({ showAlert }) => {
  const { coaches, updateCoachStatus, deleteCoach } = useAdminStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [openCreateCoachDialog, setOpenCreateCoachDialog] = useState(false);
  const [openCoachSportsDialog, setOpenCoachSportsDialog] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);

  const filteredCoaches = useMemo(() => {
    if (statusFilter === 'all') return coaches;
    return coaches.filter(coach => coach.status === statusFilter);
  }, [coaches, statusFilter]);

  const handleUpdateCoachStatus = async (coachId, newStatus) => {
    const result = await updateCoachStatus(coachId, newStatus);
    if (result.success) {
      showAlert(`Coach status updated to ${newStatus}`, 'success');
    } else {
      showAlert(result.error, 'error');
    }
  };

  const handleDeleteCoach = async (coachId, deleteType) => {
    if (window.confirm(`Are you sure you want to ${deleteType === 'permanent' ? 'permanently delete' : 'delete'} this coach?`)) {
      const result = await deleteCoach(coachId, deleteType);
      if (result.success) {
        showAlert(`Coach ${deleteType === 'permanent' ? 'permanently deleted' : 'deleted'} successfully`, 'success');
      } else {
        showAlert(result.error, 'error');
      }
    }
  };

  const handleEditCoachSports = (coach) => {
    setSelectedCoach(coach);
    setOpenCoachSportsDialog(true);
  };

  const coachStats = useMemo(() => {
    return {
      active: coaches.filter(c => c.status === 'active').length,
      inactive: coaches.filter(c => c.status === 'inactive').length,
      deleted: coaches.filter(c => c.status === 'deleted').length
    };
  }, [coaches]);

  return (
    <>
      <Grid container spacing={3}>
        {/* Coach Statistics Cards */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Coaches
              </Typography>
              <Typography variant="h5" component="h2" color="success.main">
                {coachStats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inactive Coaches
              </Typography>
              <Typography variant="h5" component="h2" color="warning.main">
                {coachStats.inactive}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Deleted Coaches
              </Typography>
              <Typography variant="h5" component="h2" color="error.main">
                {coachStats.deleted}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Coach Management Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Coach Management
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={statusFilter === 'active' ? 'contained' : 'outlined'}
                    size="small"
                    color="success"
                    onClick={() => setStatusFilter('active')}
                  >
                    Active
                  </Button>
                  <Button 
                    variant={statusFilter === 'inactive' ? 'contained' : 'outlined'}
                    size="small"
                    color="warning"
                    onClick={() => setStatusFilter('inactive')}
                  >
                    Inactive
                  </Button>
                  <Button 
                    variant={statusFilter === 'deleted' ? 'contained' : 'outlined'}
                    size="small"
                    color="error"
                    onClick={() => setStatusFilter('deleted')}
                  >
                    Deleted
                  </Button>
                </Box>
                <Button 
                  variant="contained" 
                  onClick={() => setOpenCreateCoachDialog(true)}
                >
                  Add New Coach
                </Button>
              </Box>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Sports</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCoaches.map((coach) => (
                    <TableRow key={coach.user_id}>
                      <TableCell>
                        {coach.first_name} {coach.last_name}
                      </TableCell>
                      <TableCell>{coach.email}</TableCell>
                      <TableCell>{coach.phone_number || 'N/A'}</TableCell>
                      <TableCell>
                        <Box sx={{ maxWidth: 200 }}>
                          {coach.sports_with_level ? (
                            coach.sports_with_level.split(',').map((sport, index) => (
                              <Chip 
                                key={index}
                                label={sport.trim()} 
                                size="small" 
                                sx={{ mr: 0.5, mb: 0.5 }}
                                color="primary"
                                variant="outlined"
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No sports assigned
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={coach.status} 
                          color={
                            coach.status === 'active' ? 'success' : 
                            coach.status === 'inactive' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {coach.created_at ? new Date(coach.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => handleEditCoachSports(coach)}
                            sx={{ mr: 1 }}
                          >
                            Edit Sports
                          </Button>
                          
                          {coach.status === 'active' && (
                            <>
                              <Button 
                                size="small" 
                                color="warning"
                                onClick={() => handleUpdateCoachStatus(coach.user_id, 'inactive')}
                              >
                                Deactivate
                              </Button>
                              <Button 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteCoach(coach.user_id, 'soft')}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                          
                          {coach.status === 'inactive' && (
                            <>
                              <Button 
                                size="small" 
                                color="success"
                                onClick={() => handleUpdateCoachStatus(coach.user_id, 'active')}
                              >
                                Activate
                              </Button>
                              <Button 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteCoach(coach.user_id, 'soft')}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                          
                          {coach.status === 'deleted' && (
                            <>
                              <Button 
                                size="small" 
                                color="success"
                                onClick={() => handleUpdateCoachStatus(coach.user_id, 'active')}
                              >
                                Restore
                              </Button>
                              <Button 
                                size="small" 
                                color="error"
                                variant="contained"
                                onClick={() => handleDeleteCoach(coach.user_id, 'permanent')}
                              >
                                Permanent Delete
                              </Button>
                            </>
                          )}
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

      <CreateCoachDialog
        open={openCreateCoachDialog}
        onClose={() => setOpenCreateCoachDialog(false)}
        showAlert={showAlert}
      />

      <CoachSportsDialog
        open={openCoachSportsDialog}
        onClose={() => setOpenCoachSportsDialog(false)}
        coach={selectedCoach}
        showAlert={showAlert}
      />
    </>
  );
};

export default CoachManagementTab;
