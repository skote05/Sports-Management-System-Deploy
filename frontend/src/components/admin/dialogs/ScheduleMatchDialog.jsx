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
  Typography,
  CircularProgress
} from '@mui/material';
import api from '../../../services/api.js';

const validationSchema = Yup.object({
  homeTeamId: Yup.string().required('Home team is required'),
  awayTeamId: Yup.string().required('Away team is required').notOneOf([Yup.ref('homeTeamId')], 'Away team must be different from home team'),
  venueId: Yup.string().required('Venue is required'),
  matchDate: Yup.string().required('Match date is required'),
  durationMinutes: Yup.number().min(30, 'Minimum 30 minutes').max(180, 'Maximum 180 minutes').required('Duration is required')
});

const ScheduleMatchDialog = ({ open, onClose, showAlert }) => {
  const { teams, tournaments, venues, scheduleMatch, fetchAdminData } = useAdminStore();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Prepare match data for backend
      const matchData = {
        tournamentId: values.tournamentId || null,
        homeTeamId: values.homeTeamId,
        awayTeamId: values.awayTeamId,
        venueId: values.venueId,
        matchDate: values.matchDate,
        durationMinutes: values.durationMinutes || 90
      };

      // Schedule match in backend
      const result = await scheduleMatch(matchData);
      
      if (result.success) {
        showAlert('Match scheduled successfully!', 'success');
        resetForm();
        onClose();
      } else {
        showAlert(result.error || 'Failed to schedule match', 'error');
      }
    } catch (error) {
      showAlert('An error occurred while scheduling the match', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule New Match</DialogTitle>
      <Formik
        initialValues={{
          tournamentId: '',
          homeTeamId: '',
          awayTeamId: '',
          venueId: '',
          matchDate: '',
          durationMinutes: 90
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => {
          const homeTeam = teams.find(t => t.team_id === parseInt(values.homeTeamId));
          const availableAwayTeams = teams.filter(team => 
            team.team_id !== parseInt(values.homeTeamId) && 
            (!homeTeam || team.sport === homeTeam.sport)
          );

          return (
            <Form>
              <DialogContent>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Tournament (Optional)</InputLabel>
                  <Select
                    name="tournamentId"
                    value={values.tournamentId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Tournament (Optional)"
                  >
                    <MenuItem value="">None (Friendly Match)</MenuItem>
                    {tournaments.map((tournament) => (
                      <MenuItem key={tournament.tournament_id} value={tournament.tournament_id}>
                        {tournament.tournament_name} ({tournament.sport})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Home Team *</InputLabel>
                  <Select
                    name="homeTeamId"
                    value={values.homeTeamId}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue('awayTeamId', ''); // Reset away team when home team changes
                    }}
                    onBlur={handleBlur}
                    error={touched.homeTeamId && Boolean(errors.homeTeamId)}
                    label="Home Team *"
                  >
                    {teams.map((team) => (
                      <MenuItem key={team.team_id} value={team.team_id}>
                        {team.team_name} ({team.sport})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Away Team *</InputLabel>
                  <Select
                    name="awayTeamId"
                    value={values.awayTeamId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.awayTeamId && Boolean(errors.awayTeamId)}
                    label="Away Team *"
                    disabled={!values.homeTeamId}
                  >
                    {availableAwayTeams.map((team) => (
                      <MenuItem key={team.team_id} value={team.team_id}>
                        {team.team_name} ({team.sport})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {values.homeTeamId && homeTeam && (
                  <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1 }}>
                    Showing only {homeTeam.sport} teams
                  </Typography>
                )}
                
                {values.tournamentId && values.homeTeamId && homeTeam && (() => {
                  const selectedTournament = tournaments.find(t => t.tournament_id === parseInt(values.tournamentId));
                  if (selectedTournament && selectedTournament.sport !== homeTeam.sport) {
                    return (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
                        ⚠️ Warning: {homeTeam.sport} teams cannot be scheduled in {selectedTournament.sport} tournament
                      </Typography>
                    );
                  }
                  return null;
                })()}
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Venue *</InputLabel>
                  <Select
                    name="venueId"
                    value={values.venueId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.venueId && Boolean(errors.venueId)}
                    label="Venue *"
                  >
                    {venues.map((venue) => (
                      <MenuItem key={venue.venue_id} value={venue.venue_id}>
                        {venue.venue_name} - {venue.location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Match Date & Time *"
                  name="matchDate"
                  type="datetime-local"
                  value={values.matchDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.matchDate && Boolean(errors.matchDate)}
                  helperText={touched.matchDate && errors.matchDate}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  fullWidth
                  label="Duration (Minutes)"
                  name="durationMinutes"
                  type="number"
                  value={values.durationMinutes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.durationMinutes && Boolean(errors.durationMinutes)}
                  helperText={touched.durationMinutes && errors.durationMinutes}
                  margin="normal"
                  inputProps={{ min: 30, max: 180 }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Match'}
                </Button>
              </DialogActions>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};

export default ScheduleMatchDialog;
