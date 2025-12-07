const API_URL = 'http://localhost:8080/api';

// Handle Buyer Registration
async function handleBuyerRegister(event) {
    event.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate password match
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    // Validate password strength
    if (password.length < 8) {
        showAlert('Password must be at least 8 characters long', 'error');
        return;
    }
    
    const registerData = {
        email: document.getElementById('email').value,
        password: password,
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        role: 'BUYER'
    };
    
    // Generate OTP first
    await generateOtpAndProceed(registerData);
}

// Handle Seller Registration
async function handleSellerRegister(event) {
    event.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate password match
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    // Validate password strength
    if (password.length < 8) {
        showAlert('Password must be at least 8 characters long', 'error');
        return;
    }
    
    const registerData = {
        email: document.getElementById('email').value,
        password: password,
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        businessName: document.getElementById('businessName').value,
        businessDescription: document.getElementById('businessDescription').value,
        role: 'SELLER'
    };
    
    // Generate OTP first
    await generateOtpAndProceed(registerData);
}

// Generate OTP and proceed to verification
async function generateOtpAndProceed(registerData) {
    try {
        showAlert('Sending verification code...', 'info');
        
        const response = await fetch(`${API_URL}/auth/generate-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: registerData.email
            })
        });
        
        if (response.ok) {
            // Store registration data temporarily
            sessionStorage.setItem('pendingRegistration', JSON.stringify(registerData));
            
            showAlert('Verification code sent to your email!', 'success');
            
            // Redirect to OTP verification page
            setTimeout(() => {
                window.location.href = 'verify-otp.html';
            }, 1500);
        } else {
            const error = await response.text();
            showAlert(error || 'Failed to send verification code', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('An error occurred. Please try again.', 'error');
    }
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    
    const loginData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        if (response.ok) {
            const data = await response.json();
            showAlert('Login successful! Redirecting...', 'success');
            
            // Save user data
            localStorage.setItem('user', JSON.stringify(data));
            
            // Redirect based on role
            setTimeout(() => {
                if (data.role === 'BUYER') {
                    window.location.href = 'buyer-dashboard.html';
                } else if (data.role === 'SELLER') {
                    window.location.href = 'seller-dashboard.html';
                }
            }, 1000);
        } else {
            const error = await response.text();
            showAlert(error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('An error occurred. Please try again.', 'error');
    }
}

// Show Alert
function showAlert(message, type) {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    const form = document.querySelector('form');
    form.parentNode.insertBefore(alert, form);
}

// Check if user is already logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        if (user.role === 'BUYER') {
            window.location.href = 'buyer-dashboard.html';
        } else if (user.role === 'SELLER') {
            window.location.href = 'seller-dashboard.html';
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
}
