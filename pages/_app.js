import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connectWallet, getCurrentAccount, checkBaseNetwork, switchToBaseNetwork } from '../utils/blockchain';
import NetworkSwitcher from '../components/NetworkSwitcher';
import NavBar from '../components/NavBar';
import Head from 'next/head';
// Create a modern theme with enhanced styling
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3a86ff', // Vibrant blue
      light: '#8fb8ff',
      dark: '#0a58ca',
    },
    secondary: {
      main: '#ff006e', // Vibrant pink
      light: '#ff5c8d',
      dark: '#c50054',
    },
    success: {
      main: '#00f5a0', // Bright teal
    },
    error: {
      main: '#ff5252', // Bright red
    },
    warning: {
      main: '#ffbe0b', // Bright yellow
    },
    info: {
      main: '#00b4d8', // Light blue
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
      card: '#252525',
      elevated: '#2d2d2d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
          },
          background: 'linear-gradient(145deg, #2a2a2a, #252525)',
          backgroundImage: 'linear-gradient(145deg, rgba(58, 134, 255, 0.05), rgba(0, 245, 160, 0.03))',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(30, 30, 30, 0.8)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
            },
          },
        },
      },
    },
  },
});

function MyApp({ Component, pageProps }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has already connected wallet
    const checkConnection = async () => {
      try {
        const account = await getCurrentAccount();
        if (account) {
          setWalletAddress(account);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
    
    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress('');
        }
      });
    }
    
    return () => {
      
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          } else {
            setWalletAddress('');
          }
        });
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      const { success, address, error } = await connectWallet();
      if (success) {
        setWalletAddress(address);
        toast.success('Wallet connected successfully!');
        
        // Check if connected to Base network
        const { isBase } = await checkBaseNetwork();
        if (!isBase) {
          toast.warning(
            'You are not connected to Base blockchain. Please use the network switcher to change networks.',
            {
              autoClose: 7000,
              closeButton: true,
            }
          );
        }
      } else {
        toast.error(`Failed to connect wallet: ${error || 'Unknown error'}`);
        console.error('Failed to connect wallet:', error);
      }
    } catch (error) {
      toast.error(`Error connecting wallet: ${error.message || 'Unknown error'}`);
      console.error('Error connecting wallet:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <ThemeProvider theme={darkTheme}>
      <Head>
        <title>EZ Trade</title>
      </Head>
      <CssBaseline />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      <NetworkSwitcher />
      <NavBar 
        walletAddress={walletAddress} 
        connectWallet={handleConnectWallet} 
        loading={loading} 
      />
      <Component 
        {...pageProps} 
        walletAddress={walletAddress} 
        connectWallet={handleConnectWallet} 
        loading={loading} 
      />
    </ThemeProvider>
  );
}

export default MyApp;