import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box
} from '@mui/material';
import PlayerSportsEditor from '../PlayerSportsEditor.jsx';
import api from '../../../services/api.js';
import { useAdminStore } from '../../../stores/adminStore.js';

const CoachSportsDialog = ({ open, onClose, coach, showAlert }) => {
  const { fetchAdminData } = useAdminStore();
  const [coachSports, setCoachSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (open && coach) {
      fetchCoachSports();
    }
  }, [open, coach]);

  const fetchCoachSports = async () => {
    if (!coach) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/admin/coaches/${coach.user_id}/sports`);
      setCoachSports(response.data.sports || []);
    } catch (error) {
      console.error('Error fetching coach sports:', error);
      // Fallback: parse from existing data
      if (coach.sports_with_level) {
        const parsedSports = coach.sports_with_level.split(',').map(sportStr => {
          const match = sportStr.trim().match(/^(.+?)\s*\((.+?)\)$/);
          if (match) {
            return {
              sport: match[1].trim(),
              skill_level: match[2].trim(),
              is_primary: true
            };
          }
          return {
            sport: sportStr.trim(),
            skill_level: 'intermediate',
            is_primary: true
          };
        });
        setCoachSports(parsedSports);
      } else {
        // Initialize with empty sport if no data
        setCoachSports([{ sport: '', skill_level: 'intermediate', is_primary: true }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCoachSports = async (sports) => {
    if (!coach || sports.length === 0) {
      showAlert('Please add at least one sport', 'error');
      return;
    }

    setUpdating(true);
    try {
      // Update coach sports in backend
      const response = await api.put(`/admin/coaches/${coach.user_id}/sports`, { sports });
      
      if (response.data.success) {
        await fetchAdminData(); // Refresh the main data
        showAlert('Coach sports updated successfully', 'success');
        onClose();
      } else {
        showAlert(response.data.message || 'Failed to update coach sports', 'error');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error updating coach sports';
      showAlert(errorMessage, 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (!coach) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Coach Sports - {coach.first_name} {coach.last_name}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <PlayerSportsEditor 
            sports={coachSports}
            onUpdate={handleUpdateCoachSports}
            onClose={onClose}
          />
        )}
      </DialogContent>
      {updating && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 1000 }}>
          <CircularProgress />
        </Box>
      )}
    </Dialog>
  );
};

export default CoachSportsDialog;
