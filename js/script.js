// State Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let user = JSON.parse(localStorage.getItem('user')) || null;
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// Utility: Show Toast
function showToast(message, isError = false) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (isError) toast.style.backgroundColor = 'var(--danger-color)';
    toast.textContent = message;

    container.appendChild(toast);
    
    // Trigger reflow to start transition
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Utility: Show/Hide Spinner
function showSpinner() {
    const spinner = document.getElementById('spinner-overlay');
    if (spinner) spinner.style.display = 'flex';
}

function hideSpinner() {
    const spinner = document.getElementById('spinner-overlay');
    if (spinner) spinner.style.display = 'none';
}

// Theme Management
const themeToggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
if(themeToggleBtn) {
    themeToggleBtn.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function toggleTheme() {
    let theme = document.documentElement.getAttribute('data-theme');
    let newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    if(themeToggleBtn) {
        themeToggleBtn.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

if(themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}

// Mobile Menu Management
const mobileMenuBtn = document.getElementById('mobile-menu');
const navLinksContainer = document.getElementById('nav-links');

if(mobileMenuBtn && navLinksContainer) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if(navLinksContainer.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Cart Functionality
function updateCartCount() {
    const countElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElements.forEach(el => {
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'block' : 'none';
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
    showToast('Item removed from cart');
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        if (window.location.pathname.includes('cart.html')) {
            renderCart();
        }
    }
}

// User Navigation Management
function updateUserNav() {
    const loginLink = document.getElementById('login-link');
    if (!loginLink) return;

    if (user) {
        loginLink.innerHTML = `<a href="#" onclick="logout()" class="btn btn-primary" style="padding: 0.5rem 1rem;">Logout (${user.name})</a>`;
    } else {
        loginLink.innerHTML = `<a href="login.html" class="btn btn-primary" style="padding: 0.5rem 1rem;">Login / Signup</a>`;
    }
}

function logout() {
    user = null;
    localStorage.removeItem('user');
    updateUserNav();
    showToast('Logged out successfully');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Render Products Helpers
function createProductCard(product) {
    return `
        <div class="product-card">
            <a href="product.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-img">
            </a>
            <div class="product-category">${product.category.replace('-', ' ')}</div>
            <h3 class="product-title">
                <a href="product.html?id=${product.id}">${product.name}</a>
            </h3>
            <div class="product-price">₹${product.price.toFixed(2)}</div>
            <button class="btn btn-primary" onclick="addToCart(${product.id})" style="width: 100%">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `;
}

// Page Specific Logic
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateUserNav();

    const path = window.location.pathname;

    // Home Page
    if (path.includes('index.html') || path === '/' || path.endsWith('/ecommerce/')) {
        const featuredContainer = document.getElementById('featured-products');
        if (featuredContainer) {
            featuredContainer.innerHTML = products.slice(0, 4).map(createProductCard).join('');
        }
    }

    // Products Page
    else if (path.includes('products.html')) {
        const container = document.getElementById('all-products');
        const searchInput = document.getElementById('search-input');
        const categorySelect = document.getElementById('category-select');

        function renderProductsList() {
            if (!container) return;
            const term = searchInput ? searchInput.value.toLowerCase() : '';
            const cat = categorySelect ? categorySelect.value : '';

            const filtered = products.filter(p => {
                const matchName = p.name.toLowerCase().includes(term);
                const matchCat = cat === '' || p.category === cat;
                return matchName && matchCat;
            });

            if (filtered.length === 0) {
                container.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">No products found.</p>';
            } else {
                container.innerHTML = filtered.map(createProductCard).join('');
            }
        }

        if (searchInput) searchInput.addEventListener('input', renderProductsList);
        if (categorySelect) categorySelect.addEventListener('change', renderProductsList);

        renderProductsList();
    }

    // Product Detail Page
    else if (path.includes('product.html')) {
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('id'));
        const product = products.find(p => p.id === id);

        const container = document.getElementById('product-detail');
        if (!product) {
            if(container) container.innerHTML = '<h2>Product not found</h2><a href="products.html" class="btn btn-primary">Back to Products</a>';
        } else {
            if(container) {
                container.innerHTML = `
                    <div class="product-detail-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-detail-info">
                        <div class="product-category">${product.category.replace('-', ' ')}</div>
                        <h1>${product.name}</h1>
                        <p class="product-detail-price">₹${product.price.toFixed(2)}</p>
                        <p style="margin-bottom: 2rem;">${product.description}</p>
                        <button class="btn btn-primary" onclick="addToCart(${product.id})" style="width: fit-content; padding: 1rem 3rem;">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                `;
            }
        }
    }

    // Cart Page
    else if (path.includes('cart.html')) {
        renderCart();
    }

    // Checkout Page
    else if (path.includes('checkout.html')) {
        if (cart.length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        const summaryContainer = document.getElementById('checkout-summary');
        let total = 0;
        let summaryHTML = '<h3>Order Summary</h3>';
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            summaryHTML += `
                <div class="cart-summary-row" style="font-size: 1rem;">
                    <span>${item.name} x${item.quantity}</span>
                    <span>₹${itemTotal.toFixed(2)}</span>
                </div>
            `;
        });
        summaryHTML += `
            <div class="cart-summary-total">
                <span>Total</span>
                <span>₹${total.toFixed(2)}</span>
            </div>
        `;
        if (summaryContainer) summaryContainer.innerHTML = summaryHTML;

        // Auto-fill user details if logged in
        if (user) {
            const nameInput = document.getElementById('checkout-name');
            const emailInput = document.getElementById('checkout-email');
            if(nameInput) nameInput.value = user.name || '';
            if(emailInput) emailInput.value = user.email || '';
        }

        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                showSpinner();
                
                // Simulate payment processing
                setTimeout(() => {
                    const newOrder = {
                        id: 'ORD-' + Math.floor(Math.random() * 1000000),
                        date: new Date().toISOString(),
                        items: [...cart],
                        total: total,
                        customer: {
                            name: document.getElementById('checkout-name').value,
                            address: document.getElementById('checkout-address').value,
                            phone: document.getElementById('checkout-phone').value
                        }
                    };

                    orders.push(newOrder);
                    localStorage.setItem('orders', JSON.stringify(orders));
                    
                    cart = [];
                    localStorage.setItem('cart', JSON.stringify(cart));
                    
                    hideSpinner();
                    window.location.href = 'success.html';
                }, 2000);
            });
        }
    }

    // Login Page
    else if (path.includes('login.html')) {
        if (user) {
            window.location.href = 'index.html';
            return;
        }

        const loginTab = document.getElementById('tab-login');
        const signupTab = document.getElementById('tab-signup');
        const loginForm = document.getElementById('form-login');
        const signupForm = document.getElementById('form-signup');

        if(loginTab && signupTab && loginForm && signupForm) {
            loginTab.addEventListener('click', () => {
                loginTab.classList.add('active');
                signupTab.classList.remove('active');
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
            });

            signupTab.addEventListener('click', () => {
                signupTab.classList.add('active');
                loginTab.classList.remove('active');
                signupForm.style.display = 'block';
                loginForm.style.display = 'none';
            });

            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                user = { name: email.split('@')[0], email: email };
                localStorage.setItem('user', JSON.stringify(user));
                showToast('Login successful!');
                setTimeout(() => window.location.href = 'index.html', 1000);
            });

            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                user = { name: name, email: email };
                localStorage.setItem('user', JSON.stringify(user));
                showToast('Account created successfully!');
                setTimeout(() => window.location.href = 'index.html', 1000);
            });
        }
    }

    // Success Page
    else if (path.includes('success.html')) {
        const container = document.getElementById('order-details');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = '<p>No recent orders found.</p><a href="products.html" class="btn btn-primary">Continue Shopping</a>';
            return;
        }

        const lastOrder = orders[orders.length - 1];
        let itemsHtml = lastOrder.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>${item.name} (x${item.quantity})</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        container.innerHTML = `
            <h3>Order #${lastOrder.id}</h3>
            <p><strong>Date:</strong> ${new Date(lastOrder.date).toLocaleString()}</p>
            <p><strong>Shipping to:</strong> ${lastOrder.customer.name}, ${lastOrder.customer.address}</p>
            <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border-color);">
            <div style="margin-bottom: 1rem;">
                ${itemsHtml}
            </div>
            <div class="cart-summary-total">
                <span>Total Paid</span>
                <span>₹${lastOrder.total.toFixed(2)}</span>
            </div>
        `;
    }

    // Track Drone Page
    else if (path.includes('track.html')) {
        const trackContent = document.getElementById('track-content');
        const loginMessage = document.getElementById('track-login-message');
        
        if (!user || orders.length === 0) {
            if(loginMessage) loginMessage.style.display = 'block';
            if(trackContent) trackContent.style.display = 'none';
        } else {
            if(loginMessage) loginMessage.style.display = 'none';
            if(trackContent) trackContent.style.display = 'block';
            
            const lastOrder = orders[orders.length - 1];
            document.getElementById('track-order-id').innerText = 'Order #' + lastOrder.id;
            document.getElementById('track-order-date').innerText = 'Date: ' + new Date(lastOrder.date).toLocaleString();
            
            // Simulate progression
            const orderTime = new Date(lastOrder.date).getTime();
            const now = new Date().getTime();
            const diffMins = Math.floor((now - orderTime) / 60000);
            
            const etaEl = document.getElementById('track-eta');
            const step2 = document.getElementById('step-2');
            const step3 = document.getElementById('step-3');
            const step4 = document.getElementById('step-4');

            if (diffMins < 2) {
                etaEl.innerText = 'In 12 mins';
            } else if (diffMins >= 2 && diffMins < 5) {
                etaEl.innerText = 'In 8 mins';
                step2.classList.replace('active', 'completed');
                step3.classList.add('active');
            } else if (diffMins >= 5 && diffMins < 10) {
                etaEl.innerText = 'In 3 mins';
                step2.classList.replace('active', 'completed');
                step3.classList.replace('active', 'completed');
                step4.classList.add('active');
            } else {
                etaEl.innerText = 'Delivered';
                etaEl.style.color = 'var(--success-color)';
                step2.classList.replace('active', 'completed');
                step3.classList.replace('active', 'completed');
                step4.classList.replace('active', 'completed');
            }
        }
    }

    // Contact Page
    else if (path.includes('contact.html')) {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                showSpinner();
                setTimeout(() => {
                    hideSpinner();
                    contactForm.reset();
                    showToast('Message sent! Our support team will get back to you soon.');
                }, 1500);
            });
        }
    }
});

