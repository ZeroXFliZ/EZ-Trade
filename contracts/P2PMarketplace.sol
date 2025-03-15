// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract P2PMarketplace is ReentrancyGuard {
    uint256 private constant LISTING_FEE = 0.0002 ether;
    uint256 private constant BUY_ORDER_FEE = 0.00005 ether;
    uint256 private nextItemId = 1;

    struct Trade {
        address payable seller;
        address payable buyer;
        uint128 price; // Price set by the seller
        bool isDelivered;
        bool isCompleted;
    }

    mapping(uint256 => Trade) public trades;
    address payable public owner;
    address payable public treasury; // New state variable for treasury address

    event ItemListed(address indexed seller, uint256 indexed itemId, uint256 price);
    event ItemPurchased(uint256 indexed itemId, address indexed buyer, uint256 price);
    event ItemDelivered(uint256 indexed itemId, uint256 price);
    event PaymentReleased(uint256 indexed itemId, address seller, uint256 amount);
    event Withdrawal(address indexed owner, uint256 amount);
    event ItemPriceUpdated(uint256 indexed itemId, uint256 newPrice);
    event BuyOrderPlaced(address indexed buyer, uint256 indexed itemId, uint256 price);

    constructor(address payable _treasury) {
        owner = payable(msg.sender);
        treasury = _treasury;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Seller lists an item with a price
    function listItem(uint128 price) external payable {
        require(msg.value == LISTING_FEE, "Must pay exact listing fee");
        require(price > 0, "Price must be greater than 0");

        // Generate a unique itemId
        uint256 itemId = nextItemId++;

        // Ensure the itemId is unique
        require(trades[itemId].seller == address(0), "Item ID collision detected");

        // Transfer listing fee to treasury address
        (bool success, ) = treasury.call{value: LISTING_FEE}("");
        require(success, "Failed to send listing fee");

        // Create new trade entry
        trades[itemId] = Trade({
            seller: payable(msg.sender),
            buyer: payable(address(0)),
            price: price,
            isDelivered: false,
            isCompleted: false
        });

        emit ItemListed(msg.sender, itemId, price);
    }

    // Buyer places a buy order
    function buyOrder(uint128 price) external payable {
        require(msg.value == BUY_ORDER_FEE, "Must pay exact buy order fee");
        require(price > 0, "Price must be greater than 0");

        // Generate a unique itemId
        uint256 itemId = nextItemId++;

        // Ensure the itemId is unique
        require(trades[itemId].seller == address(0), "Item ID collision detected");

        // Transfer buy order fee to treasury address
        (bool success, ) = treasury.call{value: BUY_ORDER_FEE}("");
        require(success, "Failed to send buy order fee");

        // Create new trade entry for the buy order
        trades[itemId] = Trade({
            seller: payable(address(0)), // No seller yet
            buyer: payable(msg.sender),
            price: price,
            isDelivered: false,
            isCompleted: false
        });

        emit BuyOrderPlaced(msg.sender, itemId, price);
    }

    // Buyer purchases an item by paying the exact price
    function purchaseItem(uint256 itemId) external payable {
        Trade storage trade = trades[itemId];
        require(trade.seller != address(0), "Item does not exist");
        require(trade.buyer == address(0), "Item already purchased");
        require(!trade.isCompleted, "Trade already completed"); // Prevent double-spending
        require(msg.value == trade.price, "Must pay the exact price");

        trade.buyer = payable(msg.sender);
        emit ItemPurchased(itemId, msg.sender, msg.value);
    }

    // Buyer confirms delivery
    function confirmDelivery(uint256 itemId) external {
        Trade storage trade = trades[itemId];
        require(msg.sender == trade.buyer, "Only buyer can confirm delivery");
        require(!trade.isDelivered, "Delivery already confirmed");

        trade.isDelivered = true;
        emit ItemDelivered(itemId, trade.price);
    }

    // Seller claims payment after delivery is confirmed
    function claimPayment(uint256 itemId) external nonReentrant{
        Trade storage trade = trades[itemId];
        require(msg.sender == trade.seller, "Only seller can claim payment");
        require(trade.isDelivered, "Buyer hasn't confirmed delivery yet");
        require(!trade.isCompleted, "Payment already claimed");

        // Update state before transferring funds (CEI pattern)
        trade.isCompleted = true;
        uint256 amount = trade.price;

        // Transfer funds
        (bool success, ) = trade.seller.call{value: amount}("");
        require(success, "Failed to send payment");

        emit PaymentReleased(itemId, trade.seller, amount);
    }

    // Owner can withdraw any amount of Ether from the contract
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");

        // Transfer funds to the owner
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Failed to withdraw Ether");

        emit Withdrawal(owner, amount);
    }

    // Allow sellers to update the price of their items
    function editItemPrice(uint256 itemId, uint128 newPrice) external {
        Trade storage trade = trades[itemId];
        require(trade.seller != address(0), "Item does not exist");
        require(msg.sender == trade.seller, "Only seller can edit price");
        require(trade.buyer == address(0), "Item already purchased");
        require(!trade.isCompleted, "Trade already completed");
        require(newPrice > 0, "Price must be greater than 0");

        trade.price = newPrice;
        emit ItemPriceUpdated(itemId, newPrice);
    }

    // Allow buyers to update the price of their buy orders
    function editBuyOrderPrice(uint256 itemId, uint128 newPrice) external {
        Trade storage trade = trades[itemId];
        require(trade.buyer != address(0), "Buy order does not exist");
        require(msg.sender == trade.buyer, "Only buyer can edit price");
        require(trade.seller == address(0), "Buy order already matched with seller");
        require(!trade.isCompleted, "Trade already completed");
        require(newPrice > 0, "Price must be greater than 0");

        trade.price = newPrice;
        emit ItemPriceUpdated(itemId, newPrice);
    }

    // View function to get trade details
    function getTradeDetails(uint256 itemId) external view returns (
        address seller,
        address buyer,
        uint256 price,
        bool isDelivered,
        bool isCompleted
    ) {
        Trade storage trade = trades[itemId];
        return (
            trade.seller,
            trade.buyer,
            trade.price,
            trade.isDelivered,
            trade.isCompleted
        );
    }
}