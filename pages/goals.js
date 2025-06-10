import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Box,
  LinearProgress,
  Button,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getGoals, addGoal, updateGoal } from '../utils/firestore';
import GoalDialog from '../components/GoalDialog';
import PrivateRoute from '../components/PrivateRoute';
import { format } from 'date-fns';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const { currentUser } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (currentUser) {
      fetchGoals();
    }
  }, [currentUser]);

  const fetchGoals = async () => {
    try {
      const goalsData = await getGoals(currentUser.uid);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleAddGoal = async (goal) => {
    try {
      const newGoal = {
        ...goal,
        userId: currentUser.uid,
      };
      await addGoal(newGoal);
      await fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleToggleComplete = async (goalId, completed) => {
    try {
      await updateGoal(goalId, { completed });
      await fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const completedGoals = goals.filter(goal => goal.completed);
  const progress = goals.length ? (completedGoals.length / goals.length) * 100 : 0;

  return (
    <PrivateRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component={motion.h4}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              fontWeight: 600,
              mb: 2,
              background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            My Goals
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                  },
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}% Complete
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
            sx={{
              background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976d2 30%, #1cb5e0 90%)',
              },
            }}
          >
            Add New Goal
          </Button>
        </Box>

        <Grid container spacing={3}>
          <AnimatePresence>
            {goals.map((goal) => (
              <Grid item xs={12} sm={6} md={4} key={goal.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{
                            textDecoration: goal.completed ? 'line-through' : 'none',
                            color: goal.completed ? 'text.secondary' : 'text.primary',
                            flex: 1,
                          }}
                        >
                          {goal.title}
                        </Typography>
                        <IconButton
                          onClick={() => handleToggleComplete(goal.id, !goal.completed)}
                          sx={{
                            color: goal.completed ? 'success.main' : 'action.disabled',
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            },
                          }}
                        >
                          <motion.div
                            initial={false}
                            animate={{ scale: goal.completed ? 1.1 : 1 }}
                          >
                            ✓
                          </motion.div>
                        </IconButton>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1, mb: 2 }}
                      >
                        {goal.description}
                      </Typography>
                      {goal.deadline && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            mt: 1,
                            color: new Date(goal.deadline) < new Date() && !goal.completed
                              ? 'error.main'
                              : 'text.secondary',
                          }}
                        >
                          Deadline: {format(new Date(goal.deadline), 'MMM d, yyyy h:mm a')}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>

        <GoalDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onAddGoal={handleAddGoal}
        />
      </Container>
    </PrivateRoute>
  );
};

export default GoalsPage; 