function renderCart() {
    const itemsContainer = document.getElementById('cart-items');
    const summaryContainer = document.getElementById('cart-summary');
    
    if (!itemsContainer || !summaryContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p style="margin-bottom: 2rem; color: var(--text-light);">Looks like you haven't added any medicines yet.</p>
                <a href="products.html" class="btn btn-primary">Browse Products</a>
            </div>
        `;
        summaryContainer.style.display = 'none';
        return;
    }

    summaryContainer.style.display = 'block';
    
    itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4><a href="product.html?id=${item.id}">${item.name}</a></h4>
                <div class="product-price" style="font-size: 1rem; margin-bottom: 0;">₹${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="btn btn-danger" style="padding: 0.5rem; margin-left: 1rem;" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    summaryContainer.innerHTML = `
        <h3>Cart Summary</h3>
        <div class="cart-summary-row" style="margin-top: 1rem;">
            <span>Items (${cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
            <span>₹${total.toFixed(2)}</span>
        </div>
        <div class="cart-summary-row">
            <span>Shipping</span>
            <span>Free</span>
        </div>
        <div class="cart-summary-total" style="margin-bottom: 1.5rem;">
            <span>Total</span>
            <span>₹${total.toFixed(2)}</span>
        </div>
        <a href="checkout.html" class="btn btn-primary" style="display: block; width: 100%;">Proceed to Checkout</a>
    `;
}
