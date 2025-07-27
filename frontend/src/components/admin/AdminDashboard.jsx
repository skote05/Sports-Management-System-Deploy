import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore.js';
import { useAdminStore } from '../../stores/adminStore.js';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Alert,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';

// Import tab components
import OverviewTab from './tabs/OverviewTab.jsx';
import AdminManagementTab from './tabs/AdminManagementTab.jsx';
import TeamManagementTab from './tabs/TeamManagementTab.jsx';
import PlayerManagementTab from './tabs/PlayerManagementTab.jsx';
import CoachManagementTab from './tabs/CoachManagementTab.jsx';
import TournamentManagementTab from './tabs/TournamentManagementTab.jsx';

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const { players, teams, admins, tournaments, venues, coaches, playerStats, fetchAdminData } = useAdminStore();
  const [tabValue, setTabValue] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

  // Use React Query for data fetching
  const { isLoading, isError } = useQuery({
    queryKey: ['adminData'],
    queryFn: fetchAdminData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const showAlert = (message, severity = 'info') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Failed to load dashboard data. Please try refreshing the page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Button variant="outlined" color="error" onClick={logout}>
          Logout
        </Button>
      </Box>
      
      <Typography variant="h6" gutterBottom>
        Welcome, {user?.firstName} {user?.lastName}
      </Typography>

      {alert.show && (
        <Alert 
          severity={alert.severity} 
          sx={{ mb: 2 }} 
          onClose={() => setAlert({ show: false, message: '', severity: 'info' })}
        >
          {alert.message}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} aria-label="Admin Dashboard Tabs">
          <Tab label="Overview" />
          <Tab label="Admin Management" />
          <Tab label="Team Management" />
          <Tab label="Player Management" />
          <Tab label="Coach Management" />
          <Tab label="Tournament Management" />
        </Tabs>
      </Box>

      {tabValue === 0 && <OverviewTab showAlert={showAlert} />}
      {tabValue === 1 && <AdminManagementTab showAlert={showAlert} />}
      {tabValue === 2 && <TeamManagementTab showAlert={showAlert} />}
      {tabValue === 3 && <PlayerManagementTab showAlert={showAlert} />}
      {tabValue === 4 && <CoachManagementTab showAlert={showAlert} />}
      {tabValue === 5 && <TournamentManagementTab showAlert={showAlert} />}
    </Container>
  );
};

export default AdminDashboard;
