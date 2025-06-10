import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  Button,
  Stack,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from '@mui/material';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TimerIcon from '@mui/icons-material/Timer';
import FlagIcon from '@mui/icons-material/Flag';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import { format, differenceInDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { getTasks, getGoals, deleteTask, deleteGoal } from '../utils/firestore';

const AllTasksView = ({ onEditTask, onEditGoal }) => {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const fetchedTasks = await getTasks(currentUser.uid);
      const fetchedGoals = await getGoals(currentUser.uid);
      setTasks(fetchedTasks);
      setGoals(fetchedGoals);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const getFilteredItems = () => {
    const searchTerm = searchQuery.toLowerCase();
    const filteredTasks = tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      (task.description && task.description.toLowerCase().includes(searchTerm))
    );
    const filteredGoals = goals.filter(goal =>
      goal.title.toLowerCase().includes(searchTerm) ||
      (goal.description && goal.description.toLowerCase().includes(searchTerm))
    );

    return {
      tasks: filteredTasks,
      goals: filteredGoals,
      countdownTasks: filteredTasks.filter(task => task.type === 'countdown')
    };
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(currentUser.uid, taskId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await deleteGoal(currentUser.uid, goalId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (daysRemaining) => {
    if (daysRemaining <= 0) return '#f44336';
    if (daysRemaining <= 7) return '#ff9800';
    if (daysRemaining <= 30) return '#2196f3';
    return '#4caf50';
  };

  const { tasks: filteredTasks, goals: filteredGoals, countdownTasks } = getFilteredItems();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2196f3', mb: 2 }}>
          All Tasks & Goals
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tasks and goals..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
            },
          }}
        >
          <Tab
            icon={<AssignmentIcon />}
            label={`Tasks (${filteredTasks.length})`}
            iconPosition="start"
          />
          <Tab
            icon={<TimerIcon />}
            label={`Countdown (${countdownTasks.length})`}
            iconPosition="start"
          />
          <Tab
            icon={<FlagIcon />}
            label={`Goals (${filteredGoals.length})`}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {selectedTab === 0 && (
        <List>
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ListItem
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: task.completed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                  '&:hover': {
                    bgcolor: task.completed ? 'rgba(76, 175, 80, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {task.title}
                      </Typography>
                      <Chip
                        label={format(new Date(task.start), 'MMM dd, yyyy')}
                        size="small"
                        sx={{ backgroundColor: '#2196f3', color: 'white' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      {task.description && (
                        <Typography variant="body2" color="text.secondary">
                          {task.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Edit Task">
                    <IconButton
                      size="small"
                      onClick={() => onEditTask(task)}
                      sx={{ color: '#2196f3' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Task">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTask(task.id)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItem>
              {index < filteredTasks.length - 1 && <Divider />}
            </motion.div>
          ))}
        </List>
      )}

      {selectedTab === 1 && (
        <List>
          {countdownTasks.map((task, index) => {
            const daysRemaining = getDaysRemaining(task.targetDate);
            const progressColor = getProgressColor(daysRemaining);

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    borderLeft: `4px solid ${progressColor}`,
                    bgcolor: 'rgba(156, 39, 176, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(156, 39, 176, 0.2)',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {task.title}
                        </Typography>
                        <Chip
                          label={`${daysRemaining} days`}
                          size="small"
                          sx={{
                            backgroundColor: progressColor,
                            color: 'white',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Target: {format(new Date(task.targetDate), 'MMM dd, yyyy')}
                        </Typography>
                        {task.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {task.description}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit Countdown">
                      <IconButton
                        size="small"
                        onClick={() => onEditTask(task)}
                        sx={{ color: '#9c27b0' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Countdown">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTask(task.id)}
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ListItem>
                {index < countdownTasks.length - 1 && <Divider />}
              </motion.div>
            );
          })}
        </List>
      )}

      {selectedTab === 2 && (
        <List>
          {filteredGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ListItem
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 152, 0, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 152, 0, 0.2)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          textDecoration: goal.completed ? 'line-through' : 'none',
                          color: goal.completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {goal.title}
                      </Typography>
                      <Chip
                        label={format(new Date(goal.deadline), 'MMM dd, yyyy')}
                        size="small"
                        sx={{ backgroundColor: '#ff9800', color: 'white' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      {goal.description && (
                        <Typography variant="body2" color="text.secondary">
                          {goal.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Edit Goal">
                    <IconButton
                      size="small"
                      onClick={() => onEditGoal(goal)}
                      sx={{ color: '#ff9800' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Goal">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteGoal(goal.id)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItem>
              {index < filteredGoals.length - 1 && <Divider />}
            </motion.div>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default AllTasksView; 