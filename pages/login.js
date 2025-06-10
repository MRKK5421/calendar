import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import GoogleIcon from '@mui/icons-material/Google';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { currentUser, login, signup, resetPassword, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      router.push('/');
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      router.push('/');
    } catch (error) {
      setError('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      router.push('/');
    } catch (error) {
      setError('Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setError('');
      setLoading(true);
      await resetPassword(email);
      setError('Password reset email sent! Check your inbox.');
    } catch (error) {
      setError('Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4a90e2 0%, #87ceeb 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
          animation: 'pulse 8s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '24px',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Typography
                component="h1"
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #2c3e50 30%, #3498db 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  mb: 4,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                Welcome to Task Calendar
              </Typography>
            </motion.div>

            {error && (
              <Alert
                severity="error"
                sx={{
                  width: '100%',
                  mb: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#2c3e50',
                }}
              >
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{
                mb: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: '#2c3e50',
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Sign in with Google
            </Button>

            <Divider
              sx={{
                width: '100%',
                mb: 3,
                color: '#2c3e50',
                '&::before, &::after': {
                  borderColor: 'rgba(44, 62, 80, 0.2)',
                },
              }}
            >
              or
            </Divider>

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: '#2c3e50',
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: 'rgba(44, 62, 80, 0.2)',
                      transition: 'all 0.3s ease',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(44, 62, 80, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3498db',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#2c3e50',
                    '&.Mui-focused': {
                      color: '#3498db',
                    },
                  },
                  '& .MuiInputBase-input': {
                    '&::placeholder': {
                      color: '#2c3e50',
                      opacity: 0.7,
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: '#2c3e50',
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: 'rgba(44, 62, 80, 0.2)',
                      transition: 'all 0.3s ease',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(44, 62, 80, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3498db',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#2c3e50',
                    '&.Mui-focused': {
                      color: '#3498db',
                    },
                  },
                  '& .MuiInputBase-input': {
                    '&::placeholder': {
                      color: '#2c3e50',
                      opacity: 0.7,
                    },
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: '#3498db',
                  color: '#fff',
                  py: 1.5,
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: '#2980b9',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleSignUp}
                disabled={loading}
                sx={{
                  mb: 2,
                  borderColor: '#3498db',
                  color: '#3498db',
                  borderRadius: '12px',
                  '&:hover': {
                    borderColor: '#2980b9',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Create Account
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={handleResetPassword}
                disabled={loading}
                sx={{
                  color: '#2c3e50',
                  '&:hover': {
                    color: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Forgot Password?
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage; 