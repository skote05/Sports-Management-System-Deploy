import React from 'react';
import { useAdminStore } from '../../../stores/adminStore.js';
import { useQueryClient } from '@tanstack/react-query';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';

const validationSchema = Yup.object({
  teamName: Yup.string().required('Team name is required'),
  sport: Yup.string().required('Sport is required'),
  maxPlayers: Yup.number().min(5, 'Minimum 5 players').max(30, 'Maximum 30 players').required(),
  coachId: Yup.mixed().optional()
});

const SPORTS = ['Football', 'Cricket', 'Volleyball', 'Throwball', 'Badminton'];

const CreateTeamDialog = ({ open, onClose, showAlert }) => {
  const { createTeam, coaches } = useAdminStore();
  const queryClient = useQueryClient();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    // Convert coachId to number or null
    const teamData = {
      ...values,
      coachId: values.coachId ? parseInt(values.coachId) : null
    };
    
    const result = await createTeam(teamData);
    
    if (result.success) {
      showAlert('Team created successfully', 'success');
      resetForm();
      onClose();
      // Invalidate the admin data cache to refresh teams
      queryClient.invalidateQueries({ queryKey: ['adminData'] });
    } else {
      showAlert(result.error, 'error');
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Team</DialogTitle>
      <Formik
        initialValues={{
          teamName: '',
          sport: '',
          maxPlayers: 15,
          coachId: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              <TextField
                fullWidth
                label="Team Name *"
                name="teamName"
                value={values.teamName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.teamName && Boolean(errors.teamName)}
                helperText={touched.teamName && errors.teamName}
                margin="normal"
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Sport *</InputLabel>
                <Select
                  name="sport"
                  value={values.sport}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.sport && Boolean(errors.sport)}
                  label="Sport *"
                >
                  {SPORTS.map((sport) => (
                    <MenuItem key={sport} value={sport}>{sport}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Maximum Players"
                name="maxPlayers"
                type="number"
                value={values.maxPlayers}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.maxPlayers && Boolean(errors.maxPlayers)}
                helperText={touched.maxPlayers && errors.maxPlayers}
                margin="normal"
                inputProps={{ min: 5, max: 30 }}
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Coach (Optional)</InputLabel>
                <Select
                  name="coachId"
                  value={values.coachId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  label="Coach (Optional)"
                >
                  <MenuItem value="">None</MenuItem>
                  {coaches.filter(coach => coach.status === 'active').map((coach) => (
                    <MenuItem key={coach.user_id} value={coach.user_id}>
                      {coach.first_name} {coach.last_name} ({coach.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Creating...' : 'Create Team'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default CreateTeamDialog;
