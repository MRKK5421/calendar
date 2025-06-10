import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, resetPassword, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push('/calendar');
    }
  }, [currentUser, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      router.push('/calendar');
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.');
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      router.push('/calendar');
    } catch (error) {
      setError('Failed to create an account. Please try again.');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    try {
      setError('');
      await resetPassword(email);
      setError('Password reset email sent. Please check your inbox.');
    } catch (error) {
      setError('Failed to reset password. Please check your email address.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Welcome to Task Calendar
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
            />
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
              >
                Sign In
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleSignUp}
                disabled={loading}
              >
                Create Account
              </Button>
            </Box>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={handleResetPassword}
                disabled={loading}
              >
                Forgot Password?
              </Link>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default LoginPage; 