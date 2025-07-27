import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../../stores/adminStore.js';
import { useAuthStore } from '../../../stores/authStore.js';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import CreateAdminDialog from '../dialogs/CreateAdminDialog.jsx';
import api from '../../../services/api.js';

const AdminManagementTab = ({ showAlert }) => {
  const { admins, loading, fetchAdminData } = useAdminStore();
  const { user } = useAuthStore();
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch admin data on component mount
  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleCreateAdmin = async (adminData) => {
    try {
      // Create admin in backend
      const result = await createAdmin(adminData);
      
      if (result.success) {
        showAlert('Admin created successfully!', 'success');
        setOpenDialog(false);
      } else {
        showAlert(result.error || 'Failed to create admin', 'error');
      }
    } catch (error) {
      showAlert('An error occurred while creating admin', 'error');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to deactivate this admin?')) {
      try {
        await api.delete(`/admin/admins/${adminId}`);
        fetchAdminData();
        showAlert('Admin deactivated successfully', 'success');
      } catch (error) {
        showAlert(error.response?.data?.message || 'Error deactivating admin', 'error');
      }
    }
  };

  const handleReactivateAdmin = async (adminId) => {
    try {
      await api.put(`/admin/admins/${adminId}/reactivate`);
      fetchAdminData();
      showAlert('Admin reactivated successfully', 'success');
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error reactivating admin', 'error');
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Administrators ({admins.length})</Typography>
              <Button 
                variant="contained" 
                onClick={() => setOpenDialog(true)}
              >
                Create Admin
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.user_id}>
                        <TableCell>
                          {admin.first_name} {admin.last_name}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={admin.status} 
                            color={admin.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(admin.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {admin.user_id !== user?.id && (
                            <>
                              {admin.status === 'active' ? (
                                <Button
                                  size="small"
                                  color="warning"
                                  onClick={() => handleDeleteAdmin(admin.user_id)}
                                >
                                  Deactivate
                                </Button>
                              ) : (
                                <Button
                                  size="small"
                                  color="success"
                                  onClick={() => handleReactivateAdmin(admin.user_id)}
                                >
                                  Reactivate
                                </Button>
                              )}
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      <CreateAdminDialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        onSubmit={handleCreateAdmin}
        showAlert={showAlert} 
      />
    </>
  );
};

export default AdminManagementTab;
