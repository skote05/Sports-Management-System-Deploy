import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const PlayerSportsEditor = ({ sports, onUpdate, onClose }) => {
  const [editedSports, setEditedSports] = useState([]);
  const [error, setError] = useState('');
  
  const availableSports = ['Football', 'Cricket', 'Volleyball', 'Throwball', 'Badminton'];
  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

  // Initialize editedSports when sports prop changes
  useEffect(() => {
    if (sports && sports.length > 0) {
      setEditedSports(sports.map(sport => ({
        sport: sport.sport || '',
        skill_level: sport.skill_level || 'intermediate',
        is_primary: sport.is_primary || false
      })));
    } else {
      // If no sports, add one empty sport
      setEditedSports([{ sport: '', skill_level: 'intermediate', is_primary: true }]);
    }
  }, [sports]);

  const addSport = () => {
    setEditedSports([
      ...editedSports, 
      { sport: '', skill_level: 'intermediate', is_primary: false }
    ]);
  };

  const removeSport = (index) => {
    if (editedSports.length === 1) {
      setError('Player must have at least one sport');
      return;
    }
    setEditedSports(editedSports.filter((_, i) => i !== index));
    setError('');
  };

  const updateSport = (index, field, value) => {
    const updated = [...editedSports];
    updated[index][field] = value;
    
    // If setting as primary, make sure only one sport is primary
    if (field === 'is_primary' && value === true) {
      updated.forEach((sport, i) => {
        if (i !== index) {
          sport.is_primary = false;
        }
      });
    }
    
    setEditedSports(updated);
    setError('');
  };

  const handleSave = async () => {
    try {
      // Validate sports data before saving
      const validSports = editedSports.filter(sport => sport.sport && sport.skill_level);
      
      if (validSports.length === 0) {
        setError('Please add at least one sport');
        return;
      }

      // Ensure at least one sport is primary
      const hasPrimary = validSports.some(sport => sport.is_primary);
      if (!hasPrimary && validSports.length > 0) {
        validSports[0].is_primary = true;
      }

      // Call the onUpdate prop with the validated sports data
      await onUpdate(validSports);
    } catch (error) {
      setError('An error occurred while updating sports');
    }
  };

  return (
    <Box sx={{ minWidth: 500, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Edit Player Sports
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {editedSports.map((sport, index) => (
        <Box 
          key={index} 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 2, 
            alignItems: 'center',
            p: 2,
            border: '1px solid #e0e0e0',
            borderRadius: 1
          }}
        >
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Sport *</InputLabel>
            <Select
              value={sport.sport}
              onChange={(e) => updateSport(index, 'sport', e.target.value)}
              label="Sport *"
              required
            >
              {availableSports.map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 130 }}>
            <InputLabel>Skill Level</InputLabel>
            <Select
              value={sport.skill_level}
              onChange={(e) => updateSport(index, 'skill_level', e.target.value)}
              label="Skill Level"
            >
              {skillLevels.map(level => (
                <MenuItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={sport.is_primary || false}
                onChange={(e) => updateSport(index, 'is_primary', e.target.checked)}
              />
            }
            label="Primary"
          />
          
          <IconButton 
            color="error" 
            onClick={() => removeSport(index)}
            disabled={editedSports.length === 1}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />}
          onClick={addSport}
        >
          Add Sport
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave} 
          color="primary"
          disabled={editedSports.length === 0}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default PlayerSportsEditor;
