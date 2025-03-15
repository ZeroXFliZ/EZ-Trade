import { useState } from 'react';
import { Button, CircularProgress, Chip, Box } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

/**
 * Wallet connection button with address display
 */
const WalletButton = ({ walletAddress, connectWallet, loading }) => {
  // Format address for display (0x1234...5678)
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // If wallet is connected, show address only
  if (walletAddress) {
    return (
      <Chip
        icon={<AccountBalanceWalletIcon />}
        label={formatAddress(walletAddress)}
        color="primary"
        variant="outlined"
        sx={{
          borderRadius: 2,
          px: 1,
          '& .MuiChip-label': {
            px: 1,
            fontWeight: 500,
          },
        }}
      />
    );
  }
  
  // If wallet is not connected, show connect button
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={connectWallet}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AccountBalanceWalletIcon />}
      sx={{
        borderRadius: 2,
        px: 2,
        py: 1,
        fontWeight: 600,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 16px rgba(58, 134, 255, 0.3)',
        },
      }}
    >
      {loading ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};

export default WalletButton;