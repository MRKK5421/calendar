import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Checkbox,
  Stack,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, addDays, addWeeks, addMonths, isSameDay, isBefore, isAfter } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import { getTasks, deleteTask } from '../utils/firestore';
import { useAuth } from '../contexts/AuthContext';

const TaskDialog = ({ open, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [recurrenceType, setRecurrenceType] = useState('none');
  const [interval, setInterval] = useState(1);
  const [existingTasks, setExistingTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (open && currentUser) {
      fetchTasks();
    }
  }, [open, currentUser]);

  const fetchTasks = async () => {
    try {
      const tasks = await getTasks(currentUser.uid);
      setExistingTasks(tasks);
      setSelectedTasks([]); // Reset selections when fetching new tasks
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleTaskSelect = (taskId) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === existingTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(existingTasks.map(task => task.id));
    }
  };

  const handleClearSelected = async () => {
    try {
      for (const taskId of selectedTasks) {
        await deleteTask(currentUser.uid, taskId);
      }
      await fetchTasks();
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error clearing selected tasks:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      for (const task of existingTasks) {
        await deleteTask(currentUser.uid, task.id);
      }
      await fetchTasks();
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error clearing all tasks:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(currentUser.uid, taskId);
      await fetchTasks();
      // Remove from selected tasks if it was selected
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      console.error('Missing required fields');
      return;
    }

    try {
      const tasks = [];
      let currentDate = new Date(startDate);
      const finalEndDate = new Date(endDate);

      // Set time to 9 AM for start and 5 PM for end
      currentDate.setHours(9, 0, 0, 0);
      finalEndDate.setHours(17, 0, 0, 0);

      console.log('Creating tasks from', currentDate, 'to', finalEndDate);

      while (isBefore(currentDate, finalEndDate) || isSameDay(currentDate, finalEndDate)) {
        const taskStart = new Date(currentDate);
        const taskEnd = new Date(currentDate);
        taskEnd.setHours(17, 0, 0, 0); // Set end time to 5 PM

        const task = {
          title: title.trim(),
          description: description.trim(),
          start: taskStart,
          end: taskEnd,
          completed: false,
        };

        console.log('Creating task:', task);
        tasks.push(task);

        // Increment date based on recurrence type
        switch (recurrenceType) {
          case 'daily':
            currentDate = addDays(currentDate, interval);
            break;
          case 'weekly':
            currentDate = addWeeks(currentDate, interval);
            break;
          case 'monthly':
            currentDate = addMonths(currentDate, interval);
            break;
          default:
            currentDate = addDays(currentDate, 1);
        }
      }

      console.log('Submitting tasks:', tasks);
      await onAddTask(tasks);
      handleClose();
    } catch (error) {
      console.error('Error creating tasks:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStartDate(new Date());
    setEndDate(new Date());
    setRecurrenceType('none');
    setInterval(1);
    onClose();
  };

  const getRecurrencePreview = () => {
    if (!startDate || !endDate) return [];

    const preview = [];
    let currentDate = new Date(startDate);
    const finalEndDate = new Date(endDate);
    let count = 0;

    while ((isBefore(currentDate, finalEndDate) || isSameDay(currentDate, finalEndDate)) && count < 5) {
      preview.push(new Date(currentDate));
      count++;

      switch (recurrenceType) {
        case 'daily':
          currentDate = addDays(currentDate, interval);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, interval);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, interval);
          break;
        default:
          currentDate = addDays(currentDate, 1);
      }
    }

    return preview;
  };

  const formatDate = (date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2196f3' }}>
          Add New Task
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Task Title"
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
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={setStartDate}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={setEndDate}
                      minDate={startDate}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Recurrence</InputLabel>
                <Select
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  label="Recurrence"
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
              {recurrenceType !== 'none' && (
                <TextField
                  fullWidth
                  type="number"
                  label="Interval"
                  value={interval}
                  onChange={(e) => setInterval(parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                  sx={{ mb: 2 }}
                />
              )}
              {recurrenceType !== 'none' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#2196f3' }}>
                    Preview:
                  </Typography>
                  <List dense>
                    {getRecurrencePreview().map((date, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={formatDate(date)} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%', bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#2196f3' }}>
                  Your Tasks
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={handleSelectAll}
                    sx={{ minWidth: 'auto' }}
                  >
                    {selectedTasks.length === existingTasks.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={handleClearAll}
                    disabled={existingTasks.length === 0}
                    sx={{ minWidth: 'auto' }}
                  >
                    Clear All
                  </Button>
                </Stack>
              </Box>
              <List>
                {existingTasks.map((task, index) => (
                  <React.Fragment key={task.id || index}>
                    <ListItem
                      sx={{
                        bgcolor: task.completed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: task.completed ? 'rgba(76, 175, 80, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                        },
                      }}
                    >
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => handleTaskSelect(task.id)}
                        sx={{ mr: 1 }}
                      />
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(task.start)}
                            </Typography>
                            {task.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {task.description}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <Stack direction="row" spacing={1}>

                        <Tooltip title="Delete Task">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTask(task.id)}
                            sx={{
                              color: 'error.main',
                              '&:hover': {
                                bgcolor: 'rgba(244, 67, 54, 0.1)',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItem>
                    {index < existingTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              {selectedTasks.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleClearSelected}
                    startIcon={<DeleteIcon />}
                  >
                    Clear Selected ({selectedTasks.length})
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976d2 30%, #1cb5e0 90%)',
            },
          }}
        >
          Add Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog; 