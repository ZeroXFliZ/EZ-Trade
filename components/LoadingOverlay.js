import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

/**
 * LoadingOverlay component provides a consistent loading experience
 * across the application with customizable message and overlay options.
 */
const LoadingOverlay = ({ 
  isLoading, 
  message = 'Loading...', 
  fullScreen = false,
  transparent = false,
  children 
}) => {
  if (!isLoading) return children || null;

  const overlayStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    ...(fullScreen ? {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    } : {
      width: '100%',
      height: '100%',
      minHeight: '200px',
    }),
    ...(transparent ? {
      backgroundColor: 'rgba(18, 18, 18, 0.8)',
      backdropFilter: 'blur(4px)',
    } : {})
  };

  const contentStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 2,
    maxWidth: '80%',
    textAlign: 'center',
  };

  return (
    <Box sx={overlayStyles}>
      {!transparent && (
        <Paper elevation={4} sx={contentStyles}>
          <CircularProgress size={48} color="primary" thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 500 }}>
            {message}
          </Typography>
        </Paper>
      )}
      {transparent && (
        <Box sx={contentStyles}>
          <CircularProgress size={60} color="primary" thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'white', fontWeight: 500 }}>
            {message}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LoadingOverlay;