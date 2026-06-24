/* C:\Users\OMKAR\Documents\antigravity\bold-hypatia\js\cart.js */

// --- Default Demo Products data (will be saved to LocalStorage if empty) ---
const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    name: "Royal Rose Wedding Garland (वरमाला)",
    price: 1899,
    oldPrice: 2400,
    category: "garlands",
    image: "https://images.unsplash.com/photo-1774024872435-97b094b1215f?auto=format&fit=crop&w=600&q=80",
    description: "Handcrafted premium red roses and baby's breath garland, perfect for traditional Indian weddings."
  },
  {
    id: "p2",
    name: "Sacred Jasmine & Marigold Pooja Mala",
    price: 450,
    oldPrice: 550,
    category: "garlands",
    image: "https://images.unsplash.com/photo-1760963809680-dbc4b0366948?auto=format&fit=crop&w=600&q=80",
    description: "Freshly picked white jasmine (Mogra) and orange marigolds threaded traditionally for temple prayers."
  },
  {
    id: "p3",
    name: "Blush Pink Rose Gold Bouquet",
    price: 899,
    oldPrice: 1200,
    category: "bouquets",
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80",
    description: "An elegant arrangement of pink roses, white carnations, and eucalyptus foliage wrapped in premium craft paper."
  },
  {
    id: "p4",
    name: "Premium White Lily & Orchid Bouquet",
    price: 1199,
    oldPrice: 1500,
    category: "bouquets",
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80",
    description: "A peaceful arrangement of snow-white lilies and purple orchids, representing purity and beauty."
  },
  {
    id: "p5",
    name: "Auspicious Marigold Mango Leaf Toran",
    price: 349,
    oldPrice: 499,
    category: "torans",
    image: "https://images.unsplash.com/photo-1610116306796-6ebd30d779c6?auto=format&fit=crop&w=600&q=80",
    description: "Traditional hanging floral door decor made of yellow/orange marigolds and natural green mango leaves."
  },
  {
    id: "p6",
    name: "Traditional House Entrance Decoration",
    price: 7999,
    oldPrice: 9999,
    category: "decorations",
    image: "https://images.unsplash.com/photo-1771613934220-1158b37be523?auto=format&fit=crop&w=600&q=80",
    description: "Transform your home with a premium entrance setup containing pillars of marigolds, roses, and hanging floral drops."
  },
  {
    id: "p7",
    name: "Luxury Car Floral Decoration",
    price: 4499,
    oldPrice: 5500,
    category: "decorations",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    description: "Elegant bouquet clusters and net ribbon overlay decorations for wedding send-off cars."
  },
  {
    id: "p8",
    name: "Golden Sunflower Celebration Box",
    price: 699,
    oldPrice: 890,
    category: "bouquets",
    image: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=600&q=80",
    description: "Vibrant yellow sunflowers paired with green foliage inside a luxurious presentation box."
  }
];

// --- Today's Special Default (will be saved if empty) ---
const DEFAULT_SPECIAL = {
  id: "spec-01",
  name: "Signature Golden Lotus Shringar Set",
  price: 2499,
  oldPrice: 3999,
  discount: "37% OFF",
  description: "A gorgeous, limited-edition set of pink lotuses, exotic orchids, and jasmine strings, curated specifically for festive home altars (Pooja setups) and special events.",
  image: "https://images.unsplash.com/photo-1760963809680-dbc4b0366948?auto=format&fit=crop&w=600&q=80",
  // Target date is set to 24 hours from current time
  targetTime: Date.now() + 24 * 60 * 60 * 1000
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initLocalStorageData();
  setupCartDrawerElements();
  renderCart();
  initTodaySpecialTimer();
});

