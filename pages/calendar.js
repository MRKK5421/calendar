import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Stack, AppBar, useTheme, useMediaQuery, IconButton, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getTasks, updateTask, addTask, deleteTask } from '../utils/firestore';
import { getGoals, addGoal, updateGoal, deleteGoal } from '../utils/firestore';
import CalendarView from '../components/CalendarView';
import GoalDialog from '../components/GoalDialog';
import TaskDialog from '../components/TaskDialog';
import DaysDialog from '../components/DaysDialog';
import PrivateRoute from '../components/PrivateRoute';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimerIcon from '@mui/icons-material/Timer';
import AddIcon from '@mui/icons-material/Add';
import FlagIcon from '@mui/icons-material/Flag';
import AssignmentIcon from '@mui/icons-material/Assignment';

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openDaysDialog, setOpenDaysDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { currentUser } = useAuth();
  const router = useRouter();
  const view = router.query.view || 'month';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
      fetchGoals();
    }
  }, [currentUser]);

  useEffect(() => {
    if (router.query.view !== view) {
      router.push({
        pathname: '/calendar',
        query: { view },
      }, undefined, { shallow: true });
    }
  }, [view]);

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await getTasks(currentUser.uid);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const fetchedGoals = await getGoals(currentUser.uid);
      setGoals(fetchedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleTaskToggle = async (taskId, completed) => {
    try {
      await updateTask(currentUser.uid, taskId, { completed });
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, completed } 
            : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleAddTask = async (newTasks) => {
    try {
      console.log('Adding tasks in CalendarPage:', newTasks);
      
      for (const task of newTasks) {
        console.log('Processing task:', task);
        const taskData = {
          ...task,
          start: new Date(task.start),
          end: new Date(task.end),
        };
        console.log('Adding task to Firestore:', taskData);
        await addTask(currentUser.uid, taskData);
      }
      
      console.log('All tasks added successfully');
      await fetchTasks(); // Refresh the task list
      setOpenTaskDialog(false);
    } catch (error) {
      console.error('Error adding tasks:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleAddGoal = async (goal) => {
    try {
      await addGoal(currentUser.uid, goal);
      await fetchGoals();
      setOpenGoalDialog(false);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleEditGoal = (goal) => {
    setSelectedGoal(goal);
    setOpenGoalDialog(true);
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await deleteGoal(currentUser.uid, goalId);
      await fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
    setShowDatePicker(false);
  };

  const handleEditTask = async (task) => {
    try {
      if (task.type === 'countdown') {
        setSelectedTask(task);
        setOpenDaysDialog(true);
      } else {
        setSelectedTask(task);
        setOpenTaskDialog(true);
      }
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(currentUser.uid, taskId);
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleAddDays = async (daysData) => {
    try {
      if (daysData.id) {
        // Update existing task
        await updateTask(currentUser.uid, daysData.id, {
          title: daysData.title,
          description: daysData.description,
          start: daysData.start,
          end: daysData.end,
          days: daysData.days,
          recurrence: daysData.recurrence
        });
      } else {
        // Create new task(s)
        if (Array.isArray(daysData)) {
          for (const task of daysData) {
            await addTask(currentUser.uid, {
              title: task.title,
              description: task.description,
              start: task.start,
              end: task.end,
              completed: false,
              type: 'countdown',
              days: task.days,
              recurrence: task.recurrence
            });
          }
        } else {
          await addTask(currentUser.uid, {
            title: daysData.title,
            description: daysData.description,
            start: daysData.start,
            end: daysData.end,
            completed: false,
            type: 'countdown',
            days: daysData.days,
            recurrence: daysData.recurrence
          });
        }
      }
      await fetchTasks();
      setOpenDaysDialog(false);
    } catch (error) {
      console.error('Error adding/updating days task:', error);
    }
  };

  const speedDialActions = [
    { icon: <TimerIcon />, name: 'Set Days', action: () => setOpenDaysDialog(true) },
    { icon: <AssignmentIcon />, name: 'Add Task', action: () => setOpenTaskDialog(true) },
    { icon: <FlagIcon />, name: 'Add Goal', action: () => setOpenGoalDialog(true) },
  ];

  return (
    <PrivateRoute>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none' }}>
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ 
              mb: 4, 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between', 
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? 2 : 0
            }}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push('/')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    '& .calendar-icon': {
                      transform: 'scale(1.1)',
                    },
                    '& .calendar-text': {
                      background: 'linear-gradient(45deg, #1976d2 30%, #1cb5e0 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    },
                  },
                }}
              >
                <CalendarTodayIcon
                  className="calendar-icon"
                  sx={{
                    fontSize: isMobile ? 24 : 32,
                    color: '#2196f3',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                />
                <Typography
                  className="calendar-text"
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Calendar
                </Typography>
              </Box>
              {!isMobile && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ position: 'relative' }}>
                    <Button
                      variant="outlined"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      startIcon={<CalendarMonthIcon />}
                      sx={{
                        borderColor: 'rgba(33, 150, 243, 0.5)',
                        color: '#2196f3',
                        '&:hover': {
                          borderColor: '#2196f3',
                          backgroundColor: 'rgba(33, 150, 243, 0.04)',
                        },
                      }}
                    >
                      {format(currentDate, 'MMMM yyyy')}
                    </Button>
                    {showDatePicker && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          mt: 1,
                          zIndex: 1000,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          boxShadow: 3,
                          p: 1,
                        }}
                      >
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            value={currentDate}
                            onChange={handleDateChange}
                            views={['month', 'year']}
                            openTo="month"
                            onClose={() => setShowDatePicker(false)}
                            slotProps={{
                              actionBar: {
                                actions: ['today', 'cancel', 'accept'],
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </Box>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => setOpenDaysDialog(true)}
                    startIcon={<TimerIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #7b1fa2 30%, #ab47bc 90%)',
                      },
                    }}
                  >
                    Set Days
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setOpenTaskDialog(true)}
                    sx={{
                      background: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #f57c00 30%, #ffa726 90%)',
                      },
                    }}
                  >
                    Add Task
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setOpenGoalDialog(true)}
                    sx={{
                      background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976d2 30%, #1cb5e0 90%)',
                      },
                    }}
                  >
                    Add Goal
                  </Button>
                </Stack>
              )}
            </Box>
          </Container>
        </AppBar>
        <Box sx={{ flex: 1, p: { xs: 1, sm: 2, md: 3 }, position: 'relative' }}>
          <CalendarView
            tasks={tasks}
            goals={goals}
            onTaskToggle={handleTaskToggle}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            currentDate={currentDate}
            view={view}
          />
          {isMobile && (
            <SpeedDial
              ariaLabel="Add new item"
              sx={{ position: 'fixed', bottom: 16, right: 16 }}
              icon={<SpeedDialIcon />}
            >
              {speedDialActions.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  onClick={action.action}
                />
              ))}
            </SpeedDial>
          )}
        </Box>

        <GoalDialog
          open={openGoalDialog}
          onClose={() => {
            setOpenGoalDialog(false);
            setSelectedGoal(null);
          }}
          onAddGoal={handleAddGoal}
          selectedGoal={selectedGoal}
        />

        <TaskDialog
          open={openTaskDialog}
          onClose={() => setOpenTaskDialog(false)}
          onAddTask={handleAddTask}
        />

        <DaysDialog
          open={openDaysDialog}
          onClose={() => setOpenDaysDialog(false)}
          onAddTask={handleAddDays}
        />
      </Box>
    </PrivateRoute>
  );
};

export default CalendarPage; 