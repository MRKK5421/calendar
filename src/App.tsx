import React, { useEffect, useState } from 'react';
import { auth, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Button, Box, Typography, Avatar, Container, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CalendarPage from './pages/CalendarPage';
import ParallaxBackground from './components/ParallaxBackground';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    await signInWithPopup(auth, provider);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (loading) return <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"><Typography>Loading...</Typography></Box>;

  if (!user) {
  return (
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={6} sx={{ p: 4, width: '100%', textAlign: 'center', borderRadius: 4 }}>
          <Typography variant="h4" fontWeight={700} mb={2}>
            Task Calendar
          </Typography>
          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleSignIn}
            sx={{ fontWeight: 600, fontSize: 18, py: 1.5, px: 4, borderRadius: 3, boxShadow: 2 }}
          >
            Sign in with Google
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Router>
      <ParallaxBackground />
      <Navbar />
      <Box sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<CalendarPage />} />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;
