const API_URL = 'http://localhost:8080/api';

let registrationData = null;
let userEmail = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Get registration data from sessionStorage
    const regData = sessionStorage.getItem('pendingRegistration');
    
    if (!regData) {
        showAlert('Session expired. Please register again.', 'error');
        setTimeout(() => {
            window.location.href = 'register.html';
        }, 2000);
        return;
    }
    
    registrationData = JSON.parse(regData);
    userEmail = registrationData.email;
    document.getElementById('user-email').textContent = userEmail;
    
    // Focus on OTP input
    document.getElementById('otp').focus();
});

// Handle OTP Form Submission
document.getElementById('otp-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const otp = document.getElementById('otp').value.trim();
    
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        showAlert('Please enter a valid 6-digit verification code', 'error');
        return;
    }
    
    await verifyOtp(otp);
});

// Verify OTP
async function verifyOtp(otp) {
    try {
        const response = await fetch(`${API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                otp: otp
            })
        });
        
        if (response.ok) {
            showAlert('Email verified successfully! Creating your account...', 'success');
            
            // Proceed with registration
            await completeRegistration();
        } else {
            const error = await response.text();
            showAlert(error || 'Invalid or expired verification code', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Verification failed. Please try again.', 'error');
    }
}

// Complete Registration
async function completeRegistration() {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Clear pending registration
            sessionStorage.removeItem('pendingRegistration');
            
            // Save user data
            localStorage.setItem('user', JSON.stringify(data));
            
            showAlert('Account created successfully! Redirecting...', 'success');
            
            // Redirect based on role
            setTimeout(() => {
                if (data.role === 'BUYER') {
                    window.location.href = 'buyer-dashboard.html';
                } else if (data.role === 'SELLER') {
                    window.location.href = 'seller-dashboard.html';
                }
            }, 1500);
        } else {
            const error = await response.text();
            showAlert(error || 'Registration failed', 'error');
            
            // Redirect back to registration
            setTimeout(() => {
                window.location.href = registrationData.role === 'SELLER' ? 'register-seller.html' : 'register.html';
            }, 2000);
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Registration failed. Please try again.', 'error');
    }
}

// Resend OTP
document.getElementById('resend-btn').addEventListener('click', async () => {
    const resendBtn = document.getElementById('resend-btn');
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch(`${API_URL}/auth/resend-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail
            })
        });
        
        if (response.ok) {
            showAlert('Verification code resent successfully!', 'success');
            
            // Enable button after 30 seconds
            let countdown = 30;
            resendBtn.textContent = `Resend in ${countdown}s`;
            
            const timer = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    resendBtn.textContent = `Resend in ${countdown}s`;
                } else {
                    clearInterval(timer);
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Resend Verification Code';
                }
            }, 1000);
        } else {
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend Verification Code';
            showAlert('Failed to resend code. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend Verification Code';
        showAlert('An error occurred. Please try again.', 'error');
    }
});

// Auto-format OTP input
document.getElementById('otp').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Show Alert
function showAlert(message, type) {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.querySelector('.auth-box').insertBefore(alert, document.querySelector('.auth-box').firstChild);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}
