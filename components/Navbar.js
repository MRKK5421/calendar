import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  CalendarToday,
  Flag,
  Settings,
  Logout,
  AccountCircle,
  Assignment,
  Home,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const menuItems = [
  { text: 'Home', icon: <Home />, path: '/' },
  { text: 'Calendar', icon: <CalendarToday />, path: '/calendar' },
  { text: 'All Tasks', icon: <Assignment />, path: '/all-tasks' },
  { text: 'Goals', icon: <Flag />, path: '/goals' },
];

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const router = useRouter();
  const { logout, currentUser } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleNavigation = (path) => {
    router.push(path);
    setDrawerOpen(false);
  };

  const drawer = (
    <List sx={{ width: 250 }}>
      {menuItems.map((item) => (
        <ListItem
          button
          key={item.text}
          onClick={() => handleNavigation(item.path)}
          selected={router.pathname === item.path}
          sx={{
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'rgba(144, 202, 249, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(144, 202, 249, 0.15)',
              },
            },
          }}
        >
          <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
      <ListItem
        button
        onClick={handleLogout}
        sx={{
          borderRadius: 2,
          mx: 1,
          my: 0.5,
          color: 'error.main',
        }}
      >
        <ListItemIcon sx={{ color: 'error.main' }}>
          <Logout />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
    </List>
  );

  return (
    <>
      <AppBar 
        position="static" 
        sx={{ 
          background: 'transparent', 
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setDrawerOpen(true)}
                sx={{ 
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{ 
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Task Calendar
              </Typography>
            </motion.div>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    color: router.pathname === item.path ? 'primary.main' : 'text.primary',
                    backgroundColor: router.pathname === item.path ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.12)',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
              <IconButton
                onClick={handleMenu}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {currentUser?.photoURL ? (
                  <Avatar
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    '& .MuiMenuItem-root': {
                      padding: '12px 16px',
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.08)',
                      },
                    },
                  },
                }}
              >
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout />
                  </ListItemIcon>
                  <Typography color="error">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            width: isMobile ? '100%' : 280,
            '& .MuiListItem-root': {
              padding: '12px 24px',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.08)',
              },
            },
            '& .MuiListItemIcon-root': {
              minWidth: 40,
              color: 'text.primary',
            },
            '& .MuiListItemText-primary': {
              color: 'text.primary',
              fontWeight: 500,
            },
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                backgroundColor: router.pathname === item.path ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.12)',
                },
              }}
            >
              <ListItemIcon sx={{ color: router.pathname === item.path ? 'primary.main' : 'text.primary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{
                  '& .MuiTypography-root': {
                    color: router.pathname === item.path ? 'primary.main' : 'text.primary',
                    fontWeight: router.pathname === item.path ? 600 : 500,
                  },
                }}
              />
            </ListItem>
          ))}
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'error.main' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              sx={{
                '& .MuiTypography-root': {
                  color: 'error.main',
                  fontWeight: 500,
                },
              }}
            />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar; 