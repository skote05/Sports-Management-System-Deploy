import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

const AdminLogin = () => {
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    const result = await login(values.email, values.password);

    if (result.success) {
      // Check if user is admin
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. Admin privileges required.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <AdminPanelSettingsIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
            <Typography component="h1" variant="h4" align="center">
              Admin Portal
            </Typography>
          </Box>
          
          <Chip 
            label="Restricted Access" 
            color="error" 
            variant="outlined" 
            sx={{ mb: 2, width: '100%' }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Admin Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  aria-label="Admin Email Address"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Admin Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  aria-label="Admin Password"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting ? 'Authenticating...' : 'Admin Sign In'}
                </Button>
                <Box textAlign="center">
                  <Link to="/login">
                    ← Back to User Login
                  </Link>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin;
