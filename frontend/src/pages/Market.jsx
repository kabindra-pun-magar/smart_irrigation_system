import React, { useState, useRef } from "react";
import "../styles/Community.css";

export default function Community() {
  const [activeTab, setActiveTab] = useState('market');
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: "Rajesh Kumar",
      role: "farmer",
      avatar: "👨‍🌾",
      message: "Fresh organic tomatoes available! 40/kg",
      time: "10:30 AM",
      likes: 12,
      comments: 5
    },
    {
      id: 2,
      user: "Priya Sharma",
      role: "farmer",
      avatar: "👩‍🌾",
      message: "Spinach and coriander ready for harvest. Contact for bulk orders!",
      time: "09:15 AM",
      likes: 8,
      comments: 3
    },
    {
      id: 3,
      user: "Amit Patel",
      role: "client",
      avatar: "👨‍💼",
      message: "Looking for organic cauliflower and carrots. Any farmers available?",
      time: "Yesterday",
      likes: 5,
      comments: 7
    }
  ]);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Organic Tomatoes",
      farmer: "Rajesh Kumar",
      price: 40,
      unit: "kg",
      quantity: 100,
      image: "🍅",
      rating: 4.8,
      orders: 45,
      description: "Fresh organic tomatoes grown without pesticides"
    },
    {
      id: 2,
      name: "Fresh Spinach",
      farmer: "Priya Sharma",
      price: 30,
      unit: "bunch",
      quantity: 75,
      image: "🥬",
      rating: 4.9,
      orders: 32,
      description: "Nutrient-rich spinach harvested fresh daily"
    },
    {
      id: 3,
      name: "Organic Carrots",
      farmer: "Suresh Yadav",
      price: 50,
      unit: "kg",
      quantity: 50,
      image: "🥕",
      rating: 4.7,
      orders: 28,
      description: "Sweet and crunchy organic carrots"
    },
    {
      id: 4,
      name: "Green Bell Peppers",
      farmer: "Anita Desai",
      price: 60,
      unit: "kg",
      quantity: 60,
      image: "🫑",
      rating: 4.6,
      orders: 19,
      description: "Crisp and fresh bell peppers"
    },
    {
      id: 5,
      name: "Organic Cauliflower",
      farmer: "Vikram Singh",
      price: 45,
      unit: "piece",
      quantity: 40,
      image: "🥦",
      rating: 4.8,
      orders: 23,
      description: "Fresh cauliflower, perfect for cooking"
    },
    {
      id: 6,
      name: "Fresh Coriander",
      farmer: "Meena Kumari",
      price: 20,
      unit: "bunch",
      quantity: 100,
      image: "🌿",
      rating: 4.9,
      orders: 56,
      description: "Aromatic fresh coriander leaves"
    }
  ]);

  const [cart, setCart] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      alert("Please add items to your cart first!");
      return;
    }
    
    const orderDetails = {
      id: Date.now(),
      items: cart,
      total: getCartTotal(),
      date: new Date().toISOString(),
      status: "pending"
    };
    
    console.log("Order placed:", orderDetails);
    alert(`Order placed successfully! Total: ₹${getCartTotal()}`);
    setCart([]);
    setShowCart(false);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: messages.length + 1,
      user: "You",
      role: "client",
      avatar: "👤",
      message: newMessage,
      time: "Just now",
      likes: 0,
      comments: 0
    };
    
    setMessages([newMsg, ...messages]);
    setNewMessage("");
  };

  const openOrderModal = (product) => {
    setSelectedProduct(product);
    setOrderQuantity(1);
    setIsOrderModalOpen(true);
  };

  const quickOrder = () => {
    if (selectedProduct && orderQuantity > 0) {
      addToCart({ ...selectedProduct, quantity: orderQuantity });
      setIsOrderModalOpen(false);
      alert(`Added ${orderQuantity} ${selectedProduct.unit}(s) of ${selectedProduct.name} to cart!`);
    }
  };

  return (
    <div className="community-page">
      {/* Glass Background Effect */}
      <div className="glass-bg-blue"></div>
      
      {/* Header Section */}
      <div className="page-header glass-card-blue">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">🌱</span>
            Community Market
            <span className="title-icon">🤝</span>
          </h1>
          <p className="page-description">
            Connect with local farmers, share knowledge, and order fresh vegetables directly from the source
          </p>
        </div>
        
        {/* Cart Button */}
        <div className="header-actions">
          <button 
            className="cart-btn glass-btn-blue"
            onClick={() => setShowCart(!showCart)}
          >
            <span className="btn-icon">🛒</span>
            Cart
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card glass-card-blue">
          <div className="stat-icon">👨‍🌾</div>
          <div className="stat-info">
            <div className="stat-number">24</div>
            <div className="stat-label">Active Farmers</div>
          </div>
        </div>
        <div className="stat-card glass-card-blue">
          <div className="stat-icon">🥬</div>
          <div className="stat-info">
            <div className="stat-number">{products.length}</div>
            <div className="stat-label">Products</div>
          </div>
        </div>
        <div className="stat-card glass-card-blue">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-number">156</div>
            <div className="stat-label">Orders Today</div>
          </div>
        </div>
        <div className="stat-card glass-card-blue">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <div className="stat-number">4.8</div>
            <div className="stat-label">Rating</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container glass-card-blue">
        <button 
          className={`tab-btn-blue ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          <span className="tab-icon">🏪</span>
          Market Place
        </button>
        <button 
          className={`tab-btn-blue ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <span className="tab-icon">💬</span>
          Community Chat
        </button>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="cart-sidebar glass-card-blue">
          <div className="cart-header">
            <h3>Your Cart</h3>
            <button className="close-cart" onClick={() => setShowCart(false)}>✕</button>
          </div>
          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <p>Your cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.image} {item.name}</span>
                    <span className="cart-item-price">₹{item.price}/{item.unit}</span>
                  </div>
                  <div className="cart-item-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button className="remove-item" onClick={() => removeFromCart(item.id)}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total:</span>
                <span className="total-amount">₹{getCartTotal()}</span>
              </div>
              <button className="checkout-btn glass-btn-blue" onClick={placeOrder}>
                Place Order
              </button>
            </div>
          )}
        </div>
      )}

      {/* Market Place Tab */}
      {activeTab === 'market' && (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card glass-card-blue">
              <div className="product-image">
                <div className="product-emoji">{product.image}</div>
                <div className="product-rating">
                  ⭐ {product.rating} ({product.orders} orders)
                </div>
              </div>
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-farmer">
                  <span className="farmer-icon">👨‍🌾</span>
                  {product.farmer}
                </div>
                <div className="product-price">
                  <span className="price">₹{product.price}</span>
                  <span className="unit">/{product.unit}</span>
                  <span className="quantity">({product.quantity} available)</span>
                </div>
                <div className="product-actions">
                  <button 
                    className="buy-now-btn"
                    onClick={() => openOrderModal(product)}
                  >
                    Buy Now
                  </button>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community Chat Tab */}
      {activeTab === 'community' && (
        <div className="community-chat">
          <div className="chat-messages glass-card-blue">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-item ${msg.role === 'client' && msg.user === 'You' ? 'own-message' : ''}`}>
                <div className="message-avatar">{msg.avatar}</div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-user">{msg.user}</span>
                    <span className="message-role">{msg.role === 'farmer' ? '👨‍🌾 Farmer' : '👤 Client'}</span>
                    <span className="message-time">{msg.time}</span>
                  </div>
                  <p className="message-text">{msg.message}</p>
                  <div className="message-actions">
                    <button className="like-btn">👍 {msg.likes}</button>
                    <button className="comment-btn">💬 {msg.comments}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="chat-input glass-card-blue">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your thoughts, ask questions, or connect with farmers..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} className="send-btn glass-btn-blue">
              Send
            </button>
          </div>
          
          <div className="chat-tips glass-card-blue">
            <h4>💡 Community Guidelines</h4>
            <p>• Be respectful to farmers and other community members</p>
            <p>• Share genuine farming experiences and tips</p>
            <p>• Direct order inquiries to farmers via chat</p>
            <p>• Help others with farming questions</p>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {isOrderModalOpen && selectedProduct && (
        <div className="modal-overlay" onClick={() => setIsOrderModalOpen(false)}>
          <div className="order-modal glass-card-blue" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order {selectedProduct.name}</h2>
              <button className="close-modal" onClick={() => setIsOrderModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="product-info-modal">
                <div className="product-emoji-large">{selectedProduct.image}</div>
                <div className="product-details-modal">
                  <h3>{selectedProduct.name}</h3>
                  <p>{selectedProduct.description}</p>
                  <div className="farmer-info">👨‍🌾 {selectedProduct.farmer}</div>
                  <div className="price-info">₹{selectedProduct.price}/{selectedProduct.unit}</div>
                </div>
              </div>
              
              <div className="quantity-selector">
                <label>Quantity ({selectedProduct.unit}):</label>
                <div className="quantity-controls">
                  <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}>-</button>
                  <input
                    type="number"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={selectedProduct.quantity}
                  />
                  <button onClick={() => setOrderQuantity(Math.min(selectedProduct.quantity, orderQuantity + 1))}>+</button>
                </div>
                <div className="total-price">
                  Total: ₹{selectedProduct.price * orderQuantity}
                </div>
              </div>
              
              <div className="delivery-info">
                <h4>Delivery Details</h4>
                <input type="text" placeholder="Full Name" className="delivery-input" />
                <input type="text" placeholder="Address" className="delivery-input" />
                <input type="text" placeholder="Phone Number" className="delivery-input" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsOrderModalOpen(false)}>Cancel</button>
              <button className="confirm-order-btn glass-btn-blue" onClick={quickOrder}>
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}