import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { useRouter } from 'next/router';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SellIcon from '@mui/icons-material/Sell';
import InventoryIcon from '@mui/icons-material/Inventory';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WalletButton from './WalletButton';

const NavBar = ({ walletAddress, connectWallet, loading }) => {
  const router = useRouter();

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            background: 'linear-gradient(90deg, #3a86ff, #00f5a0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          <a sx={{cursor: 'pointer' , }} href='/'>EZ Trade</a>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            variant="text"
            startIcon={<HelpOutlineIcon />}
            onClick={() => router.push('/faq')}
            sx={{ mr: 1 }}
          >
            FAQ
          </Button>
          {walletAddress && (
            <>
              <Button
                color="secondary"
                variant="contained"
                startIcon={<SellIcon />}
                onClick={() => router.push('/sell')}
                sx={{ mr: 1 }}
              >
                Sell
              </Button>
              <Button
                variant="contained"
                startIcon={<ShoppingCartIcon />}
                onClick={() => router.push('/buy')}
                sx={{ mr: 1, bgcolor: '#00FFA3', '&:hover': { bgcolor: '#00DD8D' } }}
              >
                Buy
              </Button>
              <Button
                color="info"
                variant="outlined"
                startIcon={<InventoryIcon />}
                onClick={() => router.push('/my-items')}
                sx={{ mr: 2 }}
              >
                My Items
              </Button>
            </>
          )}
          <WalletButton 
            walletAddress={walletAddress} 
            connectWallet={connectWallet} 
            loading={loading}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;