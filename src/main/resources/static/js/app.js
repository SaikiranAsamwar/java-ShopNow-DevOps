// API Base URL
const API_URL = 'http://localhost:8080/api';

// Shopping Cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
});

// Load Products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products-grid').innerHTML = 
            '<p class="empty-state">Failed to load products. Please try again later.</p>';
    }
}

// Display Products
function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        grid.innerHTML = '<p class="empty-state">No products found.</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">📦</div>
            <span class="product-category">${product.category || 'General'}</span>
            <h3>${product.name}</h3>
            <p>${product.description || 'No description available'}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <p style="color: ${product.quantity > 0 ? '#28a745' : '#dc3545'}">
                ${product.quantity > 0 ? `In Stock: ${product.quantity}` : 'Out of Stock'}
            </p>
            <button class="btn-add-cart" 
                    onclick="addToCart(${product.id}, '${product.name}', ${product.price})"
                    ${product.quantity === 0 ? 'disabled' : ''}>
                Add to Cart
            </button>
        </div>
    `).join('');
}

// Search Products
async function searchProducts() {
    const keyword = document.getElementById('search-input').value;
    if (!keyword) {
        loadProducts();
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/products/search?keyword=${keyword}`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error searching products:', error);
    }
}

// Filter by Category
async function filterByCategory(category) {
    if (category === 'all') {
        loadProducts();
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/products/category/${category}`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error filtering products:', error);
    }
}

// Add to Cart
function addToCart(productId, name, price) {
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ productId, name, price, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${name} added to cart!`);
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Show Products Section
function showProducts() {
    hideAllSections();
    document.getElementById('search-section').style.display = 'block';
    document.getElementById('products-section').style.display = 'block';
    loadProducts();
}

// Show Cart
function showCart() {
    hideAllSections();
    document.getElementById('cart-section').style.display = 'block';
    displayCart();
}

// Display Cart
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-state"><h3>Your cart is empty</h3></div>';
        document.querySelector('.cart-summary').style.display = 'none';
        return;
    }
    
    document.querySelector('.cart-summary').style.display = 'block';
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            <div>
                <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
            <button class="btn-remove" onclick="removeFromCart(${index})">Remove</button>
        </div>
    `).join('');
    
    updateCartTotal();
}

// Update Quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Remove from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Update Cart Total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

// Show Checkout
function showCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    hideAllSections();
    document.getElementById('checkout-section').style.display = 'block';
    
    // Pre-fill user data
    document.getElementById('customer-name').value = currentUser.fullName;
    document.getElementById('customer-email').value = currentUser.email;
    
    displayCheckoutSummary();
}

// Display Checkout Summary
function displayCheckoutSummary() {
    const checkoutItems = document.getElementById('checkout-items');
    
    checkoutItems.innerHTML = cart.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #ddd;">
            <span>${item.name} x ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkout-total').textContent = total.toFixed(2);
}

// Place Order
async function placeOrder(event) {
    event.preventDefault();
    
    // Use authenticated user data
    const orderData = {
        customerName: currentUser.fullName,
        customerEmail: currentUser.email,
        shippingAddress: document.getElementById('customer-address').value,
        items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))
    };
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            const order = await response.json();
            alert(`Order placed successfully! Order ID: ${order.id}`);
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            showProducts();
        } else {
            alert('Failed to place order. Please try again.');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order. Please try again.');
    }
}

// Show Orders
function showOrders() {
    hideAllSections();
    document.getElementById('orders-section').style.display = 'block';
}

// Load Orders
async function loadOrders() {
    const email = document.getElementById('order-email').value;
    
    if (!email) {
        alert('Please enter your email');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/orders/customer/${email}`);
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('orders-list').innerHTML = 
            '<p class="empty-state">Failed to load orders.</p>';
    }
}

// Display Orders
function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<div class="empty-state"><h3>No orders found</h3></div>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <h4>Order #${order.id}</h4>
            <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
            <p><strong>Total:</strong> $${order.totalAmount.toFixed(2)}</p>
            <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
            <div style="margin-top: 1rem;">
                <strong>Items:</strong>
                ${order.orderItems.map(item => `
                    <div style="padding: 0.5rem 0;">
                        ${item.product.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Hide All Sections
function hideAllSections() {
    document.getElementById('search-section').style.display = 'none';
    document.getElementById('products-section').style.display = 'none';
    document.getElementById('cart-section').style.display = 'none';
    document.getElementById('checkout-section').style.display = 'none';
    document.getElementById('orders-section').style.display = 'none';
}
