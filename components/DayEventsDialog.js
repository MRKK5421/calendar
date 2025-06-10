import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const DayEventsDialog = ({ open, onClose, events, onEdit, onDelete, date }) => {
  const sortedEvents = [...events].sort((a, b) => a.start - b.start);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(255, 255, 255, 0.95)',
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
        Events for {format(date, 'MMMM d, yyyy')}
      </DialogTitle>
      <DialogContent>
        {sortedEvents.length === 0 ? (
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              py: 4,
            }}
          >
            No events scheduled for this day
          </Typography>
        ) : (
          <List>
            {sortedEvents.map((event, index) => (
              <React.Fragment key={event.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    py: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.04)',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {event.title}
                        </Typography>
                        <Chip
                          label={event.type === 'goal' ? 'Goal' : 'Task'}
                          size="small"
                          sx={{
                            backgroundColor: event.type === 'goal' ? '#2196f3' : '#ff9800',
                            color: 'white',
                          }}
                        />
                        {event.completed && (
                          <Chip
                            label="Completed"
                            size="small"
                            sx={{
                              backgroundColor: '#4caf50',
                              color: 'white',
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                        </Typography>
                        {event.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {event.description}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => onEdit(event)}
                      sx={{
                        color: '#2196f3',
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => onDelete(event.id)}
                      sx={{
                        color: '#f44336',
                        ml: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DayEventsDialog; 