/* C:\Users\OMKAR\Documents\antigravity\bold-hypatia\js\admin.js */

// Global file variables for uploads
let selectedProductFile = null;
let selectedSpecialFile = null;
let selectedGalleryFile = null;
let editingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  
  if (path.includes('admin-dashboard.html')) {
    checkAdminAuth();
    initDashboard();
  } else if (path.includes('admin-login.html')) {
    initLogin();
  }
});

// --- Auth Gate ---
function checkAdminAuth() {
  if (localStorage.getItem('admin_logged_in') !== 'true') {
    window.location.href = 'admin-login.html';
  }
}

// --- Login Screen ---
function initLogin() {
  const loginForm = document.getElementById('admin-login-form');
  const errorMsg = document.getElementById('login-error-message');

  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    const correctUser = typeof config !== 'undefined' ? config.adminUsername : '';
    const correctPass = typeof config !== 'undefined' ? config.adminPassword : '';

    if (correctUser && correctPass && user === correctUser && pass === correctPass) {
      localStorage.setItem('admin_logged_in', 'true');
      window.location.href = 'admin-dashboard.html';
    } else {
      if (errorMsg) {
        errorMsg.textContent = 'Invalid username or password. Please try again.';
        errorMsg.classList.remove('d-none');
      }
    }
  });
}


