import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import PlayerSportsEditor from '../PlayerSportsEditor.jsx';
import api from '../../../services/api.js';
import { useAdminStore } from '../../../stores/adminStore.js';

const PlayerSportsDialog = ({ open, onClose, player, showAlert }) => {
  const { fetchAdminData } = useAdminStore();
  const [playerSports, setPlayerSports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && player) {
      fetchPlayerSports();
    }
  }, [open, player]);

  const fetchPlayerSports = async () => {
    if (!player) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/admin/players/${player.user_id}/sports`);
      setPlayerSports(response.data.sports || []);
    } catch (error) {
      showAlert('Error fetching player sports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlayerSports = async (sports) => {
    try {
      await api.put(`/admin/players/${player.user_id}/sports`, { sports });
      showAlert('Player sports updated successfully', 'success');
      await fetchAdminData(); // Refresh admin data
      onClose();
    } catch (error) {
      showAlert('Error updating player sports', 'error');
    }
  };

  if (!player) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Player Sports - {player.first_name} {player.last_name}
      </DialogTitle>
      <DialogContent>
        {!loading && (
          <PlayerSportsEditor 
            sports={playerSports}
            onUpdate={handleUpdatePlayerSports}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSportsDialog;
