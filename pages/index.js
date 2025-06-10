import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Paper,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getTasks, getGoals } from '../utils/firestore';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FlagIcon from '@mui/icons-material/Flag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';
import PrivateRoute from '../components/PrivateRoute';

const HomePage = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalGoals: 0,
    upcomingDeadlines: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: '',
    items: [],
    type: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    fetchStats();
  }, [currentUser, router]);

  const fetchStats = async () => {
    try {
      const fetchedTasks = await getTasks(currentUser.uid);
      const fetchedGoals = await getGoals(currentUser.uid);
      
      setTasks(fetchedTasks);
      setGoals(fetchedGoals);

      const completedTasks = fetchedTasks.filter(task => task.completed).length;
      const upcomingDeadlines = fetchedGoals.filter(goal => 
        new Date(goal.deadline) > new Date() && 
        new Date(goal.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ).length;

      setStats({
        totalTasks: fetchedTasks.length,
        completedTasks,
        pendingTasks: fetchedTasks.length - completedTasks,
        totalGoals: fetchedGoals.length,
        upcomingDeadlines,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatCardClick = (type) => {
    let title = '';
    let items = [];
    
    switch (type) {
      case 'total':
        title = 'All Tasks';
        items = tasks.map(task => ({
          title: task.title,
          date: task.start,
          completed: task.completed,
          type: 'task'
        }));
        break;
      case 'completed':
        title = 'Completed Tasks';
        items = tasks
          .filter(task => task.completed)
          .map(task => ({
            title: task.title,
            date: task.start,
            completed: true,
            type: 'task'
          }));
        break;
      case 'upcoming':
        title = 'Upcoming Deadlines';
        items = goals
          .filter(goal => 
            new Date(goal.deadline) > new Date() && 
            new Date(goal.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          )
          .map(goal => ({
            title: goal.title,
            date: goal.deadline,
            type: 'goal'
          }));
        break;
    }

    setDialogContent({
      title,
      items,
      type
    });
    setOpenDialog(true);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const searchTerm = query.toLowerCase();
    const results = [
      ...tasks.map(task => ({
        ...task,
        type: 'task',
        searchableText: `${task.title} ${task.description || ''}`.toLowerCase()
      })),
      ...goals.map(goal => ({
        ...goal,
        type: 'goal',
        searchableText: `${goal.title} ${goal.description || ''}`.toLowerCase()
      }))
    ].filter(item => item.searchableText.includes(searchTerm));

    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSearchItemClick = (item) => {
    if (item.type === 'task') {
      router.push(`/calendar?date=${format(new Date(item.start), 'yyyy-MM-dd')}`);
    } else {
      router.push('/goals');
    }
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const StatCard = ({ title, value, icon, color, type }) => (
    <Card
      component={motion.div}
      whileHover={{ scale: 1.02 }}
      onClick={() => handleStatCardClick(type)}
      sx={{
        height: '100%',
        background: `linear-gradient(45deg, ${color} 30%, ${color}90 90%)`,
        color: 'white',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const NavigationCard = ({ title, description, icon, onClick, color }) => (
    <Card
      component={motion.div}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: 'pointer',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.95)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: `${color}15`,
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" color="text.primary">
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ mb: 6 }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Welcome to Task Calendar
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Manage your tasks and goals efficiently with our intuitive calendar interface
        </Typography>

        <Box sx={{ position: 'relative', mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search tasks and goals..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
          {showSearchResults && searchResults.length > 0 && (
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                mt: 1,
                maxHeight: 400,
                overflow: 'auto',
                zIndex: 1000,
                borderRadius: 2,
              }}
            >
              <List>
                {searchResults.map((item, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleSearchItemClick(item)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      {item.type === 'task' ? (
                        <AssignmentIcon color={item.completed ? "success" : "primary"} />
                      ) : (
                        <FlagIcon color="warning" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      secondary={item.type === 'task' 
                        ? format(new Date(item.start), 'MMM dd, yyyy')
                        : format(new Date(item.deadline), 'MMM dd, yyyy')}
                    />
                    {item.type === 'task' && (
                      <Chip
                        label={item.completed ? "Completed" : "Pending"}
                        color={item.completed ? "success" : "primary"}
                        size="small"
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={<AssignmentIcon sx={{ fontSize: 30 }} />}
            color="#2196f3"
            type="total"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Completed Tasks"
            value={stats.completedTasks}
            icon={<CheckCircleIcon sx={{ fontSize: 30 }} />}
            color="#4caf50"
            type="completed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Upcoming Deadlines"
            value={stats.upcomingDeadlines}
            icon={<AccessTimeIcon sx={{ fontSize: 30 }} />}
            color="#ff9800"
            type="upcoming"
          />
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Quick Navigation
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <NavigationCard
            title="Calendar View"
            description="View and manage your tasks and goals in a monthly calendar view"
            icon={<CalendarTodayIcon sx={{ fontSize: 30 }} />}
            onClick={() => router.push('/calendar?view=month')}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <NavigationCard
            title="Goals"
            description="Set and track your goals with deadlines and progress"
            icon={<FlagIcon sx={{ fontSize: 30 }} />}
            onClick={() => router.push('/goals')}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        sx={{ mt: 6, textAlign: 'center' }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push('/calendar?view=month')}
          sx={{
            background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            color: 'white',
            px: 4,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(45deg, #1976d2 30%, #1cb5e0 90%)',
            },
          }}
        >
          Get Started
        </Button>
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
          color: 'white',
        }}>
          {dialogContent.title}
          <IconButton
            onClick={() => setOpenDialog(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <List>
            {dialogContent.items.map((item, index) => (
              <ListItem
                key={index}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon>
                  {item.type === 'task' ? (
                    <AssignmentIcon color={item.completed ? "success" : "primary"} />
                  ) : (
                    <FlagIcon color="warning" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  secondary={format(new Date(item.date), 'MMM dd, yyyy')}
                />
                {item.type === 'task' && (
                  <Chip
                    label={item.completed ? "Completed" : "Pending"}
                    color={item.completed ? "success" : "primary"}
                    size="small"
                  />
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

const HomePageWithAuth = () => (
  <PrivateRoute>
    <HomePage />
  </PrivateRoute>
);

export default HomePageWithAuth; 