// --- Dashboard Functions ---
function initDashboard() {
  // Logout handler
  const btnLogout = document.getElementById('btn-admin-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('admin_logged_in');
      window.location.href = 'admin-login.html';
    });
  }

  renderDashboardStats();
  renderProductsTable();
  renderCustomOrdersList();
  loadTodaySpecialForm();
  renderGalleryTable();

  // Setup form submit handlers
  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', handleProductFormSubmit);
  }

  const specialForm = document.getElementById('special-form');
  if (specialForm) {
    specialForm.addEventListener('submit', handleSpecialFormSubmit);
  }

  const galleryForm = document.getElementById('gallery-form');
  if (galleryForm) {
    galleryForm.addEventListener('submit', handleGalleryFormSubmit);
  }

  // Cancel edit button handler
  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', resetProductForm);
  }

  // Setup product file uploader
  const prodFile = document.getElementById('prod-file');
  const prodImageInput = document.getElementById('prod-image');
  if (prodFile && prodImageInput) {
    prodFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024 && file.type.startsWith('video/')) {
          alert('Video file is too large! Please upload a video smaller than 2MB.');
          prodFile.value = '';
          return;
        }
        
        selectedProductFile = file; // Cache file for Cloudinary upload
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const rawBase = event.target.result;
          if (file.type.startsWith('image/')) {
            compressImage(rawBase, 800, (compressed) => {
              prodImageInput.value = compressed;
            });
          } else {
            prodImageInput.value = rawBase;
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Setup special offer file uploader
  const specFile = document.getElementById('spec-file');
  const specImageInput = document.getElementById('spec-image');
  if (specFile && specImageInput) {
    specFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024 && file.type.startsWith('video/')) {
          alert('Video file is too large! Please upload a video smaller than 2MB.');
          specFile.value = '';
          return;
        }
        
        selectedSpecialFile = file; // Cache file for Cloudinary upload
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const rawBase = event.target.result;
          if (file.type.startsWith('image/')) {
            compressImage(rawBase, 800, (compressed) => {
              specImageInput.value = compressed;
            });
          } else {
            specImageInput.value = rawBase;
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Setup gallery file uploader
  const galFile = document.getElementById('gal-file');
  const galImageInput = document.getElementById('gal-image');
  if (galFile && galImageInput) {
    galFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedGalleryFile = file; // Cache file for Cloudinary upload
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const rawBase = event.target.result;
          compressImage(rawBase, 800, (compressed) => {
            galImageInput.value = compressed;
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// Stats counter
function renderDashboardStats() {
  const totalProdsEl = document.getElementById('stat-total-products');
  const totalOrdersEl = document.getElementById('stat-total-orders');

  const updateStats = (prodCount, orderCount) => {
    if (totalProdsEl) totalProdsEl.textContent = prodCount;
    if (totalOrdersEl) totalOrdersEl.textContent = orderCount;
  };

  if (useGoogleSheets) {
    Promise.all([
      fetch(`${apiConfig.googleAppScriptUrl}?action=getProducts`).then(r => r.json()),
      fetch(`${apiConfig.googleAppScriptUrl}?action=getCustomOrders`).then(r => r.json())
    ]).then(([productsList, ordersList]) => {
      updateStats(productsList.length, ordersList.length);
    }).catch(err => {
      console.error("Stats fetching error: ", err);
    });
  } else {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const customOrders = JSON.parse(localStorage.getItem('custom_orders')) || [];
    updateStats(products.length, customOrders.length);
  }
}

// Products CRUD table
function renderProductsTable() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  const renderRows = (products) => {
    // Cache local copy for public products list
    localStorage.setItem('products', JSON.stringify(products));

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No products in catalog. Add one below.</td></tr>`;
      return;
    }

    let rows = '';
    products.forEach((prod, index) => {
      const isVideo = prod.image && (prod.image.startsWith('data:video/') || prod.image.endsWith('.mp4') || prod.image.endsWith('.webm') || prod.image.includes('video/upload'));
      const mediaTag = isVideo 
        ? `<video src="${prod.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" autoplay muted loop></video>`
        : `<img src="${prod.image}" alt="${prod.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">`;

      rows += `
        <tr>
          <td class="align-middle">${index + 1}</td>
          <td class="align-middle">
            ${mediaTag}
          </td>
          <td class="align-middle fw-semibold">${prod.name}</td>
          <td class="align-middle text-capitalize">${prod.category}</td>
          <td class="align-middle fw-bold text-primary">₹${prod.price} <span class="text-muted fw-normal" style="font-size:0.8rem; text-decoration:line-through;">₹${prod.oldPrice}</span></td>
          <td class="align-middle">
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-secondary" onclick="editProduct('${prod.id}')">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${prod.id}')">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rows;
  };

  if (useGoogleSheets) {
    fetch(`${apiConfig.googleAppScriptUrl}?action=getProducts`)
      .then(r => r.json())
      .then(products => {
        renderRows(products);
      })
      .catch(err => {
        console.error("Google Sheets loading catalog failed:", err);
        renderRows(JSON.parse(localStorage.getItem('products')) || []);
      });
  } else {
    renderRows(JSON.parse(localStorage.getItem('products')) || []);
  }
}

// Product Form Save
function handleProductFormSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('prod-name').value.trim();
  const price = parseFloat(document.getElementById('prod-price').value);
  const oldPrice = parseFloat(document.getElementById('prod-old-price').value);
  const category = document.getElementById('prod-category').value;
  const imageVal = document.getElementById('prod-image').value.trim();
  const description = document.getElementById('prod-desc').value.trim();

  const btnSubmit = document.getElementById('btn-submit-product');
  const originalText = btnSubmit.textContent;

  const saveProduct = (imageSrc) => {
    if (useGoogleSheets) {
      btnSubmit.textContent = 'Saving to Sheet...';
      btnSubmit.disabled = true;

      const payload = {
        action: editingProductId ? "updateProduct" : "addProduct",
        product: {
          id: editingProductId || 'p-' + Date.now(),
          name,
          price,
          oldPrice,
          category,
          image: imageSrc,
          description,
          timestamp: new Date().toISOString()
        }
      };

      callGoogleScript(payload, () => {
        alert(editingProductId ? 'Product updated in Google Sheet!' : 'Product added to Google Sheet!');
        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;
        resetProductForm();
        renderProductsTable();
        renderDashboardStats();
      }, (err) => {
        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;
        alert("Failed to save product in Google Sheet database: " + err);
      });
    } else {
      let products = JSON.parse(localStorage.getItem('products')) || [];
      if (editingProductId) {
        const index = products.findIndex(p => p.id === editingProductId);
        if (index > -1) {
          products[index] = { id: editingProductId, name, price, oldPrice, category, image: imageSrc, description };
        }
      } else {
        products.push({ id: 'p-' + Date.now(), name, price, oldPrice, category, image: imageSrc, description });
      }
      
      try {
        localStorage.setItem('products', JSON.stringify(products));
        resetProductForm();
        renderProductsTable();
        renderDashboardStats();
        alert('Product saved successfully in browser storage!');
      } catch (err) {
        console.error(err);
        alert('Failed to save to browser storage! File size limit exceeded. Select a smaller media file (Max 2MB).');
      }
    }
  };

  // Upload file if selected
  if (selectedProductFile) {
    if (useCloudinary) {
      btnSubmit.textContent = 'Uploading Media...';
      btnSubmit.disabled = true;

      uploadToCloudinary(selectedProductFile, (url) => {
        selectedProductFile = null;
        saveProduct(url);
      }, (err) => {
        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;
        alert("Failed to upload image/video to Cloudinary storage: " + err);
      });
    } else {
      if (useGoogleSheets) {
        alert("Google Sheets database is active, but file uploads require Cloudinary. Please configure Cloudinary in js/api-config.js or paste an image URL instead.");
      } else {
        saveProduct(imageVal);
      }
    }
  } else {
    saveProduct(imageVal || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80');
  }
}

window.editProduct = function(productId) {
  const fillForm = (prod) => {
    editingProductId = prod.id;
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-price').value = prod.price;
    document.getElementById('prod-old-price').value = prod.oldPrice;
    document.getElementById('prod-category').value = prod.category;
    document.getElementById('prod-image').value = prod.image;
    document.getElementById('prod-desc').value = prod.description;

    document.getElementById('form-action-title').textContent = 'Edit Product Details';
    document.getElementById('btn-submit-product').textContent = 'Update Product';
    document.getElementById('btn-cancel-edit').classList.remove('d-none');
    document.getElementById('form-section-title').scrollIntoView({ behavior: 'smooth' });
  };

  // Retrieve details directly from cached list in LocalStorage
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const prod = products.find(p => p.id == productId); // loose comparison in case IDs are parsed differently
  if (prod) {
    fillForm(prod);
  } else {
    alert("Product details not found!");
  }
};

window.deleteProduct = function(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  if (useGoogleSheets) {
    const payload = {
      action: "deleteProduct",
      id: productId
    };
    callGoogleScript(payload, () => {
      alert('Product deleted from Google Sheet!');
      renderProductsTable();
      renderDashboardStats();
    }, (err) => {
      alert("Failed to delete product from Google Sheet: " + err);
    });
  } else {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(p => p.id != productId);
    localStorage.setItem('products', JSON.stringify(products));
    renderProductsTable();
    renderDashboardStats();
  }
};

function resetProductForm() {
  editingProductId = null;
  selectedProductFile = null;
  document.getElementById('product-form').reset();
  
  document.getElementById('form-action-title').textContent = 'Add New Floral Product';
  document.getElementById('btn-submit-product').textContent = 'Save Product';
  document.getElementById('btn-cancel-edit').classList.add('d-none');
}

// Special Products management
function loadTodaySpecialForm() {
  const fillSpecialForm = (specialProduct) => {
    if (specialProduct.name) {
      document.getElementById('spec-name').value = specialProduct.name;
      document.getElementById('spec-price').value = specialProduct.price;
      document.getElementById('spec-old-price').value = specialProduct.oldPrice;
      document.getElementById('spec-discount').value = specialProduct.discount;
      document.getElementById('spec-desc').value = specialProduct.description;
      document.getElementById('spec-image').value = specialProduct.image;
      
      const hoursLeft = Math.max(1, Math.round((specialProduct.targetTime - Date.now()) / (1000 * 60 * 60)));
      document.getElementById('spec-hours').value = hoursLeft;
    }
  };

  if (useGoogleSheets) {
    fetch(`${apiConfig.googleAppScriptUrl}?action=getSpecial`)
      .then(r => r.json())
      .then(special => {
        if (special) fillSpecialForm(special);
      })
      .catch(err => {
        console.error("Google Sheets loading special failed:", err);
      });
  } else {
    const specialProduct = JSON.parse(localStorage.getItem('special_product')) || {};
    fillSpecialForm(specialProduct);
  }
}

function handleSpecialFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('spec-name').value.trim();
  const price = parseFloat(document.getElementById('spec-price').value);
  const oldPrice = parseFloat(document.getElementById('spec-old-price').value);
  const discount = document.getElementById('spec-discount').value.trim();
  const description = document.getElementById('spec-desc').value.trim();
  const imageVal = document.getElementById('spec-image').value.trim();
  const hours = parseInt(document.getElementById('spec-hours').value);

  const btnSubmit = document.getElementById('btn-submit-special');
  const originalText = btnSubmit ? btnSubmit.textContent : 'Save Deal';

  const saveSpecial = (imageSrc) => {
    const special = {
      id: "spec-01",
      name,
      price,
      oldPrice,
      discount,
      description,
      image: imageSrc,
      targetTime: Date.now() + hours * 60 * 60 * 1000
    };

    if (useGoogleSheets) {
      if (btnSubmit) {
        btnSubmit.textContent = 'Saving Deal...';
        btnSubmit.disabled = true;
      }

      const payload = {
        action: "setSpecial",
        special: special
      };

      callGoogleScript(payload, () => {
        localStorage.setItem('special_product', JSON.stringify(special));
        alert("Today's Special Deal updated in Google Sheet!");
        if (btnSubmit) {
          btnSubmit.textContent = originalText;
          btnSubmit.disabled = false;
        }
      }, (err) => {
        if (btnSubmit) {
          btnSubmit.textContent = originalText;
          btnSubmit.disabled = false;
        }
        alert("Failed to save Today's Special in Google Sheet: " + err);
      });
    } else {
      try {
        localStorage.setItem('special_product', JSON.stringify(special));
        alert('Today\'s Special updated successfully!');
      } catch (err) {
        alert('Failed to save Today\'s Special. File size limit exceeded.');
      }
    }
  };

  // Upload special image/video to Cloudinary if selected
  if (selectedSpecialFile) {
    if (useCloudinary) {
      if (btnSubmit) {
        btnSubmit.textContent = 'Uploading Media...';
        btnSubmit.disabled = true;
      }

      uploadToCloudinary(selectedSpecialFile, (url) => {
        selectedSpecialFile = null;
        saveSpecial(url);
      }, (err) => {
        if (btnSubmit) {
          btnSubmit.textContent = originalText;
          btnSubmit.disabled = false;
        }
        alert("Failed to upload Today's Special to Cloudinary: " + err);
      });
    } else {
      if (useGoogleSheets) {
        alert("Google Sheets database is active, but file uploads require Cloudinary. Please configure Cloudinary in js/api-config.js or paste an image URL instead.");
      } else {
        saveSpecial(imageVal);
      }
    }
  } else {
    saveSpecial(imageVal);
  }
}

// Custom Orders list view
function renderCustomOrdersList() {
  const container = document.getElementById('custom-orders-container');
  if (!container) return;

  const renderOrders = (orders) => {
    // Cache local copy for reference
    localStorage.setItem('custom_orders', JSON.stringify(orders));

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center text-muted py-5 glass-card">
          <i class="fas fa-folder-open d-block mb-3" style="font-size:3rem; color:var(--rose-gold-light);"></i>
          No custom flower design orders have been submitted yet.
        </div>
      `;
      return;
    }

    let cards = '';
    orders.forEach(order => {
      const isVideo = order.mediaUrl && (order.mediaUrl.startsWith('data:video/') || order.mediaUrl.endsWith('.mp4') || order.mediaUrl.endsWith('.webm') || order.mediaUrl.includes('video/upload'));
      cards += `
        <div class="col-12 col-md-6 mb-4" id="order-card-${order.id}">
          <div class="glass-card">
            <div class="d-flex justify-content-between align-items-start mb-3 border-bottom pb-2">
              <div>
                <h4 class="mb-1 text-primary">Custom Order Request</h4>
                <p class="text-muted m-0" style="font-size:0.85rem;"><i class="far fa-calendar-alt"></i> Submitted: ${new Date(order.timestamp).toLocaleString()}</p>
              </div>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteCustomOrder('${order.id}')">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
            </div>
            
            <div class="row align-items-center">
              ${order.mediaUrl ? `
                <div class="col-4">
                  ${isVideo ? `
                    <video src="${order.mediaUrl}" class="img-fluid rounded border shadow-sm" style="max-height: 120px; object-fit: cover; width:100%;" autoplay muted loop></video>
                  ` : `
                    <img src="${order.mediaUrl}" alt="Reference design" class="img-fluid rounded border shadow-sm" style="max-height: 120px; object-fit: cover; width:100%;">
                  `}
                </div>
              ` : ''}
              <div class="${order.mediaUrl ? 'col-8' : 'col-12'}">
                <p class="mb-1"><strong>Client:</strong> ${order.name}</p>
                <p class="mb-1"><strong>Mobile:</strong> <a href="tel:${order.phone}">${order.phone}</a> | <a href="https://wa.me/91${order.phone}" target="_blank" class="text-success"><i class="fab fa-whatsapp"></i> Chat</a></p>
                <p class="mb-0 mt-2 p-2 bg-light rounded text-dark-brown" style="font-size:0.9rem; font-style:italic;">"${order.details}"</p>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = cards;
  };

  if (useGoogleSheets) {
    fetch(`${apiConfig.googleAppScriptUrl}?action=getCustomOrders`)
      .then(r => r.json())
      .then(orders => {
        renderOrders(orders);
      })
      .catch(err => {
        console.error("Google Sheets custom orders read error:", err);
        renderOrders(JSON.parse(localStorage.getItem('custom_orders')) || []);
      });
  } else {
    renderOrders(JSON.parse(localStorage.getItem('custom_orders')) || []);
  }
}

window.deleteCustomOrder = function(orderId) {
  if (!confirm('Are you sure you want to delete this custom order?')) return;

  if (useGoogleSheets) {
    const payload = {
      action: "deleteCustomOrder",
      id: orderId
    };
    callGoogleScript(payload, () => {
      alert('Custom request deleted from Google Sheet!');
      renderCustomOrdersList();
      renderDashboardStats();
    }, (err) => {
      alert("Failed to delete custom order: " + err);
    });
  } else {
    let orders = JSON.parse(localStorage.getItem('custom_orders')) || [];
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem('custom_orders', JSON.stringify(orders));
    renderCustomOrdersList();
    renderDashboardStats();
  }
};

// Canvas Image Compression Helper (used for LocalStorage fallback previews)
function compressImage(base64Str, maxWidth, callback) {
  const img = new Image();
  img.src = base64Str;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    // Compress as JPEG with 0.7 quality
    const compressed = canvas.toDataURL('image/jpeg', 0.7);
    callback(compressed);
  };
  img.onerror = () => {
    callback(base64Str); // Fallback to raw if error
  };
}

// --- Gallery Management Implementation ---

const DEFAULT_GALLERY_ITEMS = [
  {
    image: "https://res.cloudinary.com/dkso3uujn/image/upload/v1782299563/r6j6mjsxg9sgrlzrpwpa.jpg",
    title: "Ganesh Chaturthi Floral Backdrop Decoration",
    category: "festivals"
  },
  {
    image: "https://res.cloudinary.com/dkso3uujn/image/upload/v1782299565/gh3gdrahnwq229aoadcu.jpg",
    title: "Festive Yellow Marigold Garlands",
    category: "garlands"
  },
  {
    image: "https://res.cloudinary.com/dkso3uujn/image/upload/v1782299567/lwnh67gyjfuy8xva2sav.jpg",
    title: "Traditional Rose & White Mogra Varmala",
    category: "garlands"
  },
  {
    image: "https://res.cloudinary.com/dkso3uujn/image/upload/v1782299569/wukqqutek3iz3esrflvb.jpg",
    title: "Traditional Marigold Toran with Golden Bells",
    category: "decorations"
  },
  {
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    title: "Luxury Mandap Wedding Floral Backdrop",
    category: "weddings"
  },
  {
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80",
    title: "Premium Rose Gold Bridal Bouquet",
    category: "bouquets"
  },
  {
    image: "https://images.unsplash.com/photo-1774024872435-97b094b1215f?auto=format&fit=crop&w=800&q=80",
    title: "Traditional Rose & Mogra Varmala",
    category: "garlands"
  },
  {
    image: "https://images.unsplash.com/photo-1603566719262-4f3df9f9ce77?auto=format&fit=crop&w=800&q=80",
    title: "Auspicious Diwali Floral Puja Thali Setup",
    category: "festivals"
  },
  {
    image: "https://images.unsplash.com/photo-1771613934220-1158b37be523?auto=format&fit=crop&w=800&q=80",
    title: "Traditional House Entrance Garland Pillars",
    category: "decorations"
  },
  {
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    title: "Wedding Reception Hall floral decor",
    category: "weddings"
  },
  {
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
    title: "Vibrant Lily & Carnation Bouquet",
    category: "bouquets"
  },
  {
    image: "https://images.unsplash.com/photo-1760963809680-dbc4b0366948?auto=format&fit=crop&w=800&q=80",
    title: "Temple Chariot Marigold Garland Strings",
    category: "garlands"
  },
  {
    image: "https://images.unsplash.com/photo-1605000797439-75a150088d44?auto=format&fit=crop&w=800&q=80",
    title: "Ganesh Chaturthi Toran and Flower Backdrop",
    category: "festivals"
  },
  {
    image: "https://images.unsplash.com/photo-1771507057503-80b78ae57e09?auto=format&fit=crop&w=800&q=80",
    title: "Elegant Car Bonnet Flower Garland Setup",
    category: "decorations"
  }
];

function renderGalleryTable() {
  const tbody = document.getElementById('gallery-tbody');
  if (!tbody) return;

  const customItems = JSON.parse(localStorage.getItem('custom_gallery_items')) || [];
  let rows = '';
  
  // Custom items (Deletable)
  customItems.forEach((item) => {
    rows += `
      <tr>
        <td class="align-middle">
          <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
        </td>
        <td class="align-middle fw-semibold">${item.title}</td>
        <td class="align-middle text-capitalize">${item.category}</td>
        <td class="align-middle"><span class="badge bg-success">Custom</span></td>
        <td class="align-middle">
          <button class="btn btn-sm btn-outline-danger" onclick="deleteGalleryItem('${item.id}')">
            <i class="fas fa-trash-alt"></i> Delete
          </button>
        </td>
      </tr>
    `;
  });

  // Default items (Static System Items)
  DEFAULT_GALLERY_ITEMS.forEach((item) => {
    rows += `
      <tr class="table-light text-muted">
        <td class="align-middle">
          <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; filter: grayscale(30%); opacity: 0.8;">
        </td>
        <td class="align-middle">${item.title}</td>
        <td class="align-middle text-capitalize">${item.category}</td>
        <td class="align-middle"><span class="badge bg-secondary">System</span></td>
        <td class="align-middle">
          <button class="btn btn-sm btn-outline-secondary" disabled>
            <i class="fas fa-lock"></i> Locked
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rows;
}

function handleGalleryFormSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('gal-title').value.trim();
  const category = document.getElementById('gal-category').value;
  const imageVal = document.getElementById('gal-image').value.trim();
  const btnSubmit = document.getElementById('btn-submit-gallery');
  const originalText = btnSubmit.textContent;

  const saveItem = (imageUrl) => {
    let customItems = JSON.parse(localStorage.getItem('custom_gallery_items')) || [];
    customItems.unshift({
      id: 'g-' + Date.now(),
      title,
      category,
      image: imageUrl
    });
    
    try {
      localStorage.setItem('custom_gallery_items', JSON.stringify(customItems));
      document.getElementById('gallery-form').reset();
      selectedGalleryFile = null;
      renderGalleryTable();
      alert('Gallery image added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save to browser storage! File size limit exceeded. Select a smaller media file.');
    }
  };

  if (selectedGalleryFile) {
    if (useCloudinary) {
      btnSubmit.textContent = 'Uploading...';
      btnSubmit.disabled = true;
      uploadToCloudinary(selectedGalleryFile, (url) => {
        saveItem(url);
        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;
      }, (err) => {
        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;
        alert("Cloudinary upload failed: " + err);
      });
    } else {
      saveItem(imageVal);
    }
  } else {
    saveItem(imageVal || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80');
  }
}

window.deleteGalleryItem = function(itemId) {
  if (!confirm('Are you sure you want to delete this custom gallery image?')) return;
  
  let customItems = JSON.parse(localStorage.getItem('custom_gallery_items')) || [];
  customItems = customItems.filter(item => item.id !== itemId);
  localStorage.setItem('custom_gallery_items', JSON.stringify(customItems));
  renderGalleryTable();
  alert('Gallery image deleted successfully!');
};
