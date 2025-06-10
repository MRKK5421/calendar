import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => (
  <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
    <AppBar position="static" color="primary" elevation={3}>
      <Toolbar>
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
          Task Calendar
        </Typography>
        <Box>
          {/* Navigation links will go here */}
        </Box>
      </Toolbar>
    </AppBar>
  </motion.div>
);

export default Navbar; 