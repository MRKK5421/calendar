import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Checkbox,
  Box,
  LinearProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { getGoals, updateGoal } from '../utils/firestore';
import GoalDialog from '../components/GoalDialog';
import { useAuth } from '../contexts/AuthContext';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchGoals = async () => {
      if (currentUser) {
        const fetchedGoals = await getGoals(currentUser.uid);
        setGoals(fetchedGoals);
      }
    };
    fetchGoals();
  }, [currentUser]);

  const handleGoalToggle = async (goal) => {
    const updatedGoal = { ...goal, completed: !goal.completed };
    await updateGoal(goal.id, { completed: updatedGoal.completed });
    setGoals(goals.map(g => g.id === goal.id ? updatedGoal : g));
  };

  const handleGoalAdded = (newGoal) => {
    setGoals([newGoal, ...goals]);
  };

  const completedGoals = goals.filter(goal => goal.completed).length;
  const progress = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Your Goals
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {`${Math.round(progress)}%`}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenDialog(true)}
          >
            Add New Goal
          </Button>
        </Box>

        <Grid container spacing={3}>
          <AnimatePresence>
            {goals.map((goal) => (
              <Grid item xs={12} sm={6} md={4} key={goal.id}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'visible',
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Checkbox
                          checked={goal.completed}
                          onChange={() => handleGoalToggle(goal)}
                          sx={{ mt: -1 }}
                        />
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              textDecoration: goal.completed ? 'line-through' : 'none',
                              color: goal.completed ? 'text.secondary' : 'text.primary',
                            }}
                          >
                            {goal.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              textDecoration: goal.completed ? 'line-through' : 'none',
                            }}
                          >
                            {goal.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(goal.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      </motion.div>

      <GoalDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onGoalAdded={handleGoalAdded}
      />
    </Container>
  );
};

export default GoalsPage; 