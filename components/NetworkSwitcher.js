import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Box, Typography, Alert } from '@mui/material';
import { checkBaseNetwork, switchToBaseNetwork } from '../utils/blockchain';

const NetworkSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [networkInfo, setNetworkInfo] = useState({ isBase: false, chainId: null, name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Check network on component mount
    checkNetwork();
    
    // Listen for chain changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        checkNetwork();
      });
    }
    
    return () => {
      // Clean up listeners
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      }
    };
  }, []);
  
  const checkNetwork = async () => {
    try {
      const networkData = await checkBaseNetwork();
      setNetworkInfo(networkData);
      
      // If not on Base network, show dialog
      if (!networkData.isBase && typeof window !== 'undefined' && window.ethereum) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    } catch (err) {
      console.error('Error checking network:', err);
    }
  };
  
  const handleSwitch = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await switchToBaseNetwork();
      if (result.success) {
        setOpen(false);
      } else {
        setError(result.error || 'Failed to switch network');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="network-dialog-title"
        aria-describedby="network-dialog-description"
      >
        <DialogTitle id="network-dialog-title">
          Wrong Network Detected
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="network-dialog-description">
            This marketplace runs on the Base blockchain. You are currently connected to 
            {networkInfo.name ? ` ${networkInfo.name}` : ' an unsupported network'}.
          </DialogContentText>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Current Chain ID: {networkInfo.chainId || 'Unknown'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleSwitch} 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            Switch to Base Network
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NetworkSwitcher;