function initLocalStorageData() {
  const CURRENT_VERSION = '1.3';
  if (localStorage.getItem('products_version') !== CURRENT_VERSION) {
    localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem('special_product', JSON.stringify(DEFAULT_SPECIAL));
    localStorage.setItem('products_version', CURRENT_VERSION);
  }
  if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
  }
  if (!localStorage.getItem('custom_orders')) {
    localStorage.setItem('custom_orders', JSON.stringify([]));
  }
}

// --- Cart Utility Functions ---
function getProducts() {
  return JSON.parse(localStorage.getItem('products')) || DEFAULT_PRODUCTS;
}

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

// --- Add, Remove, and Update Cart Logic ---
function addToCart(productId, count = 1) {
  let cart = getCart();
  const products = getProducts();
  const specialProduct = JSON.parse(localStorage.getItem('special_product')) || DEFAULT_SPECIAL;

  // Verify if it is the special product or regular product
  let productExists = products.find(p => p.id === productId) || (specialProduct.id === productId ? specialProduct : null);
  
  if (!productExists) return;

  const existingItemIndex = cart.findIndex(item => item.productId === productId);
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += count;
  } else {
    cart.push({ productId: productId, quantity: count });
  }

  saveCart(cart);
  openCartDrawer();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.productId !== productId);
  saveCart(cart);
}

function updateQuantity(productId, change) {
  let cart = getCart();
  const index = cart.findIndex(item => item.productId === productId);
  if (index > -1) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
  }
}

