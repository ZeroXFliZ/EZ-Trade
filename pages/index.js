import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  CircularProgress,
  Chip,
  InputAdornment,
  Avatar,
  Paper,
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SellIcon from "@mui/icons-material/Sell";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import LoadingOverlay from "../components/LoadingOverlay";

export default function Home({ walletAddress, connectWallet, loading }) {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchItems();
  }, []);

  // Fetch items from API
  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/items");
      const data = await response.json();

      if (data.success) {
        setItems(data.items);
      } else {
        toast.error("Failed to fetch items");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Error fetching items");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchItems();
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/items/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.success) {
        setItems(data.items);
      } else {
        toast.error("Search failed");
      }
    } catch (error) {
      console.error("Error searching items:", error);
      toast.error("Error searching items");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press for search
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
    
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 5, 
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(58, 134, 255, 0.05) 0%, rgba(0, 245, 160, 0.05) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              background: 'radial-gradient(circle at top right, rgba(58, 134, 255, 0.1), transparent 70%)',
              zIndex: 0 
            }} 
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(90deg, #3a86ff, #00f5a0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              EZ TRADE P2P Marketplace
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ maxWidth: '800px', mb: 3, lineHeight: 1.6 }}
            >
              Trade digital items securely on the Base blockchain without any trading fees.Read FAQ before intracting with platform.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              {!walletAddress && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  startIcon={<AccountBalanceWalletIcon />}
                  onClick={connectWallet}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    boxShadow: '0 4px 14px rgba(58, 134, 255, 0.4)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(58, 134, 255, 0.6)',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  Connect Wallet to Start
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mb: 4, display: "flex" }}>
          <TextField
            fullWidth
            label="Search items"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  
                </InputAdornment>
              ),
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ ml: 1, px: 3, borderRadius: '12px' }}
          >
            Search
          </Button>
        </Box>

        <LoadingOverlay isLoading={isLoading} message="Loading marketplace items...">
          {items.length > 0 ? (
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.itemId}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  {/* Removed 'SOLD' chip as per requirement */}
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography 
                      gutterBottom 
                      variant="h5" 
                      component="h2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                      sx={{ mb: 2, minHeight: '60px' }}
                    >
                      {item.description}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="primary"
                      sx={{ 
                        fontWeight: 700,
                        mb: 1,
                        display: 'inline-block',
                        background: 'linear-gradient(90deg, #3a86ff, #00b4d8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {item.price} ETH
                    </Typography>
                    
                    <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: 'wrap' }}>
                      
                      <Chip
                        label={item.isBuyOrder ? "Buy Order" : "Sell Order"}
                        color={item.isBuyOrder ? "info" : "success"}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="medium"
                      color="primary"
                      variant="outlined"
                      onClick={() => router.push(`/item/${item.itemId}`)}
                      sx={{ borderRadius: '8px' }}
                    >
                      View Details
                    </Button>
                    {walletAddress &&
                      !item.isBuyOrder &&
                      (!item.buyer ||
                        item.buyer ===
                          "0x0000000000000000000000000000000000000000") &&
                      item.seller.toLowerCase() !==
                        walletAddress.toLowerCase() && (
                        <Button
                          size="medium"
                          color="secondary"
                          variant="contained"
                          onClick={() => router.push(`/item/${item.itemId}`)}
                          sx={{ ml: 1, borderRadius: '8px' }}
                        >
                          Purchase
                        </Button>
                      )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper 
            elevation={0}
            sx={{ 
              mt: 6, 
              p: 6, 
              textAlign: "center",
              borderRadius: 4,
              background: 'rgba(30, 30, 30, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No items found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Be the first to list an item on the marketplace!
            </Typography>
            {walletAddress && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<SellIcon />}
                  onClick={() => router.push("/sell")}
                >
                  Sell an Item
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => router.push("/buy")}
                >
                  Buy an Item
                </Button>
              </Box>
            )}
          </Paper>
        )}
      </LoadingOverlay>
      </Container>
    </>
  );
}
