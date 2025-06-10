import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { Box, Paper, Checkbox } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types/firestore';
import { updateTask } from '../utils/firestore';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

interface CalendarViewProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskUpdate }) => {
  const events = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: new Date(task.date),
    end: new Date(task.date),
    resource: task,
  }));

  const handleTaskToggle = async (task: Task) => {
    const updatedTask = { ...task, completed: !task.completed };
    await updateTask(task.id, { completed: updatedTask.completed });
    onTaskUpdate(updatedTask);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper elevation={3} sx={{ p: 2, borderRadius: 4 }}>
        <Box sx={{ height: 600 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
            defaultView="month"
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.resource.completed ? '#9e9e9e' : '#4caf50',
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
              },
            })}
            components={{
              event: ({ event }) => (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                    <Checkbox
                      checked={event.resource.completed}
                      onChange={() => handleTaskToggle(event.resource)}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                    />
                    <span>{event.title}</span>
                  </Box>
                </motion.div>
              ),
            }}
          />
        </Box>
      </Paper>
    </motion.div>
  );
};

export default CalendarView; 