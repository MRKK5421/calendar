import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import isSameDay from 'date-fns/isSameDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Box, Checkbox, Typography, Tooltip, IconButton, Menu, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, useTheme, useMediaQuery, Stack } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { motion } from 'framer-motion';
import DayEventsDialog from './DayEventsDialog';
import { useRouter } from 'next/router';
import CloseIcon from '@mui/icons-material/Close';
import { updateTask } from '../utils/firestore';
import { useAuth } from '../contexts/AuthContext';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarView = ({ tasks, goals, onTaskToggle, onEditGoal, onDeleteGoal, currentDate, view = 'month' }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const { currentUser } = useAuth();

  const handleViewChange = (newView) => {
    router.push({
      pathname: '/calendar',
      query: { view: newView },
    });
  };

  const handleNavigate = (date) => {
    setSelectedDate(date);
    // Update URL with new date
    router.push({
      pathname: '/calendar',
      query: { 
        view,
        date: format(date, 'yyyy-MM-dd')
      },
    }, undefined, { shallow: true });
  };

  const handleMenuOpen = (event, calendarEvent) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedEvent(calendarEvent);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleEdit = () => {
    if (selectedEvent) {
      onEditGoal(selectedEvent);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedEvent) {
      onDeleteGoal(selectedEvent.id);
    }
    handleMenuClose();
  };

  const processDate = (date) => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date === 'string') return new Date(date);
    if (date.toDate) return date.toDate();
    return null;
  };

  // Create a Set to track unique task IDs
  const processedTaskIds = new Set();

  const events = [
    ...tasks.filter(task => {
      // Only include tasks that haven't been processed yet
      if (processedTaskIds.has(task.id)) return false;
      processedTaskIds.add(task.id);
      return true;
    }).map(task => ({
      id: task.id,
      title: task.title,
      start: processDate(task.start),
      end: processDate(task.end),
      completed: task.completed,
      type: 'task'
    })),
    ...goals.map(goal => {
      const startDate = processDate(goal.deadline);
      if (!startDate) return null;
      
      // Create a one-hour duration for the goal
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);
      
      return {
        id: goal.id,
        title: goal.title,
        start: startDate,
        end: endDate,
        completed: goal.completed,
        type: 'goal',
        description: goal.description
      };
    })
  ].filter(event => event && event.start && event.end);

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setDayDialogOpen(true);
  };

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: 'transparent',
      borderRadius: '50%',
      opacity: 1,
      color: 'transparent',
      border: '0px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      margin: '0 auto',
      position: 'relative',
    };

    return {
      style
    };
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

  const handleSelectAllTasks = () => {
    const taskIds = tasks.map(task => task.id);
    setSelectedTasks(new Set(taskIds));
  };

  const handleClearTaskSelection = () => {
    setSelectedTasks(new Set());
  };

  const handleDeleteSelected = () => {
    selectedTasks.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        onDeleteGoal(taskId);
      }
    });
    setSelectedTasks(new Set());
  };

  const handleTaskToggle = async (taskId, currentStatus) => {
    try {
      await updateTask(currentUser.uid, taskId, { completed: !currentStatus });
      if (onTaskToggle) {
        onTaskToggle(taskId, !currentStatus);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const CustomEvent = ({ event }) => {
    return (
      <Tooltip 
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'white', mb: 0.5 }}>
              {event.title}
            </Typography>
            {event.description && (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {event.description}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mt: 0.5 }}>
              {event.type === 'goal' ? 'Goal' : event.type === 'countdown' ? 'Countdown' : 'Task'}
            </Typography>
          </Box>
        }
        arrow
        placement="top"
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {event.type === 'task' && (
            <Checkbox
              checked={event.completed}
              onChange={(e) => {
                e.stopPropagation();
                handleTaskToggle(event.id, event.completed);
              }}
              size="small"
              sx={{
                color: 'white',
                '&.Mui-checked': {
                  color: 'white',
                },
              }}
            />
          )}
        </Box>
      </Tooltip>
    );
  };

  const CustomToolbar = (toolbar) => {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? 2 : 0,
        mb: 2,
        '& .rbc-btn-group': {
          display: 'flex',
          gap: 1,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        },
        '& .rbc-btn': {
          color: '#2196f3',
          border: '1px solid #2196f3',
          backgroundColor: 'transparent',
          padding: isMobile ? '4px 8px' : '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          fontSize: isMobile ? '0.875rem' : '1rem',
          '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
          },
          '&.rbc-active': {
            backgroundColor: '#2196f3',
            color: 'white',
          },
        },
      }}>
        <Stack 
          direction={isMobile ? 'column' : 'row'} 
          spacing={1} 
          sx={{ 
            width: isMobile ? '100%' : 'auto',
            '& > button': {
              width: isMobile ? '100%' : 'auto',
            }
          }}
        >
          <Button
            onClick={() => toolbar.onNavigate('PREV')}
            sx={{
              color: '#2196f3',
              border: '1px solid #2196f3',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
              },
            }}
          >
            Back
          </Button>
          <Button
            onClick={() => toolbar.onNavigate('TODAY')}
            sx={{
              color: '#2196f3',
              border: '1px solid #2196f3',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
              },
            }}
          >
            Today
          </Button>
          <Button
            onClick={() => toolbar.onNavigate('NEXT')}
            sx={{
              color: '#2196f3',
              border: '1px solid #2196f3',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
              },
            }}
          >
            Next
          </Button>
        </Stack>
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          sx={{ 
            fontWeight: 600,
            textAlign: isMobile ? 'center' : 'left',
            mt: isMobile ? 1 : 0
          }}
        >
          {toolbar.label}
        </Typography>
        <Stack 
          direction={isMobile ? 'column' : 'row'} 
          spacing={1}
          sx={{ 
            width: isMobile ? '100%' : 'auto',
            '& > button': {
              width: isMobile ? '100%' : 'auto',
            }
          }}
        >
          <Button
            onClick={() => toolbar.onView('month')}
            sx={{
              color: view === 'month' ? 'white' : '#2196f3',
              border: '1px solid #2196f3',
              backgroundColor: view === 'month' ? '#2196f3' : 'transparent',
              '&:hover': {
                backgroundColor: view === 'month' ? '#1976d2' : 'rgba(33, 150, 243, 0.1)',
              },
            }}
          >
            Month
          </Button>
          <Button
            onClick={() => toolbar.onView('week')}
            sx={{
              color: view === 'week' ? 'white' : '#2196f3',
              border: '1px solid #2196f3',
              backgroundColor: view === 'week' ? '#2196f3' : 'transparent',
              '&:hover': {
                backgroundColor: view === 'week' ? '#1976d2' : 'rgba(33, 150, 243, 0.1)',
              },
            }}
          >
            Week
          </Button>
          <Button
            onClick={() => toolbar.onView('day')}
            sx={{
              color: view === 'day' ? 'white' : '#2196f3',
              border: '1px solid #2196f3',
              backgroundColor: view === 'day' ? '#2196f3' : 'transparent',
              '&:hover': {
                backgroundColor: view === 'day' ? '#1976d2' : 'rgba(33, 150, 243, 0.1)',
              },
            }}
          >
            Day
          </Button>
          <Button
            onClick={() => toolbar.onView('agenda')}
            sx={{
              color: view === 'agenda' ? 'white' : '#2196f3',
              border: '1px solid #2196f3',
              backgroundColor: view === 'agenda' ? '#2196f3' : 'transparent',
              '&:hover': {
                backgroundColor: view === 'agenda' ? '#1976d2' : 'rgba(33, 150, 243, 0.1)',
              },
            }}
          >
            Agenda
          </Button>
        </Stack>
      </Box>
    );
  };

  // Add this new function to check if a date has any events
  const hasEventsOnDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.some(event => 
      format(event.start, 'yyyy-MM-dd') === dateStr
    );
  };

  // Add this new function to get the event type for a date
  const getEventTypeForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dateEvents = events.filter(event => 
      format(event.start, 'yyyy-MM-dd') === dateStr
    );
    
    if (dateEvents.some(event => event.type === 'goal')) return 'goal';
    if (dateEvents.some(event => event.type === 'countdown')) return 'countdown';
    if (dateEvents.some(event => event.type === 'task')) return 'task';
    return null;
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        height: isMobile ? 'calc(100vh - 100px)' : 'calc(100vh - 200px)',
        '& .rbc-calendar': {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          padding: isMobile ? 1 : 2,
        },
        '& .rbc-header': {
          padding: isMobile ? '8px 2px' : '10px 3px',
          fontWeight: 600,
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fontSize: isMobile ? '0.875rem' : '1rem',
        },
        '& .rbc-toolbar': {
          marginBottom: isMobile ? 1 : 2,
        },
        '& .rbc-event': {
          backgroundColor: 'transparent',
          border: 'none',
          padding: isMobile ? '1px 3px' : '2px 5px',
          minHeight: isMobile ? '24px' : '32px',
        },
        '& .rbc-today': {
          backgroundColor: 'rgba(33, 150, 243, 0.05)',
        },
        '& .rbc-day-bg': {
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
          },
        },
        '& .rbc-show-more': {
          display: 'none',
        },
        '& .rbc-event-content': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        },
        '& .rbc-day-slot .rbc-event': {
          border: 'none',
          padding: 0,
          margin: '0 auto',
        },
        '& .rbc-month-view .rbc-day-bg': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
          },
        },
        '& .rbc-month-view .rbc-day-bg[data-has-events="goal"]::before': {
          backgroundColor: 'rgba(33, 150, 243, 0.15)',
        },
        '& .rbc-month-view .rbc-day-bg[data-has-events="task"]::before': {
          backgroundColor: 'rgba(255, 152, 0, 0.15)',
        },
        '& .rbc-month-view .rbc-day-bg[data-has-events="countdown"]::before': {
          backgroundColor: 'rgba(156, 39, 176, 0.15)',
        },
        '& .rbc-time-view': {
          fontSize: isMobile ? '0.875rem' : '1rem',
        },
        '& .rbc-time-header-content': {
          fontSize: isMobile ? '0.875rem' : '1rem',
        },
        '& .rbc-time-slot': {
          fontSize: isMobile ? '0.75rem' : '0.875rem',
        },
      }}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        components={{
          event: CustomEvent,
          toolbar: CustomToolbar,
          month: {
            dateHeader: ({ date, ...props }) => {
              const eventType = getEventTypeForDate(date);
              return (
                <Box
                  {...props}
                  sx={{
                    padding: isMobile ? '2px' : '4px',
                    textAlign: 'center',
                    backgroundColor: eventType === 'goal' ? 'rgba(33, 150, 243, 0.15)' :
                                   eventType === 'task' ? 'rgba(255, 152, 0, 0.15)' :
                                   eventType === 'countdown' ? 'rgba(156, 39, 176, 0.15)' :
                                   'transparent',
                    borderRadius: '4px',
                    fontWeight: hasEventsOnDate(date) ? 'bold' : 'normal',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                  }}
                >
                  {format(date, 'd')}
                </Box>
              );
            },
          },
        }}
        views={['month', 'week', 'day', 'agenda']}
        defaultView={view}
        view={view}
        onView={handleViewChange}
        onNavigate={handleNavigate}
        step={60}
        timeslots={1}
        min={new Date(0, 0, 0, 8, 0, 0)}
        max={new Date(0, 0, 0, 20, 0, 0)}
        onSelectEvent={(event) => {
          if (event.type === 'goal') {
            onEditGoal(event);
          } else if (event.type === 'task') {
            handleTaskSelect(event.id);
          }
        }}
        onSelectSlot={({ start }) => handleDayClick(start)}
        selectable
        date={selectedDate}
      />
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            '& .MuiMenuItem-root': {
              padding: '12px 16px',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.08)',
              },
            },
          },
        }}
      >
        <MenuItem 
          onClick={handleEdit} 
          sx={{ 
            color: '#2196f3',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.08)',
            },
          }}
        >
          Edit
        </MenuItem>
        <MenuItem 
          onClick={handleDelete} 
          sx={{ 
            color: '#f44336',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.08)',
            },
          }}
        >
          Delete
        </MenuItem>
      </Menu>
      <Dialog
        open={dayDialogOpen}
        onClose={() => setDayDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            '& .MuiDialogTitle-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: 'text.primary',
            },
            '& .MuiDialogContent-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: 'text.primary',
            },
            '& .MuiDialogActions-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: 'text.primary',
            },
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
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {format(selectedDate, 'MMMM d, yyyy')}
          </Typography>
          <IconButton onClick={() => setDayDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <List>
            {events
              .filter(event => format(event.start, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
              .map((event) => (
                <ListItem
                  key={event.id}
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                  secondaryAction={
                    <Box>
                      {event.type === 'task' && (
                        <Checkbox
                          checked={event.completed}
                          onChange={() => handleTaskToggle(event.id, event.completed)}
                          sx={{
                            color: 'primary.main',
                            '&.Mui-checked': {
                              color: 'primary.main',
                            },
                          }}
                        />
                      )}
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>
                        {event.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {event.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {event.type === 'goal' ? 'Goal' : event.type === 'countdown' ? 'Countdown' : 'Task'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
          </List>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Button 
            onClick={() => setDayDialogOpen(false)} 
            sx={{ 
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarView; 