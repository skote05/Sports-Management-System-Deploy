import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../../stores/adminStore.js';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import api from '../../../services/api.js';

const AssignCoachDialog = ({ open, onClose, team, showAlert }) => {
  const { coaches, fetchAdminData } = useAdminStore();
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && team) {
      // Handle null/undefined coach_id properly
      setSelectedCoachId(team.coach_id || '');
    }
  }, [open, team]);

  const handleUpdateTeamCoach = async () => {
    if (!team) return;

    setLoading(true);
    try {
      // Update team coach in backend
      const response = await api.put(`/admin/teams/${team.team_id}/coach`, {
        coach_id: selectedCoachId === '' ? null : selectedCoachId
      });
      
      if (response.data.success) {
        await fetchAdminData();
        const message = selectedCoachId === '' ? 'Coach removed successfully' : 'Team coach updated successfully';
        showAlert(message, 'success');
        onClose();
      } else {
        showAlert(response.data.message || 'Failed to update team coach', 'error');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error updating team coach';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };


  // Filter coaches by team sport
  const eligibleCoaches = coaches.filter(coach => {
    if (coach.status !== 'active') return false;
    if (!coach.sports_with_level) return false;
    
    const coachSports = coach.sports_with_level
      .split(',')
      .map(s => s.trim().split(' ')[0])
      .map(s => s.replace(/[()]/g, ''));
    
    return coachSports.includes(team?.sport);
  });

  if (!team) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Assign Coach - {team.team_name} ({team.sport})
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Current Coach: {team.coach_name || 'None'}
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Coach</InputLabel>
          <Select
            value={selectedCoachId}
            onChange={(e) => setSelectedCoachId(e.target.value)}
            label="Coach"
            disabled={loading}
          >
            {/* Always show None option - this is the key fix */}
            <MenuItem value="">
              <Typography variant="body2" color="text.secondary">
                None (Remove Coach)
              </Typography>
            </MenuItem>
            
            {eligibleCoaches.map((coach) => (
              <MenuItem key={coach.user_id} value={coach.user_id}>
                <div>
                  <Typography variant="body2">
                    {coach.first_name} {coach.last_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {coach.email} - {coach.sports_with_level}
                  </Typography>
                </div>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {eligibleCoaches.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No coaches found with {team.sport} expertise, but you can still remove the current coach by selecting "None".
          </Alert>
        )}
        
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          {selectedCoachId === '' ? 
            'Select "None" to remove the current coach.' : 
            `Only coaches with ${team.sport} expertise are shown.`
          }
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleUpdateTeamCoach} 
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Updating...' : 
           selectedCoachId === '' ? 'Remove Coach' : 'Assign Coach'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignCoachDialog;
