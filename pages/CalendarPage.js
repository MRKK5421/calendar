import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';
import CalendarView from '../components/CalendarView';
import GoalDialog from '../components/GoalDialog';
import { getTasks, addTask } from '../utils/firestore';
import { useAuth } from '../contexts/AuthContext';

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      if (currentUser) {
        const fetchedTasks = await getTasks(currentUser.uid);
        setTasks(fetchedTasks);
      }
    };
    fetchTasks();
  }, [currentUser]);

  const handleTaskUpdate = (updatedTask) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const handleTaskAdded = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">
            Calendar
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenDialog(true)}
          >
            Add Task
          </Button>
        </Box>

        <CalendarView tasks={tasks} onTaskUpdate={handleTaskUpdate} />

        <GoalDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onTaskAdded={handleTaskAdded}
        />
      </motion.div>
    </Container>
  );
};

export default CalendarPage; 