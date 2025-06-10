import React from 'react';
import { Box } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxBackground: React.FC = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        y,
      }}
    />
  );
};

export default ParallaxBackground; 