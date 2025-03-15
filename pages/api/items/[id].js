import { getItemById, updateItem, deleteItem } from '../../../utils/mongodb';
import { getTradeDetails, editBuyOrderPrice } from '../../../utils/blockchain';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ success: false, error: 'Item ID is required' });
  }

  if (req.method === 'GET') {
    try {
      // Get item from MongoDB
      const item = await getItemById(id);
      
      if (!item) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }
      
      // Get trade details from blockchain
      const { success, details } = await getTradeDetails(item.itemId);
      
      if (success) {
        // Check if the item is completed on the blockchain
        if (details.isCompleted) {
          // If completed, delete from MongoDB
          await deleteItem(item.itemId);
          return res.status(404).json({ success: false, error: 'Item has been completed and is no longer available' });
        }
        
        // Check if buyer is zero address (no real buyer yet)
        const hasBuyer = details.buyer && details.buyer !== '0x0000000000000000000000000000000000000000';
        
        // Update item with blockchain data
        const updatedItem = {
          ...item,
          seller: details.seller,
          buyer: hasBuyer ? details.buyer : null, // Only set buyer if it's not zero address
          isDelivered: details.isDelivered,
          isCompleted: details.isCompleted
        };
        
        // Update MongoDB with latest blockchain data
        await updateItem(item.itemId, {
          buyer: hasBuyer ? details.buyer : null, // Only set buyer if it's not zero address
          isDelivered: details.isDelivered,
          isCompleted: details.isCompleted
        });
        
        return res.status(200).json({ success: true, item: updatedItem });
      }
      
      return res.status(200).json({ success: true, item });
    } catch (error) {
      console.error('Error fetching item details:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch item details' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { price, buyerTelegramLink, buyer } = req.body;
      
      // Get the item from MongoDB
      const item = await getItemById(id);
      
      if (!item) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }
      
      // Create an updates object to store all updates
      const updates = {};
      
      // Handle price update
      if (price !== undefined) {
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
          return res.status(400).json({ success: false, error: 'Valid price is required' });
        }
        updates.price = price;
      }
      
      // Handle buyer and buyerTelegramLink update
      if (buyerTelegramLink !== undefined) {
        // Validate Telegram link format
        if (!buyerTelegramLink.startsWith('https://t.me/') && 
            !buyerTelegramLink.startsWith('http://t.me/') && 
            !buyerTelegramLink.startsWith('t.me/')) {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid Telegram link format. Must start with https://t.me/, http://t.me/, or t.me/' 
          });
        }
        updates.buyerTelegramLink = buyerTelegramLink;
      }
      
      // Update buyer address if provided
      if (buyer !== undefined) {
        updates.buyer = buyer;
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        // Update item in MongoDB
        await updateItem(id, updates);
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating item:', error);
      return res.status(500).json({ success: false, error: 'Failed to update item' });
    }
  } else if (req.method === 'DELETE') {
    // Handle deleting item
    try {
      await deleteItem(id);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting item:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete item' });
    }
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}