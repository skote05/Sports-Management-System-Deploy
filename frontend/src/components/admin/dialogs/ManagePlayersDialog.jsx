import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TextField,
  Chip,
  CircularProgress
} from '@mui/material';
import api from '../../../services/api.js';
import { useAdminStore } from '../../../stores/adminStore.js';

const ManagePlayersDialog = ({ open, onClose, team, showAlert }) => {
  const { fetchAdminData } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [playerDetails, setPlayerDetails] = useState({});

  useEffect(() => {
    if (open && team) {
      fetchTeamData();
    }
  }, [open, team]);

  const fetchTeamData = async () => {
    if (!team) return;
    
    setLoading(true);
    try {
      const [teamPlayersResponse, availablePlayersResponse] = await Promise.all([
        api.get(`/admin/teams/${team.team_id}/players`),
        api.get(`/admin/teams/${team.team_id}/available-players`)
      ]);
      
      setTeamPlayers(teamPlayersResponse.data.players || []);
      setAvailablePlayers(availablePlayersResponse.data.players || []);
      setSelectedPlayerIds([]);
      setPlayerDetails({});
    } catch (error) {
      console.error('Error fetching team data:', error);
      showAlert('Error fetching team data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (playerId) => {
    setSelectedPlayerIds(prev => {
      const newSelected = prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId];
      
      // Initialize or clear player details when selecting/deselecting
      setPlayerDetails(prevDetails => {
        const newDetails = { ...prevDetails };
        if (newSelected.includes(playerId) && !prevDetails[playerId]) {
          newDetails[playerId] = { position: '', jerseyNumber: '' };
        } else if (!newSelected.includes(playerId)) {
          delete newDetails[playerId];
        }
        return newDetails;
      });
      
      return newSelected;
    });
  };

  const handlePlayerDetailChange = (playerId, field, value) => {
    setPlayerDetails(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value
      }
    }));
  };

  const handleBatchAddPlayers = async () => {
    if (selectedPlayerIds.length === 0) return;

    setLoading(true);
    try {
      // Prepare player data with details
      const playersData = selectedPlayerIds.map(playerId => ({
        playerId,
        position: playerDetails[playerId]?.position || '',
        jerseyNumber: playerDetails[playerId]?.jerseyNumber || null
      }));

      await api.post(`/admin/teams/${team.team_id}/players/add-batch`, {
        players: playersData
      });
      
      showAlert(`Successfully added ${selectedPlayerIds.length} players to team`, 'success');
      fetchAdminData(); // Refresh main data
      fetchTeamData(); // Refresh dialog data
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error adding players to team', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlayerFromTeam = async (playerId) => {
    if (window.confirm('Are you sure you want to remove this player from the team?')) {
      setLoading(true);
      try {
        await api.delete(`/admin/teams/${team.team_id}/players/${playerId}`);
        
        showAlert('Player removed from team successfully', 'success');
        fetchAdminData(); // Refresh main data
        fetchTeamData(); // Refresh dialog data
      } catch (error) {
        showAlert(error.response?.data?.message || 'Error removing player from team', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!team) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Manage Players - {team.team_name} ({team.sport})
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Current Team Players */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Current Team Roster ({teamPlayers.length})
            </Typography>
            {teamPlayers.length > 0 ? (
              <TableContainer sx={{ mb: 3, maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Player Name</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Jersey #</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teamPlayers.map((player) => (
                      <TableRow key={player.user_id}>
                        <TableCell>{player.first_name} {player.last_name}</TableCell>
                        <TableCell>{player.position || 'N/A'}</TableCell>
                        <TableCell>{player.jersey_number || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleRemovePlayerFromTeam(player.user_id)}
                            disabled={loading}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                No players in this team yet.
              </Typography>
            )}
            
            {/* Available Players */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Available Players ({availablePlayers.length})
            </Typography>
            {availablePlayers.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No available players found for {team.sport}
              </Typography>
            ) : (
              <>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Select players to add to the team and assign their positions and jersey numbers:
                </Typography>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Select</TableCell>
                        <TableCell>Player Name</TableCell>
                        <TableCell>Skill Level</TableCell>
                        <TableCell>Primary Sport</TableCell>
                        <TableCell>Position</TableCell>
                        <TableCell>Jersey #</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availablePlayers.map((player) => (
                        <TableRow key={player.user_id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedPlayerIds.includes(player.user_id)}
                              onChange={() => handlePlayerSelect(player.user_id)}
                              disabled={loading}
                            />
                          </TableCell>
                          <TableCell>{player.first_name} {player.last_name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={player.skill_level || 'intermediate'} 
                              size="small"
                              color={
                                player.skill_level === 'expert' ? 'success' :
                                player.skill_level === 'advanced' ? 'primary' :
                                player.skill_level === 'intermediate' ? 'default' : 'warning'
                              }
                            />
                          </TableCell>
                          <TableCell>{player.is_primary ? 'Yes' : 'No'}</TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="Position"
                              value={playerDetails[player.user_id]?.position || ''}
                              onChange={(e) => handlePlayerDetailChange(player.user_id, 'position', e.target.value)}
                              disabled={!selectedPlayerIds.includes(player.user_id) || loading}
                              sx={{ width: 120 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              placeholder="Jersey"
                              value={playerDetails[player.user_id]?.jerseyNumber || ''}
                              onChange={(e) => handlePlayerDetailChange(player.user_id, 'jerseyNumber', e.target.value)}
                              disabled={!selectedPlayerIds.includes(player.user_id) || loading}
                              sx={{ width: 80 }}
                              inputProps={{ min: 1, max: 99 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {selectedPlayerIds.length} players selected
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleBatchAddPlayers}
                    disabled={selectedPlayerIds.length === 0 || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? 'Adding...' : `Add ${selectedPlayerIds.length} Players to Team`}
                  </Button>
                </Box>
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManagePlayersDialog;
