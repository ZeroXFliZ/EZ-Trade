import { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, CircularProgress, FormControlLabel, Switch } from '@mui/material';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { buyOrder } from '../utils/blockchain';

export default function BuyItem({ walletAddress, connectWallet, loading }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    twitterLink: '',
    telegramLink: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Validate form
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Item description is required');
      return;
    }

    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // First create the buy order on the blockchain
      const result = await buyOrder(formData.price);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create buy order on blockchain');
      }
      
      // Submit the form data to the API with the itemId from blockchain
      // For buy orders, the creator is the buyer, not the seller
      const response = await fetch('/api/items/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          buyer: walletAddress, // Set buyer to the creator's address
          seller: null, // No seller yet for buy orders
          isBuyOrder: true,
          itemId: result.itemId
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Buy order created successfully!');
        router.push(`/item/${data.item.itemId}`);
      } else {
        toast.error(`Failed to create buy order: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating buy order:', error);
      toast.error(`Error creating buy order: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button variant="outlined" onClick={() => router.push('/')} sx={{ mb: 2 }}>
        Back to Home
      </Button>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Buy Order
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          List what you want to buy on the marketplace for 0.00005 ETH fee
        </Typography>

        {!walletAddress ? (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="body1" paragraph>
              Please connect your wallet to create buy orders
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Connect Wallet'}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Item Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            
            <TextField
              fullWidth
              label="Price (ETH)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              margin="normal"
              inputProps={{ step: '0.00005', min: '0.00005' }}
              required
            />
            
            <TextField
              fullWidth
              label="Official X Link of products"
              name="twitterLink"
              value={formData.twitterLink}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Telegram Link so the seller can contact you"
              name="telegramLink"
              value={formData.telegramLink}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 3 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Create Buy Order'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}