/* C:\Users\OMKAR\Documents\antigravity\bold-hypatia\js\app.js */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initLoadingScreen();
  initPetalsCanvas();
  initMobileMenuClose();
});

// --- Scroll state for Navbar ---
function initNavbarScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  const checkScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', checkScroll);
  checkScroll();
}

// --- Loading Screen and GSAP / AOS Intro animations ---
function initLoadingScreen() {
  const loader = document.getElementById('loading-screen');
  
  const fadeOutLoader = () => {
    if (loader) {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
    }
    
    // Trigger GSAP and AOS animations
    setTimeout(() => {
      // Initialize AOS
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 1000,
          once: true,
          offset: 120
        });
      }

      // Initialize GSAP
      if (typeof gsap !== 'undefined' && document.querySelector('.hero-title')) {
        const tl = gsap.timeline();
        
        // Stagger hero text and buttons
        tl.fromTo('.hero-tagline', 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
        tl.fromTo('.hero-title', 
          { opacity: 0, y: 40 }, 
          { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' },
          '-=0.5'
        );
        tl.fromTo('.hero-subtitle', 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.6'
        );
        tl.fromTo('.hero-buttons .btn-premium', 
          { opacity: 0, scale: 0.9, y: 20 }, 
          { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.7)' },
          '-=0.4'
        );
        tl.fromTo('.scroll-indicator', 
          { opacity: 0 }, 
          { opacity: 0.8, duration: 0.5 }
        );
      }
    }, loader ? 400 : 0);
  };

  // Wait for full window load or fallback timer
  window.addEventListener('load', fadeOutLoader);
  setTimeout(fadeOutLoader, 3000); // 3-second safety timeout
}

// --- High-Performance Falling Petals Animation (Canvas) ---
function initPetalsCanvas() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Set canvas size
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const petalColors = [
    'rgba(231, 84, 128, 0.25)',  // Soft Floral Pink
    'rgba(255, 181, 167, 0.3)',  // Soft Peach/Rose
    'rgba(183, 110, 121, 0.25)',  // Rose Gold
    'rgba(253, 251, 247, 0.4)'   // Elegant Cream
  ];

  const maxPetals = window.innerWidth < 768 ? 20 : 45;
  const petals = [];

  class Petal {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height; // Distribute vertically on start
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -20 - (Math.random() * 50);
      this.size = 6 + Math.random() * 10;
      this.speedY = 1 + Math.random() * 2;
      this.speedX = -1 + Math.random() * 2;
      this.angle = Math.random() * Math.PI;
      this.angleVelocity = 0.01 + Math.random() * 0.02;
      this.drift = Math.random() * 0.5;
      this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
      this.rotation = Math.random() * 360;
      this.rotationSpeed = -1 + Math.random() * 2;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.angle) * this.drift;
      this.angle += this.angleVelocity;
      this.rotation += this.rotationSpeed;

      // Reset when petal reaches bottom or goes off side boundaries
      if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation * Math.PI / 180);
      
      // Draw organic petal shape using curves
      ctx.beginPath();
      ctx.moveTo(0, 0);
      // Left curve
      ctx.bezierCurveTo(-this.size / 2, this.size / 4, -this.size / 2, this.size, 0, this.size * 1.5);
      // Right curve
      ctx.bezierCurveTo(this.size / 2, this.size, this.size / 2, this.size / 4, 0, 0);
      
      ctx.fillStyle = this.color;
      ctx.fill();
      
      // Add a soft center vein
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, this.size);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  // Populate petals
  for (let i = 0; i < maxPetals; i++) {
    petals.push(new Petal());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    petals.forEach(petal => {
      petal.update();
      petal.draw();
    });

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}

// --- Close mobile navigation menu on clicking a nav item ---
function initMobileMenuClose() {
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  if (!navbarCollapse) return;
  
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
    });
  });
}
