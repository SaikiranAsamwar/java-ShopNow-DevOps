const API_URL = 'http://localhost:8080/api';
let currentUser = null;
let myProducts = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'SELLER') {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('user-name').textContent = `Hello, ${currentUser.fullName}`;
    loadUserDetails();
    showMyProducts();
});

// Load User Details
async function loadUserDetails() {
    try {
        const response = await fetch(`${API_URL}/auth/user/${currentUser.userId}`);
        const user = await response.json();
        
        if (user.businessName) {
            document.getElementById('business-info').textContent = 
                `${user.businessName} - ${user.businessDescription || 'Your business'}`;
        }
    } catch (error) {
        console.error('Error loading user details:', error);
    }
}

// Show My Products
async function showMyProducts() {
    hideAllSections();
    document.getElementById('welcome-section').style.display = 'block';
    document.getElementById('my-products-section').style.display = 'block';
    
    await loadMyProducts();
}

// Load My Products
async function loadMyProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const allProducts = await response.json();
        
        // In production, filter by seller ID
        myProducts = allProducts;
        
        displayMyProducts(myProducts);
        updateStats(myProducts);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display My Products
function displayMyProducts(products) {
    const grid = document.getElementById('my-products-grid');
    
    if (products.length === 0) {
        grid.innerHTML = '<p class="empty-state">You haven\'t added any products yet.</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">📦</div>
            <span class="product-category">${product.category || 'General'}</span>
            <h3>${product.name}</h3>
            <p>${product.description || 'No description'}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <p style="color: ${product.quantity > 0 ? '#28a745' : '#dc3545'}">
                Stock: ${product.quantity}
            </p>
            <div class="product-actions">
                <button class="btn-edit" onclick="showEditProduct(${product.id})">Edit</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update Stats
function updateStats(products) {
    document.getElementById('total-products').textContent = products.length;
    // These would be calculated from actual order data
    document.getElementById('total-sales').textContent = '0';
    document.getElementById('total-revenue').textContent = '0.00';
}

// Show Add Product
function showAddProduct() {
    hideAllSections();
    document.getElementById('add-product-section').style.display = 'block';
}

// Handle Add Product
async function handleAddProduct(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        quantity: parseInt(document.getElementById('product-quantity').value),
        category: document.getElementById('product-category').value,
        imageUrl: document.getElementById('product-image').value || null,
        active: true
    };
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            alert('Product added successfully!');
            document.getElementById('add-product-form').reset();
            showMyProducts();
        } else {
            alert('Failed to add product. Please try again.');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product. Please try again.');
    }
}

// Show Edit Product
async function showEditProduct(productId) {
    hideAllSections();
    document.getElementById('edit-product-section').style.display = 'block';
    
    // Load product details
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        const product = await response.json();
        
        document.getElementById('edit-product-id').value = product.id;
        document.getElementById('edit-product-name').value = product.name;
        document.getElementById('edit-product-description').value = product.description;
        document.getElementById('edit-product-price').value = product.price;
        document.getElementById('edit-product-quantity').value = product.quantity;
        document.getElementById('edit-product-category').value = product.category;
        document.getElementById('edit-product-image').value = product.imageUrl || '';
    } catch (error) {
        console.error('Error loading product:', error);
    }
}

// Handle Edit Product
async function handleEditProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('edit-product-id').value;
    const productData = {
        name: document.getElementById('edit-product-name').value,
        description: document.getElementById('edit-product-description').value,
        price: parseFloat(document.getElementById('edit-product-price').value),
        quantity: parseInt(document.getElementById('edit-product-quantity').value),
        category: document.getElementById('edit-product-category').value,
        imageUrl: document.getElementById('edit-product-image').value || null,
        active: true
    };
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            alert('Product updated successfully!');
            showMyProducts();
        } else {
            alert('Failed to update product. Please try again.');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Error updating product. Please try again.');
    }
}

// Delete Product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Product deleted successfully!');
            showMyProducts();
        } else {
            alert('Failed to delete product. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
    }
}

// Show Sales Orders
async function showSalesOrders() {
    hideAllSections();
    document.getElementById('sales-orders-section').style.display = 'block';
    
    try {
        const response = await fetch(`${API_URL}/orders`);
        const orders = await response.json();
        displaySalesOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Display Sales Orders
function displaySalesOrders(orders) {
    const ordersList = document.getElementById('sales-orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<div class="empty-state"><h3>No orders found</h3></div>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <h4>Order #${order.id}</h4>
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Email:</strong> ${order.customerEmail}</p>
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
    document.getElementById('welcome-section').style.display = 'none';
    document.getElementById('my-products-section').style.display = 'none';
    document.getElementById('add-product-section').style.display = 'none';
    document.getElementById('edit-product-section').style.display = 'none';
    document.getElementById('sales-orders-section').style.display = 'none';
}
