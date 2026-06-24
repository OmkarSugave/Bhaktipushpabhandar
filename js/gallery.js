/* C:\Users\OMKAR\Documents\antigravity\bold-hypatia\js\gallery.js */

const GALLERY_ITEMS = [
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

document.addEventListener('DOMContentLoaded', () => {
  renderGalleryGrid();
  setupGalleryFilters();
  setupLightbox();
});

// --- Render Gallery Grid ---
function renderGalleryGrid() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  let gridHTML = '';
  GALLERY_ITEMS.forEach((item, index) => {
    gridHTML += `
      <div class="col-12 col-sm-6 col-md-4 gallery-item-wrapper" data-category="${item.category}" data-aos="fade-up" data-aos-delay="${index * 50}">
        <div class="product-card border-draw-hover mb-4" style="cursor: pointer;">
          <div class="product-img-wrapper" style="padding-top: 75%;">
            <img src="${item.image}" alt="${item.title}" class="product-img gallery-trigger-img">
          </div>
          <div class="product-card-body p-3">
            <span class="product-category">${item.category}</span>
            <h4 class="product-title m-0" style="font-size: 1rem;">${item.title}</h4>
          </div>
        </div>
      </div>
    `;
  });

  grid.innerHTML = gridHTML;
}

// --- Category Filtering ---
function setupGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const items = document.querySelectorAll('.gallery-item-wrapper');

  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active class
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.dataset.filter;

      // Filter gallery cards
      items.forEach(item => {
        const itemCat = item.dataset.category;
        if (filterVal === 'all' || itemCat === filterVal) {
          item.style.display = 'block';
          // Re-trigger visual entry
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(item, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4 });
          }
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// --- Lightbox Functionality ---
function setupLightbox() {
  // Inject lightbox overlay modal HTML if missing
  if (!document.getElementById('lightbox-modal')) {
    const lightboxHTML = `
      <div class="lightbox-modal" id="lightbox-modal">
        <div class="lightbox-content">
          <button class="lightbox-close" id="lightbox-close">
            <i class="fas fa-times"></i>
          </button>
          <img src="" alt="" class="lightbox-img" id="lightbox-img">
          <div class="lightbox-caption" id="lightbox-caption"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
  }

  const modal = document.getElementById('lightbox-modal');
  const imgEl = document.getElementById('lightbox-img');
  const captionEl = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');

  if (!modal) return;

  // Listen to clicks on gallery images
  document.body.addEventListener('click', (e) => {
    const trigger = e.target.closest('.gallery-trigger-img');
    if (trigger) {
      imgEl.src = trigger.src;
      imgEl.alt = trigger.alt;
      captionEl.textContent = trigger.alt;
      
      modal.style.display = 'flex';
      setTimeout(() => {
        modal.classList.add('show');
      }, 50);
    }
  });

  const closeModal = () => {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 400);
  };

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Esc key closure
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
}
