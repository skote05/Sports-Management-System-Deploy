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
import PlayerSportsDialog from '../dialogs/PlayerSportsDialog.jsx';

const PlayerManagementTab = ({ showAlert }) => {
  const { players, playerStats, updatePlayerStatus, deletePlayer } = useAdminStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [openPlayerSportsDialog, setOpenPlayerSportsDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const filteredPlayers = useMemo(() => {
    if (statusFilter === 'all') return players;
    return players.filter(player => player.status === statusFilter);
  }, [players, statusFilter]);

  const handleUpdatePlayerStatus = async (playerId, newStatus) => {
    const result = await updatePlayerStatus(playerId, newStatus);
    if (result.success) {
      showAlert(`Player status updated to ${newStatus}`, 'success');
    } else {
      showAlert(result.error, 'error');
    }
  };

  const handleDeletePlayer = async (playerId, deleteType) => {
    if (window.confirm(`Are you sure you want to ${deleteType === 'permanent' ? 'permanently delete' : 'delete'} this player?`)) {
      const result = await deletePlayer(playerId, deleteType);
      if (result.success) {
        showAlert(`Player ${deleteType === 'permanent' ? 'permanently deleted' : 'deleted'} successfully`, 'success');
      } else {
        showAlert(result.error, 'error');
      }
    }
  };

  const handleEditPlayerSports = (player) => {
    setSelectedPlayer(player);
    setOpenPlayerSportsDialog(true);
  };

  return (
    <>
      <Grid container spacing={3}>
        {/* Player Statistics Cards */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Players
              </Typography>
              <Typography variant="h5" component="h2" color="success.main">
                {playerStats.find(s => s.status === 'active')?.count || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inactive Players
              </Typography>
              <Typography variant="h5" component="h2" color="warning.main">
                {playerStats.find(s => s.status === 'inactive')?.count || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Deleted Players
              </Typography>
              <Typography variant="h5" component="h2" color="error.main">
                {playerStats.find(s => s.status === 'deleted')?.count || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Player Management Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Player Management
              </Typography>
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
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Teams</TableCell>
                    <TableCell>Sports</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPlayers.map((player) => (
                    <TableRow key={player.user_id}>
                      <TableCell>
                        {player.first_name} {player.last_name}
                      </TableCell>
                      <TableCell>{player.email}</TableCell>
                      <TableCell>{player.phone_number || 'N/A'}</TableCell>
                      <TableCell>{player.teams || 'No teams'}</TableCell>
                      <TableCell>
                        <Box sx={{ maxWidth: 200 }}>
                          {player.sports_with_level ? (
                            player.sports_with_level.split(',').map((sport, index) => (
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
                          label={player.status} 
                          color={
                            player.status === 'active' ? 'success' : 
                            player.status === 'inactive' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {player.updated_at ? new Date(player.updated_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => handleEditPlayerSports(player)}
                            sx={{ mr: 1 }}
                          >
                            Edit Sports
                          </Button>
                          
                          {player.status === 'active' && (
                            <>
                              <Button 
                                size="small" 
                                color="warning"
                                onClick={() => handleUpdatePlayerStatus(player.user_id, 'inactive')}
                              >
                                Deactivate
                              </Button>
                              <Button 
                                size="small" 
                                color="error"
                                onClick={() => handleDeletePlayer(player.user_id, 'soft')}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                          
                          {player.status === 'inactive' && (
                            <>
                              <Button 
                                size="small" 
                                color="success"
                                onClick={() => handleUpdatePlayerStatus(player.user_id, 'active')}
                              >
                                Activate
                              </Button>
                              <Button 
                                size="small" 
                                color="error"
                                onClick={() => handleDeletePlayer(player.user_id, 'soft')}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                          
                          {player.status === 'deleted' && (
                            <>
                              <Button 
                                size="small" 
                                color="success"
                                onClick={() => handleUpdatePlayerStatus(player.user_id, 'active')}
                              >
                                Restore
                              </Button>
                              <Button 
                                size="small" 
                                color="error"
                                variant="contained"
                                onClick={() => handleDeletePlayer(player.user_id, 'permanent')}
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

      <PlayerSportsDialog
        open={openPlayerSportsDialog}
        onClose={() => setOpenPlayerSportsDialog(false)}
        player={selectedPlayer}
        showAlert={showAlert}
      />
    </>
  );
};

export default PlayerManagementTab;
