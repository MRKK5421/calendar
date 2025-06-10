import React from 'react';
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
} from '@mui/material';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TimerIcon from '@mui/icons-material/Timer';
import { format, differenceInDays } from 'date-fns';

const DaysTasksPanel = ({ tasks, onDeleteTask, onEditTask }) => {
  const countdownTasks = tasks.filter(task => task.type === 'countdown');

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

  const handleSelectAll = () => {
    countdownTasks.forEach(task => {
      if (onEditTask) {
        onEditTask({ ...task, completed: true });
      }
    });
  };

  const handleClearAll = () => {
    countdownTasks.forEach(task => {
      if (onEditTask) {
        onEditTask({ ...task, completed: false });
      }
    });
  };

  const handleEdit = (task) => {
    if (onEditTask) {
      onEditTask(task);
    }
  };

  const handleDelete = (taskId) => {
    if (onDeleteTask) {
      onDeleteTask(taskId);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Countdown Tasks
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleSelectAll}
            sx={{
              color: '#2196f3',
              borderColor: '#2196f3',
              '&:hover': {
                borderColor: '#1976d2',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
              },
            }}
          >
            Select All
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClearAll}
            sx={{
              color: '#f44336',
              borderColor: '#f44336',
              '&:hover': {
                borderColor: '#d32f2f',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
              },
            }}
          >
            Clear All
          </Button>
        </Box>
      </Box>
      <List>
        {countdownTasks.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="No countdown tasks"
              secondary="Click 'Set Days' to create a new countdown"
              sx={{ textAlign: 'center', color: 'text.secondary' }}
            />
          </ListItem>
        ) : (
          countdownTasks.map((task) => {
            const daysRemaining = getDaysRemaining(task.targetDate);
            const progressColor = getProgressColor(daysRemaining);

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ListItem
                  sx={{
                    borderLeft: `4px solid ${progressColor}`,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          edge="end"
                          onClick={() => handleEdit(task)}
                          sx={{
                            color: '#2196f3',
                            '&:hover': {
                              backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          edge="end"
                          onClick={() => handleDelete(task.id)}
                          sx={{
                            color: '#f44336',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
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
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Target: {format(new Date(task.targetDate), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </motion.div>
            );
          })
        )}
      </List>
    </Paper>
  );
};

export default DaysTasksPanel; 