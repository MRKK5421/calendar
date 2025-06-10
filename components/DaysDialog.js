import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Slider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Tooltip,
  Paper,
  Grid,
  Checkbox,
} from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TimerIcon from '@mui/icons-material/Timer';
import { addDays, format, addMonths, addWeeks, differenceInDays, subDays } from 'date-fns';
import RepeatIcon from '@mui/icons-material/Repeat';

const DaysDialog = ({ open, onClose, onAddTask, onEditTask, onDeleteTask, tasks = [] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState(30);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [recurrence, setRecurrence] = useState({
    type: 'none',
    interval: 1,
    totalOccurrences: 1,
    occurrence: 1
  });

  const calculateTargetDate = (start, days) => {
    const startDate = new Date(start);
    const targetDate = addDays(startDate, days);
    return targetDate.toISOString();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    // Calculate start date from target date and days
    const targetDate = new Date(task.end || task.targetDate);
    const startDate = subDays(targetDate, task.days || 30);
    setStartDate(format(startDate, 'yyyy-MM-dd'));
    setDays(task.days || 30);
    if (task.recurrence) {
      setRecurrence(task.recurrence);
    }
  };

  const handleDelete = (taskId) => {
    if (onDeleteTask) {
      onDeleteTask(taskId);
    }
  };

  const handleSelectAll = () => {
    const taskIds = tasks.map(task => task.id);
    setSelectedTasks(new Set(taskIds));
  };

  const handleClearAll = () => {
    setSelectedTasks(new Set());
  };

  const handleTaskSelect = (taskId) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    selectedTasks.forEach(taskId => {
      if (onDeleteTask) {
        onDeleteTask(taskId);
      }
    });
    setSelectedTasks(new Set());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const targetDate = calculateTargetDate(startDate, days);
    const taskData = {
      title,
      description,
      targetDate,
      type: 'countdown',
      completed: false,
      days: days,
      recurrence: recurrence.type !== 'none' ? recurrence : null
    };

    if (editingTask) {
      onEditTask({ ...editingTask, ...taskData });
    } else {
      onAddTask(taskData);
    }

    // Reset form
    setTitle('');
    setDescription('');
    setStartDate('');
    setDays(30);
    setEditingTask(null);
    setRecurrence({
      type: 'none',
      interval: 1,
      totalOccurrences: 1,
      occurrence: 1
    });
  };

  const handleClose = () => {
    // Reset form
    setTitle('');
    setDescription('');
    setStartDate('');
    setDays(30);
    setEditingTask(null);
    setRecurrence({
      type: 'none',
      interval: 1,
      totalOccurrences: 1,
      occurrence: 1
    });
    onClose();
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const days = differenceInDays(new Date(endDate), today);
    return days >= 0 ? days : 0;
  };

  const getProgressColor = (daysRemaining, totalDays) => {
    if (daysRemaining <= 0) return '#f44336';
    if (daysRemaining <= 7) return '#ff9800';
    if (daysRemaining <= 30) return '#2196f3';
    return '#4caf50';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        pb: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {editingTask ? 'Edit Countdown Task' : 'Add Countdown Task'}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {editingTask ? 'Edit Task' : 'New Task'}
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Number of Days"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  required
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ mb: 2 }}
                />
                {startDate && days > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Target Date: {format(calculateTargetDate(startDate, days), 'MMM dd, yyyy')}
                  </Typography>
                )}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Recurrence</InputLabel>
                  <Select
                    value={recurrence.type}
                    onChange={(e) => setRecurrence({ ...recurrence, type: e.target.value })}
                    label="Recurrence"
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
                {recurrence.type !== 'none' && (
                  <>
                    <TextField
                      fullWidth
                      label="Interval"
                      type="number"
                      value={recurrence.interval}
                      onChange={(e) => setRecurrence({ ...recurrence, interval: parseInt(e.target.value) })}
                      required
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Total Occurrences"
                      type="number"
                      value={recurrence.totalOccurrences}
                      onChange={(e) => setRecurrence({ ...recurrence, totalOccurrences: parseInt(e.target.value) })}
                      required
                      sx={{ mb: 2 }}
                    />
                  </>
                )}
              </form>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.1)',
                height: '100%',
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3 
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
                  {selectedTasks.size > 0 && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleDeleteSelected}
                      sx={{
                        color: '#f44336',
                        borderColor: '#f44336',
                        '&:hover': {
                          borderColor: '#d32f2f',
                          backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        },
                      }}
                    >
                      Delete Selected
                    </Button>
                  )}
                </Box>
              </Box>
              <List>
                {tasks.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No countdown tasks yet
                  </Typography>
                ) : (
                  tasks.map((task) => {
                    const daysRemaining = getDaysRemaining(task.end || task.targetDate);
                    const progressColor = getProgressColor(daysRemaining, task.days || 30);
                    
                    return (
                      <ListItem
                        key={task.id}
                        sx={{
                          mb: 1,
                          borderRadius: 1,
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                        secondaryAction={
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Checkbox
                              checked={selectedTasks.has(task.id)}
                              onChange={() => handleTaskSelect(task.id)}
                              sx={{
                                color: '#2196f3',
                                '&.Mui-checked': {
                                  color: '#2196f3',
                                },
                              }}
                            />
                            <Tooltip title="Edit">
                              <IconButton
                                edge="end"
                                onClick={() => handleEdit(task)}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.1)' },
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
                                  color: 'error.main',
                                  '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' },
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
                            <Typography variant="body2" color="text.secondary">
                              Target: {format(new Date(task.end || task.targetDate), 'MMM dd, yyyy')} • {task.days || 30} days
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!title || !days}
        >
          {editingTask ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DaysDialog; 