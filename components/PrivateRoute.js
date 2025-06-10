import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const router = useRouter();

  if (currentUser === undefined) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  return children;
};

export default PrivateRoute; 