// --- Cart Drawer Interface UI Render ---
function setupCartDrawerElements() {
  // Create cart drawer markup if it doesn't exist
  if (!document.getElementById('cart-drawer')) {
    const drawerHTML = `
      <div class="cart-overlay" id="cart-overlay"></div>
      <div class="cart-drawer" id="cart-drawer">
        <div class="cart-header">
          <h3>Shopping Cart</h3>
          <button class="btn-close-cart" id="btn-close-cart">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="cart-items-container" id="cart-items-container">
          <!-- Items injected by JS -->
        </div>
        <div class="cart-footer">
          <div class="cart-total-row">
            <span>Total:</span>
            <span class="cart-total-price" id="cart-total-price">₹0</span>
          </div>
          <button class="btn-premium btn-premium-gold w-100 justify-content-center" id="btn-checkout">
            Proceed to WhatsApp Checkout
          </button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHTML);
  }

  // Set event listeners for open/close drawer
  const btnCartTrigger = document.getElementById('btn-cart-trigger');
  const btnCloseCart = document.getElementById('btn-close-cart');
  const cartOverlay = document.getElementById('cart-overlay');

  if (btnCartTrigger) {
    btnCartTrigger.addEventListener('click', openCartDrawer);
  }
  if (btnCloseCart) {
    btnCloseCart.addEventListener('click', closeCartDrawer);
  }
  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCartDrawer);
  }

  // Add click listener to page body to capture dynamic add-to-cart clicks
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-add-to-cart');
    if (btn) {
      const pid = btn.dataset.productId;
      if (pid) {
        addToCart(pid);
      }
    }

    const btnPremiumCart = e.target.closest('.btn-add-to-cart-premium');
    if (btnPremiumCart) {
      const pid = btnPremiumCart.dataset.productId;
      if (pid) {
        addToCart(pid);
      }
    }
  });

  // Setup WhatsApp Checkout handler
  const btnCheckout = document.getElementById('btn-checkout');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      triggerWhatsAppCheckout();
    });
  }
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('show');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
  }
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const totalPriceEl = document.getElementById('cart-total-price');
  const badgeCounts = document.querySelectorAll('.cart-count');
  
  if (!container) return;

  const cart = getCart();
  const products = getProducts();
  const specialProduct = JSON.parse(localStorage.getItem('special_product')) || DEFAULT_SPECIAL;

  let totalHTML = '';
  let subtotal = 0;
  let totalItemsCount = 0;

  if (cart.length === 0) {
    totalHTML = `
      <div class="cart-empty-message">
        <i class="fas fa-shopping-basket"></i>
        <p>Your flower basket is empty</p>
      </div>
    `;
  } else {
    cart.forEach(item => {
      // Find regular or special product
      const product = products.find(p => p.id === item.productId) || (specialProduct.id === item.productId ? specialProduct : null);
      if (!product) return;

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      totalItemsCount += item.quantity;

      const isVideo = product.image && (product.image.startsWith('data:video/') || product.image.endsWith('.mp4') || product.image.endsWith('.webm'));
      const mediaTag = isVideo 
        ? `<video src="${product.image}" class="cart-item-img" autoplay muted loop></video>`
        : `<img src="${product.image}" alt="${product.name}" class="cart-item-img">`;

      totalHTML += `
        <div class="cart-item">
          ${mediaTag}
          <div class="cart-item-info">
            <div class="cart-item-title">${product.name}</div>
            <div class="cart-item-price">₹${product.price}</div>
            <div class="cart-item-controls">
              <div class="quantity-selector">
                <button class="quantity-btn" onclick="updateQuantity('${product.id}', -1)">-</button>
                <div class="quantity-value">${item.quantity}</div>
                <button class="quantity-btn" onclick="updateQuantity('${product.id}', 1)">+</button>
              </div>
              <button class="btn-remove-item" onclick="removeFromCart('${product.id}')">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = totalHTML;
  if (totalPriceEl) totalPriceEl.textContent = `₹${subtotal}`;
  
  badgeCounts.forEach(badge => {
    badge.textContent = totalItemsCount;
    badge.style.display = totalItemsCount > 0 ? 'flex' : 'none';
  });
}

// --- WhatsApp Checkout Integration ---
function triggerWhatsAppCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;

  const products = getProducts();
  const specialProduct = JSON.parse(localStorage.getItem('special_product')) || DEFAULT_SPECIAL;

  let message = `🌺 *New Flower Order - Bhakti Pushpa Bhandar* 🌺\n\n`;
  let subtotal = 0;

  cart.forEach((item, index) => {
    const product = products.find(p => p.id === item.productId) || (specialProduct.id === item.productId ? specialProduct : null);
    if (product) {
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      message += `${index + 1}. *${product.name}*\n   Qty: ${item.quantity} x ₹${product.price} = ₹${itemTotal}\n`;
    }
  });

  message += `\n-----------------------\n💰 *Total Amount: ₹${subtotal}*\n`;
  message += `\n📍 Please confirm delivery details and time. Thank you!`;

  // Encode message for WhatsApp
  const encodedText = encodeURIComponent(message);
  // Default WhatsApp mobile for shop (Thergaon Branch)
  const phoneNumber = "919922054573"; 
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedText}`;

  // Redirect user to WhatsApp
  window.open(whatsappURL, '_blank');
}

// --- Today's Special Countdown Timer Logic ---
let timerInterval;
function initTodaySpecialTimer() {
  const countdownContainer = document.getElementById('special-countdown-timer');
  if (!countdownContainer) return;

  const updateTimer = () => {
    const specialProduct = JSON.parse(localStorage.getItem('special_product')) || DEFAULT_SPECIAL;
    const now = Date.now();
    const distance = specialProduct.targetTime - now;

    if (distance < 0) {
      clearInterval(timerInterval);
      countdownContainer.innerHTML = `<span class="text-danger fw-bold uppercase">Offer Expired!</span>`;
      return;
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const padZero = (num) => String(num).padStart(2, '0');

    countdownContainer.innerHTML = `
      <div class="timer-segment">
        <div class="timer-number">${padZero(hours)}</div>
        <div class="timer-label">Hrs</div>
      </div>
      <div class="timer-segment">
        <div class="timer-number">${padZero(minutes)}</div>
        <div class="timer-label">Mins</div>
      </div>
      <div class="timer-segment">
        <div class="timer-number">${padZero(seconds)}</div>
        <div class="timer-label">Secs</div>
      </div>
    `;
  };

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}
