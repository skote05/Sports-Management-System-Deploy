import React from 'react';
import { useAdminStore } from '../../../stores/adminStore.js';
import { Formik, Form, FieldArray } from 'formik';
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
  CircularProgress,
  Box,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const validationSchema = Yup.object({
  username: Yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  phoneNumber: Yup.string().matches(/^\d{10,15}$/, 'Phone number must be between 10 and 15 digits').optional(),
  dateOfBirth: Yup.date().optional(),
  sports: Yup.array().min(1, 'At least one sport is required')
});

const SPORTS = ['Football', 'Cricket', 'Volleyball', 'Throwball', 'Badminton'];
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

const CreateCoachDialog = ({ open, onClose, showAlert }) => {
  const { createCoach } = useAdminStore();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const result = await createCoach(values);
    
    if (result.success) {
      showAlert('Coach created successfully', 'success');
      resetForm();
      onClose();
    } else {
      showAlert(result.error, 'error');
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Coach</DialogTitle>
      <Formik
        initialValues={{
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          dateOfBirth: '',
          sports: [{ sport: '', skill_level: 'intermediate', is_primary: true }]
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name *"
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && Boolean(errors.firstName)}
                    helperText={touched.firstName && errors.firstName}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name *"
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.lastName && Boolean(errors.lastName)}
                    helperText={touched.lastName && errors.lastName}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username *"
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email *"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password *"
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={values.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                    helperText={touched.phoneNumber && errors.phoneNumber}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={values.dateOfBirth}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.dateOfBirth && Boolean(errors.dateOfBirth)}
                    helperText={touched.dateOfBirth && errors.dateOfBirth}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Sports Expertise
                  </Typography>
                  <FieldArray name="sports">
                    {({ push, remove }) => (
                      <div>
                        {values.sports.map((sport, index) => (
                          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                            <FormControl sx={{ minWidth: 150 }}>
                              <InputLabel>Sport *</InputLabel>
                              <Select
                                name={`sports.${index}.sport`}
                                value={sport.sport}
                                onChange={handleChange}
                                label="Sport *"
                              >
                                {SPORTS.map(s => (
                                  <MenuItem key={s} value={s}>{s}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 130 }}>
                              <InputLabel>Skill Level</InputLabel>
                              <Select
                                name={`sports.${index}.skill_level`}
                                value={sport.skill_level}
                                onChange={handleChange}
                                label="Skill Level"
                              >
                                {SKILL_LEVELS.map(level => (
                                  <MenuItem key={level} value={level}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name={`sports.${index}.is_primary`}
                                  checked={sport.is_primary}
                                  onChange={handleChange}
                                />
                              }
                              label="Primary"
                            />
                            <IconButton 
                              color="error" 
                              onClick={() => remove(index)}
                              disabled={values.sports.length === 1}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ))}
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => push({ sport: '', skill_level: 'intermediate', is_primary: false })}
                        >
                          Add Sport
                        </Button>
                      </div>
                    )}
                  </FieldArray>
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
                {isSubmitting ? 'Creating...' : 'Create Coach'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default CreateCoachDialog;
