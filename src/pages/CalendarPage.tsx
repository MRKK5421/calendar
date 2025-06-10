import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fab, Stack, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GoalDialog from '../components/GoalDialog';
import { UserProfile, Goal, Task } from '../types/firestore';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { createGoal, getGoals, createTask, getTasks } from '../utils/firestore';
import { auth } from '../firebase';
import CalendarView from '../components/CalendarView';

// Dummy users for assignment (replace with Firestore users later)
const dummyUsers: UserProfile[] = [
  { uid: '1', displayName: 'Alice', email: 'alice@example.com' },
  { uid: '2', displayName: 'Bob', email: 'bob@example.com' },
];

const CalendarPage: React.FC = () => {
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      const fetchedGoals = await getGoals(auth.currentUser.uid);
      setGoals(fetchedGoals);
      const fetchedTasks = await Promise.all(fetchedGoals.map(g => getTasks(g.id)));
      setTasks(fetchedTasks.flat());
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCreateGoal = async (goalData: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    assignees: string[];
  }) => {
    if (!auth.currentUser) return;
    const newGoal = await createGoal({
      ownerId: auth.currentUser.uid,
      title: goalData.title,
      description: goalData.description,
      startDate: goalData.startDate,
      endDate: goalData.endDate,
      assignees: goalData.assignees,
      createdAt: dayjs().toISOString(),
    });
    setGoals(g => [...g, newGoal]);
    // Generate daily tasks for each assignee
    const days = dayjs(goalData.endDate).diff(dayjs(goalData.startDate), 'day') + 1;
    const newTasks: Task[] = [];
    for (let i = 0; i < days; i++) {
      const date = dayjs(goalData.startDate).add(i, 'day').format('YYYY-MM-DD');
      for (const assigneeId of goalData.assignees) {
        const task = await createTask({
          goalId: newGoal.id,
          date,
          title: goalData.title,
          completed: false,
          assigneeId,
          createdAt: dayjs().toISOString(),
        });
        newTasks.push(task);
      }
    }
    setTasks(t => [...t, ...newTasks]);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks => tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  if (loading) return <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"><Typography>Loading...</Typography></Box>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 4, position: 'relative' }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          Your Task Calendar
        </Typography>
        <CalendarView tasks={tasks} onTaskUpdate={handleTaskUpdate} />
        <Fab color="primary" aria-label="add" sx={{ position: 'absolute', bottom: 24, right: 24 }} onClick={() => setGoalDialogOpen(true)}>
          <AddIcon />
        </Fab>
        <GoalDialog
          open={goalDialogOpen}
          onClose={() => setGoalDialogOpen(false)}
          onCreate={handleCreateGoal}
          users={dummyUsers.map(u => ({ uid: u.uid, displayName: u.displayName }))}
        />
        <Box mt={4}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Goals</Typography>
          <Stack spacing={1}>
            {goals.map(goal => (
              <Paper key={goal.id} sx={{ p: 2, borderRadius: 2 }}>
                <Typography fontWeight={600}>{goal.title}</Typography>
                <Typography variant="body2" color="text.secondary">{goal.startDate} to {goal.endDate}</Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  {goal.assignees.map(aid => {
                    const user = dummyUsers.find(u => u.uid === aid);
                    return user ? <Chip key={aid} label={user.displayName} size="small" /> : null;
                  })}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
        <Box mt={4}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Tasks</Typography>
          <Stack spacing={1}>
            {tasks.map(task => (
              <Paper key={task.id} sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography fontWeight={500}>{task.title}</Typography>
                <Typography variant="body2" color="text.secondary">{task.date}</Typography>
                <Chip label={dummyUsers.find(u => u.uid === task.assigneeId)?.displayName || task.assigneeId} size="small" />
              </Paper>
            ))}
          </Stack>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default CalendarPage; 