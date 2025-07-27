import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { usePlayerStore } from '../../../stores/playerStore.js';

const ProfileTab = ({ showAlert }) => {
  const { profile, sports, updateProfile, addSport, updateSport, deleteSport } = usePlayerStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSport, setIsAddingSport] = useState(false);
  const [editingSportId, setEditingSportId] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    email: ''
  });
  const [newSport, setNewSport] = useState({
    sport: '',
    skill_level: 'intermediate',
    is_primary: false
  });
  const [errors, setErrors] = useState({});

  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const availableSports = ['Football', 'Cricket', 'Basketball', 'Volleyball', 'Tennis', 'Badminton', 'Hockey', 'Athletics'];

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'expert': return 'success';
      case 'advanced': return 'primary';
      case 'intermediate': return 'default';
      case 'beginner': return 'warning';
      default: return 'default';
    }
  };

  // ... (keep all your existing handler functions unchanged)
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.phone_number && formData.phone_number.replace(/\D/g, '').length < 10) {
      newErrors.phone_number = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        showAlert('Profile updated successfully!', 'success');
        setIsEditing(false);
      } else {
        showAlert(result.error, 'error');
      }
    } catch (error) {
      showAlert('Failed to update profile', 'error');
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone_number: profile?.phone_number || '',
      date_of_birth: profile?.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
      email: profile?.email || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleAddSport = async () => {
    if (!newSport.sport) {
      showAlert('Please select a sport', 'error');
      return;
    }

    try {
      const result = await addSport(newSport);
      if (result.success) {
        showAlert('Sport added successfully!', 'success');
        setNewSport({ sport: '', skill_level: 'intermediate', is_primary: false });
        setIsAddingSport(false);
      } else {
        showAlert(result.error, 'error');
      }
    } catch (error) {
      showAlert('Failed to add sport', 'error');
    }
  };

  const handleUpdateSport = async (sportId, sportData) => {
    try {
      const result = await updateSport(sportId, sportData);
      if (result.success) {
        showAlert('Sport updated successfully!', 'success');
        setEditingSportId(null);
      } else {
        showAlert(result.error, 'error');
      }
    } catch (error) {
      showAlert('Failed to update sport', 'error');
    }
  };

  const handleDeleteSport = async (sportId) => {
    if (window.confirm('Are you sure you want to remove this sport?')) {
      try {
        const result = await deleteSport(sportId);
        if (result.success) {
          showAlert('Sport removed successfully!', 'success');
        } else {
          showAlert(result.error, 'error');
        }
      } catch (error) {
        showAlert('Failed to remove sport', 'error');
      }
    }
  };

  return (
    <Box>
      {/* Personal Information - Full Width */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Personal Information
                </Typography>
                {!isEditing ? (
                  <Button
                    variant="contained"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveProfile}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name *"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    disabled={!isEditing}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name *"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    disabled={!isEditing}
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    disabled={!isEditing}
                    error={!!errors.phone_number}
                    helperText={errors.phone_number}
                    placeholder="Enter your phone number"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Account Details and Sports Side by Side */}
      <Grid container spacing={3}>
        {/* Account Details */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 500 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Username</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {profile?.username || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Account Status</Typography>
                  <Chip 
                    label={profile?.status || 'N/A'} 
                    color={profile?.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Member Since</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Sports</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {sports.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sports & Skills */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 500 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Sports & Skills ({sports.length})
                </Typography>
                {!isAddingSport ? (
                  <Button
                    variant="contained"
                    onClick={() => setIsAddingSport(true)}
                  >
                    Add Sport
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddSport}
                    >
                      Save Sport
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsAddingSport(false);
                        setNewSport({ sport: '', skill_level: 'intermediate', is_primary: false });
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ height: 380, overflow: 'auto' }}>
                {isAddingSport && (
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom color="primary">
                        Add New Sport
                      </Typography>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Select Sport *</InputLabel>
                            <Select
                              value={newSport.sport}
                              onChange={(e) => setNewSport({ ...newSport, sport: e.target.value })}
                              label="Select Sport *"
                            >
                              {availableSports.filter(sport => 
                                !sports.some(s => s.sport === sport)
                              ).map((sport) => (
                                <MenuItem key={sport} value={sport}>
                                  {sport}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Skill Level</InputLabel>
                            <Select
                              value={newSport.skill_level}
                              onChange={(e) => setNewSport({ ...newSport, skill_level: e.target.value })}
                              label="Skill Level"
                            >
                              {skillLevels.map((level) => (
                                <MenuItem key={level} value={level}>
                                  {level.charAt(0).toUpperCase() + level.slice(1)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={newSport.is_primary}
                                onChange={(e) => setNewSport({ ...newSport, is_primary: e.target.checked })}
                              />
                            }
                            label="Primary Sport"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {sports.length > 0 ? (
                  <Grid container spacing={2}>
                    {sports.map((sport) => (
                      <Grid item xs={12} sm={6} key={sport.id}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            border: sport.is_primary ? '2px solid' : '1px solid',
                            borderColor: sport.is_primary ? 'primary.main' : 'grey.300'
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="h6" color="primary">
                                {sport.sport}
                              </Typography>
                              {sport.is_primary && (
                                <Chip label="Primary" size="small" color="primary" />
                              )}
                            </Box>
                            
                            <Box sx={{ mb: 1 }}>
                              <Chip 
                                label={sport.skill_level.charAt(0).toUpperCase() + sport.skill_level.slice(1)}
                                color={getSkillLevelColor(sport.skill_level)}
                                size="small"
                              />
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Added: {sport.created_at ? new Date(sport.created_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleUpdateSport(sport.id, sport)}
                                fullWidth
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeleteSport(sport.id)}
                                fullWidth
                              >
                                Remove
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No sports added yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add your first sport to get started with your athletic profile.
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileTab;
