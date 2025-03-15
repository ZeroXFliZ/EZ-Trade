import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Chip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { toast } from "react-toastify";
import {
  purchaseItem,
  confirmDelivery,
  claimPayment,
  getTradeDetails,
  editItemPrice,
} from "../../utils/blockchain";
import WalletButton from "../../components/WalletButton";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function ItemDetail({ walletAddress, connectWallet, loading }) {
  const router = useRouter();
  const { id } = router.query;

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tradeDetails, setTradeDetails] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [isTelegramDialogOpen, setIsTelegramDialogOpen] = useState(false);
  const [buyerTelegramLink, setBuyerTelegramLink] = useState("");
  const [buyerTelegramError, setBuyerTelegramError] = useState("");

  // Fetch item details when component mounts or id changes
  useEffect(() => {
    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  // Fetch item details from API
  const fetchItemDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/items/${id}`);
      const data = await response.json();

      if (data.success) {
        setItem(data.item);

        // Get trade details from blockchain
        const { success, details } = await getTradeDetails(data.item.itemId);
        if (success) {
          setTradeDetails(details);
        }
      } else {
        toast.error("Failed to fetch item details");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
      toast.error("Error fetching item details");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening the Telegram dialog before purchase
  const handleOpenTelegramDialog = () => {
    setBuyerTelegramLink("");
    setBuyerTelegramError("");
    setIsTelegramDialogOpen(true);
  };

  // Handle closing the Telegram dialog
  const handleCloseTelegramDialog = () => {
    setIsTelegramDialogOpen(false);
  };

  // Validate Telegram link
  const validateTelegramLink = (link) => {
    if (!link || link.trim() === "") {
      return "Telegram link is required";
    }
    if (
      !link.startsWith("https://t.me/") &&
      !link.startsWith("http://t.me/") &&
      !link.startsWith("t.me/")
    ) {
      return "Please enter a valid Telegram link (e.g., https://t.me/username)";
    }
    return "";
  };

  // Handle purchase item
  const handlePurchase = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Open Telegram dialog instead of directly purchasing
    handleOpenTelegramDialog();
  };

  // Handle the actual purchase after Telegram link is provided
  const handlePurchaseWithTelegram = async () => {
    // Validate Telegram link
    const error = validateTelegramLink(buyerTelegramLink);
    if (error) {
      setBuyerTelegramError(error);
      return;
    }

    try {
      setProcessingAction(true);
      setIsTelegramDialogOpen(false);
      setProcessingMessage("Processing your purchase...");
      const { success, error } = await purchaseItem(item.itemId, item.price);

      if (success) {
        // Update the buyer's Telegram link in the database
        const response = await fetch(`/api/items/${item.itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            buyerTelegramLink: buyerTelegramLink,
            buyer: walletAddress,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Item purchased successfully!");
          setProcessingMessage("Item is now processing");
          fetchItemDetails(); // Refresh data
        } else {
          toast.error(`Failed to update buyer information: ${data.error}`);
        }
      } else {
        toast.error(`Failed to purchase item: ${error}`);
        setProcessingMessage("");
      }
    } catch (error) {
      console.error("Error purchasing item:", error);
      toast.error("Error purchasing item");
      setProcessingMessage("");
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle confirm delivery
  const handleConfirmDelivery = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setProcessingAction(true);
      const { success, error } = await confirmDelivery(item.itemId);

      if (success) {
        toast.success("Delivery confirmed successfully!");
        fetchItemDetails(); // Refresh data
      } else {
        toast.error(`Failed to confirm delivery: ${error}`);
      }
    } catch (error) {
      console.error("Error confirming delivery:", error);
      toast.error("Error confirming delivery");
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle claim payment
  const handleClaimPayment = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setProcessingAction(true);
      const { success, error } = await claimPayment(item.itemId);

      if (success) {
        toast.success("Payment claimed successfully!");
        fetchItemDetails(); // Refresh data
      } else {
        toast.error(`Failed to claim payment: ${error}`);
      }
    } catch (error) {
      console.error("Error claiming payment:", error);
      toast.error("Error claiming payment");
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle opening the price update dialog
  const handleOpenPriceDialog = () => {
    setNewPrice(item.price); // Set current price as default
    setIsPriceDialogOpen(true);
  };

  // Handle closing the price update dialog
  const handleClosePriceDialog = () => {
    setIsPriceDialogOpen(false);
  };

  // Handle updating the item price
  const handleUpdatePrice = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      setProcessingAction(true);
      const { success, error } = await editItemPrice(item.itemId, newPrice);

      if (success) {
        // Update price in database
        const response = await fetch(`/api/items/${item.itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            price: newPrice,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Price updated successfully!");
          setIsPriceDialogOpen(false);
          fetchItemDetails(); // Refresh data
        } else {
          toast.error(`Failed to update price in database: ${data.error}`);
        }
      } else {
        toast.error(`Failed to update price on blockchain: ${error}`);
      }
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Error updating price");
    } finally {
      setProcessingAction(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <LoadingOverlay
          isLoading={true}
          message="Loading item details..."
          fullScreen={false}
        >
          <Box sx={{ height: "300px" }} />
        </LoadingOverlay>
      </Container>
    );
  }

  if (!item) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Item not found
        </Typography>
        <Button variant="contained" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </Container>
    );
  }

  const isSeller =
    walletAddress &&
    tradeDetails &&
    ((!item.isBuyOrder &&
      walletAddress.toLowerCase() === tradeDetails.seller.toLowerCase()) ||
      (item.isBuyOrder &&
        tradeDetails.seller !== "0x0000000000000000000000000000000000000000" &&
        walletAddress.toLowerCase() === tradeDetails.seller.toLowerCase()));

  const isBuyer =
    walletAddress &&
    tradeDetails &&
    ((item.isBuyOrder &&
      walletAddress.toLowerCase() === item.buyer?.toLowerCase()) ||
      (!item.isBuyOrder &&
        tradeDetails.buyer !== "0x0000000000000000000000000000000000000000" &&
        walletAddress.toLowerCase() === tradeDetails.buyer.toLowerCase()));

  // Only allow purchase for sell orders, not for buy orders
  const canPurchase =
    walletAddress &&
    tradeDetails &&
    !item.isBuyOrder && // Only for sell orders
    (tradeDetails.buyer === "0x0000000000000000000000000000000000000000" ||
      !tradeDetails.buyer) &&
    !isSeller;

  // Define canConfirmDelivery and canClaimPayment once
  // For buy orders, the creator (buyer) should not see confirm delivery button
  const canConfirmDelivery =
    isBuyer && !tradeDetails.isDelivered && !item.isBuyOrder;
  const canClaimPayment =
    isSeller && tradeDetails.isDelivered && !tradeDetails.isCompleted;

  // For buy orders, only the creator (buyer) can update the price
  const canUpdatePrice = item.isBuyOrder
    ? walletAddress &&
      item.buyer &&
      walletAddress.toLowerCase() === item.buyer.toLowerCase()
    : isSeller &&
      (!tradeDetails.buyer ||
        tradeDetails.buyer === "0x0000000000000000000000000000000000000000");

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Button variant="outlined" onClick={() => router.push("/")}>
          Back to Home
        </Button>
        <WalletButton
          walletAddress={walletAddress}
          connectWallet={connectWallet}
          loading={loading}
        />
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        {processingMessage && (
          <Box
            sx={{
              mb: 2,
              p: 1,
              bgcolor: "warning.light",
              borderRadius: 1,
              textAlign: "center",
            }}
          >
            <Typography variant="body1" color="warning.contrastText">
              {processingMessage}
            </Typography>
          </Box>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              {item.name}
            </Typography>

            <Typography variant="h5" color="primary" gutterBottom>
              {item.price} ETH
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                <strong>{item.isBuyOrder ? "Buyer" : "Seller"}:</strong>{" "}
                {item.isBuyOrder
                  ? item.buyer
                    ? `${item.buyer.substring(0, 6)}...${item.buyer.substring(
                        item.buyer.length - 4
                      )}`
                    : "Unknown"
                  : tradeDetails?.seller
                  ? `${tradeDetails.seller.substring(
                      0,
                      6
                    )}...${tradeDetails.seller.substring(
                      tradeDetails.seller.length - 4
                    )}`
                  : "Unknown"}
              </Typography>

              {/* For sell orders: show Buyer if there's a valid buyer address */}
              {!item.isBuyOrder &&
                tradeDetails?.buyer &&
                tradeDetails.buyer !==
                  "0x0000000000000000000000000000000000000000" && (
                  <Typography variant="subtitle1" color="text.secondary">
                    <strong>Buyer:</strong>{" "}
                    {`${tradeDetails.buyer.substring(
                      0,
                      6
                    )}...${tradeDetails.buyer.substring(
                      tradeDetails.buyer.length - 4
                    )}`}
                  </Typography>
                )}

              {/* For buy orders: DON'T show Seller - buy orders are not tradable */}
            </Box>

            <Box sx={{ mb: 2 }}>
              

              {/* Show Processing status when there's a buyer but delivery isn't confirmed yet */}
              {!item.isBuyOrder &&
                tradeDetails?.buyer &&
                tradeDetails.buyer !==
                  "0x0000000000000000000000000000000000000000" &&
                !tradeDetails.isDelivered && (
                  <Chip label="Processing" color="warning" sx={{ ml: 1 }} />
                )}

              {!item.isBuyOrder && tradeDetails?.isDelivered && (
                <Chip label="Delivered" color="success" sx={{ ml: 1 }} />
              )}

              {!item.isBuyOrder && tradeDetails?.isCompleted && (
                <Chip label="Completed" color="info" sx={{ ml: 1 }} />
              )}
              {item.isBuyOrder ? (
                <>
                  <Chip label="Buy Order" color="info" />
                  <h4>
                    Buy order are not tradeable.If you want to sell this item,first deal with buyer at their
                    telegram,then create your sell order and let the buyer
                    purchase your item.
                  </h4>
                </>
              ) : (
                
                !processingAction &&
                (!tradeDetails?.buyer ||
                  tradeDetails.buyer ===
                    "0x0000000000000000000000000000000000000000") && (
                  <Chip label="For Sale" color="primary" />
                )
              )}

              {/* Order type indicator - only for sell orders */}
              {!item.isBuyOrder && (
                <>
                  <Chip label="Sell Order" color="success" sx={{ ml: 1 }} />
                  <h4>
                    For buyer,first deal with seller at their telegram before you deposit
                    $ETH.
                  </h4>
                </>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {item.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {(item.twitterLink || item.telegramLink) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Contact Information
                    </Typography>

                    {item.twitterLink && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Product's X Link:{" "}
                        <a
                          href={item.twitterLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#00FFA3", textDecoration: "none" }}
                        >
                          {item.twitterLink}
                        </a>
                      </Typography>
                    )}

                    {item.telegramLink && (
                      <Typography variant="body2">
                        {item.isBuyOrder
                          ? "Buyer Telegram:"
                          : "Seller Telegram:"}{" "}
                        <a
                          href={item.telegramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#00FFA3", textDecoration: "none" }}
                        >
                          {item.telegramLink}
                        </a>
                      </Typography>
                    )}

                    {/* Show buyer's Telegram link if available */}
                    {item.buyerTelegramLink &&
                      !item.isBuyOrder &&
                      tradeDetails?.buyer &&
                      tradeDetails.buyer !==
                        "0x0000000000000000000000000000000000000000" && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Buyer Telegram:{" "}
                          <a
                            href={item.buyerTelegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#00FFA3", textDecoration: "none" }}
                          >
                            {item.buyerTelegramLink}
                          </a>
                        </Typography>
                      )}

                    <Divider sx={{ my: 2 }} />
                  </Box>
                )}

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Listed on: {new Date(item.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {!walletAddress ? (
          <Button
            variant="contained"
            color="primary"
            onClick={connectWallet}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              "Connect Wallet to Interact"
            )}
          </Button>
        ) : (
          <>
            {/* Only show Purchase button for sell orders */}
            {canPurchase && (
              <Button
                variant="contained"
                color="primary"
                onClick={handlePurchase}
                disabled={processingAction}
              >
                {processingAction ? (
                  <CircularProgress size={24} />
                ) : (
                  "Purchase Item"
                )}
              </Button>
            )}

            {/* Only show Confirm Delivery button for sell orders */}
            {canConfirmDelivery && (
              <Button
                variant="contained"
                color="success"
                onClick={handleConfirmDelivery}
                disabled={processingAction}
              >
                {processingAction ? (
                  <CircularProgress size={24} />
                ) : (
                  "Confirm Delivery"
                )}
              </Button>
            )}

            {/* Only show Claim Payment button for sell orders */}
            {canClaimPayment && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleClaimPayment}
                disabled={processingAction}
              >
                {processingAction ? (
                  <CircularProgress size={24} />
                ) : (
                  "Claim Payment"
                )}
              </Button>
            )}

            {canUpdatePrice && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenPriceDialog}
                disabled={processingAction}
              >
                Update Price
              </Button>
            )}
          </>
        )}
      </Box>

      {/* Price Update Dialog */}
      <Dialog open={isPriceDialogOpen} onClose={handleClosePriceDialog}>
        <DialogTitle>Update Item Price</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Price (ETH)"
            type="number"
            fullWidth
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            inputProps={{ step: "0.000001", min: "0.000001" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePriceDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePrice}
            color="primary"
            disabled={processingAction}
          >
            {processingAction ? <CircularProgress size={24} /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isTelegramDialogOpen} onClose={handleCloseTelegramDialog}>
        <DialogTitle>Enter Your Telegram Contact</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide your Telegram contact link,if dispute occur admin will
            contact you (Link can't be wrong,make sure you double checked it).
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Telegram Link"
            type="text"
            fullWidth
            value={buyerTelegramLink}
            onChange={(e) => {
              setBuyerTelegramLink(e.target.value);
              if (buyerTelegramError) setBuyerTelegramError("");
            }}
            placeholder="https://t.me/username"
            error={!!buyerTelegramError}
            helperText={buyerTelegramError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTelegramDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handlePurchaseWithTelegram}
            color="primary"
            disabled={processingAction}
          >
            {processingAction ? (
              <CircularProgress size={24} />
            ) : (
              "Proceed with Purchase"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

