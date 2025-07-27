import React from 'react';
import { useAdminStore } from '../../../stores/adminStore.js';
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
  Grid,
  CircularProgress
} from '@mui/material';

const validationSchema = Yup.object({
  tournamentName: Yup.string().required('Tournament name is required'),
  sport: Yup.string().required('Sport is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('startDate'), 'End date must be after start date'),
  entryFee: Yup.number().min(0, 'Entry fee cannot be negative').optional(),
  maxTeams: Yup.number().min(2, 'Minimum 2 teams').optional(),
  description: Yup.string().optional()
});

const SPORTS = ['Football', 'Cricket', 'Volleyball', 'Throwball', 'Badminton'];

const CreateTournamentDialog = ({ open, onClose, showAlert }) => {
  const { createTournament, fetchAdminData } = useAdminStore();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Create tournament with form values
      const result = await createTournament(values);
      
      if (result.success) {
        showAlert('Tournament created successfully!', 'success');
        resetForm();
        onClose();
      } else {
        showAlert(result.error || 'Failed to create tournament', 'error');
      }
    } catch (error) {
      showAlert('An error occurred while creating the tournament', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Tournament</DialogTitle>
      <Formik
        initialValues={{
          tournamentName: '',
          sport: '',
          startDate: '',
          endDate: '',
          entryFee: '',
          maxTeams: '',
          description: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tournament Name *"
                    name="tournamentName"
                    value={values.tournamentName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.tournamentName && Boolean(errors.tournamentName)}
                    helperText={touched.tournamentName && errors.tournamentName}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date *"
                    name="startDate"
                    type="date"
                    value={values.startDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.startDate && Boolean(errors.startDate)}
                    helperText={touched.startDate && errors.startDate}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End Date *"
                    name="endDate"
                    type="date"
                    value={values.endDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.endDate && Boolean(errors.endDate)}
                    helperText={touched.endDate && errors.endDate}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Entry Fee"
                    name="entryFee"
                    type="number"
                    value={values.entryFee}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.entryFee && Boolean(errors.entryFee)}
                    helperText={touched.entryFee && errors.entryFee}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maximum Teams"
                    name="maxTeams"
                    type="number"
                    value={values.maxTeams}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.maxTeams && Boolean(errors.maxTeams)}
                    helperText={touched.maxTeams && errors.maxTeams}
                    inputProps={{ min: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    multiline
                    rows={4}
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Creating...' : 'Create Tournament'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default CreateTournamentDialog;
