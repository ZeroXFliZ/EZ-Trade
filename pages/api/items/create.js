import { createItem } from '../../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, description, price, twitterLink, telegramLink, isBuyOrder, seller, buyer, itemId } = req.body;
      
      // Validate required fields
      if (!name || !description || !price) {
        return res.status(400).json({ success: false, error: 'Name, description, and price are required' });
      }
      
      // Validate seller address is provided for sell orders or buyer address for buy orders
      if (isBuyOrder && !buyer) {
        return res.status(400).json({ success: false, error: 'Buyer wallet address is required for buy orders' });
      } else if (!isBuyOrder && !seller) {
        return res.status(400).json({ success: false, error: 'Seller wallet address is required for sell orders' });
      }
      
      // Validate itemId is provided for sell orders
      if (!isBuyOrder && !itemId) {
        return res.status(400).json({ success: false, error: 'Item ID is required for sell orders' });
      }
      
      // Create item in MongoDB
      const item = {
        itemId: itemId || 0,
        name,
        description,
        price,
        twitterLink: twitterLink || '',
        telegramLink: telegramLink || '',
        createdAt: new Date(),
        seller: isBuyOrder ? null : req.body.seller, // For buy orders, seller is initially null
        buyer: isBuyOrder ? req.body.buyer : null, // For buy orders, set the creator as buyer
        isBuyOrder: isBuyOrder || false // Flag to indicate if this is a buy order
      };
      
      await createItem(item);
      
      return res.status(201).json({ success: true, item });
    } catch (error) {
      console.error('Error creating item:', error);
      return res.status(500).json({ success: false, error: 'Failed to create item' });
    }
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}