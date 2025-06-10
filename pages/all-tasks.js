import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import AllTasksView from '../components/AllTasksView';
import PrivateRoute from '../components/PrivateRoute';
import { useRouter } from 'next/router';

const AllTasksPage = () => {
  const router = useRouter();

  const handleEditTask = (task) => {
    if (task.type === 'countdown') {
      router.push(`/calendar?edit=countdown&id=${task.id}`);
    } else {
      router.push(`/calendar?edit=task&id=${task.id}`);
    }
  };

  const handleEditGoal = (goal) => {
    router.push(`/calendar?edit=goal&id=${goal.id}`);
  };

  return (
    <PrivateRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#2196f3' }}>
              All Tasks & Goals
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              View and manage all your tasks, countdowns, and goals in one place
            </Typography>
          </Box>

          <AllTasksView
            onEditTask={handleEditTask}
            onEditGoal={handleEditGoal}
          />
        </motion.div>
      </Container>
    </PrivateRoute>
  );
};

export default AllTasksPage; 