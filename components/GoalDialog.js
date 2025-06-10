import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Paper,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const GoalDialog = ({ open, onClose, onAddGoal, onDeleteGoal, goal = null, goals = [] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [error, setError] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setDeadline(goal.deadline ? new Date(goal.deadline) : new Date());
    } else {
      setTitle('');
      setDescription('');
      setDeadline(new Date());
    }
  }, [goal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!deadline) {
      setError('Deadline is required');
      return;
    }

    const goalData = {
      title: title.trim(),
      description: description.trim(),
      deadline: deadline,
      completed: goal?.completed || false,
    };

    if (goal?.id) {
      onAddGoal({ ...goalData, id: goal.id });
    } else {
      onAddGoal(goalData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (goal?.id) {
      onDeleteGoal(goal.id);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 600,
        }}
      >
        {goal ? 'Edit Goal' : 'Add New Goal'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
              error={!!error && !title.trim()}
              helperText={!title.trim() && error}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(33, 150, 243, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(33, 150, 243, 0.5)',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(33, 150, 243, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(33, 150, 243, 0.5)',
                  },
                },
              }}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Deadline"
                value={deadline}
                onChange={(newValue) => setDeadline(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    required
                    error={!!error && !deadline}
                    helperText={!deadline && error}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(33, 150, 243, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(33, 150, 243, 0.5)',
                        },
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Box>
          <Box sx={{ width: 300 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: 'rgba(33, 150, 243, 0.05)',
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: '#2196f3' }}>
                Existing Goals
              </Typography>
              <List>
                {goals.map((existingGoal) => (
                  <React.Fragment key={existingGoal.id}>
                    <ListItem
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={existingGoal.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {existingGoal.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Deadline: {format(new Date(existingGoal.deadline), 'MMM d, yyyy h:mm a')}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        {goal && (
          <Button
            onClick={handleDelete}
            color="error"
            startIcon={<DeleteIcon />}
            sx={{
              mr: 'auto',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
              },
            }}
          >
            Delete
          </Button>
        )}
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
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
          {goal ? 'Save Changes' : 'Add Goal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalDialog; 