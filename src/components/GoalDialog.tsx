import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Chip, Stack, Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs, { Dayjs } from 'dayjs';

interface GoalDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (goal: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    assignees: string[];
  }) => void;
  users: { uid: string; displayName: string }[];
}

const GoalDialog: React.FC<GoalDialogProps> = ({ open, onClose, onCreate, users }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [duration, setDuration] = useState(7); // default 7 days
  const [assignees, setAssignees] = useState<string[]>([]);

  const handleCreate = () => {
    if (!title || !startDate || duration < 1) return;
    const endDate = startDate.add(duration - 1, 'day');
    onCreate({
      title,
      description,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      assignees,
    });
    setTitle('');
    setDescription('');
    setStartDate(dayjs());
    setDuration(7);
    setAssignees([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogContent>
              <Stack spacing={2} mt={1}>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                  <TextField label="Goal Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth required autoFocus />
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth multiline minRows={2} />
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                  <DatePicker label="Start Date" value={startDate} onChange={setStartDate} format="YYYY-MM-DD" />
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                  <TextField
                    label="Duration (days)"
                    type="number"
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    inputProps={{ min: 1, max: 365 }}
                    fullWidth
                  />
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                  <Box>
                    <Typography variant="subtitle2" mb={0.5}>Assign to:</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {users.map(u => (
                        <Chip
                          key={u.uid}
                          label={u.displayName}
                          color={assignees.includes(u.uid) ? 'primary' : 'default'}
                          onClick={() => setAssignees(a => a.includes(u.uid) ? a.filter(id => id !== u.uid) : [...a, u.uid])}
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </motion.div>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button onClick={handleCreate} variant="contained" disabled={!title || !startDate || duration < 1}>Create</Button>
            </DialogActions>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default GoalDialog; 