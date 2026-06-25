// ==================== NAVBAR SCROLL EFFECT ====================
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll);
handleNavbarScroll();

// ==================== MOBILE MENU ====================
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const hamburgerIcon = document.getElementById('hamburger-icon');
const closeIcon = document.getElementById('close-icon');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      mobileMenu.classList.remove('open');
      mobileMenu.classList.add('hidden');
      hamburgerIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    } else {
      mobileMenu.classList.remove('hidden');
      mobileMenu.classList.add('open');
      hamburgerIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
    }
  });
}

// Close mobile menu on link click
document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    mobileMenu.classList.add('hidden');
    hamburgerIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');
  });
});

// ==================== SCROLL REVEAL ANIMATIONS ====================
function setupScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// ==================== COUNTER ANIMATION ====================
function animateCounters() {
  const counters = document.querySelectorAll('.counter');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.ceil(current) + '+';
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target + '+';
          }
        };

        updateCounter();
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ==================== ACTIVE NAV LINK ====================
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '/' && href === '/')) {
      link.classList.add('text-primary-600');
      link.classList.remove('text-slate-700');
    }
  });
}

// ==================== COURSE FILTER (courses.html) ====================
function setupCourseFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const courseCards = document.querySelectorAll('.course-item');

  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      courseCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-level') === filter) {
          card.style.display = 'block';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.transition = 'all 0.4s ease';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

// ==================== FAQ ACCORDION ====================
function setupFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    question.addEventListener('click', () => {
      const isOpen = answer.style.maxHeight;

      // Close all
      faqItems.forEach(i => {
        i.querySelector('.faq-answer').style.maxHeight = null;
        i.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
      });

      // Open clicked if it was closed
      if (!isOpen) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}

// ==================== TESTIMONIAL CAROUSEL ====================
function setupTestimonialCarousel() {
  const container = document.querySelector('.testimonial-track');
  if (!container) return;

  let currentSlide = 0;
  const slides = container.querySelectorAll('.testimonial-slide');
  const totalSlides = slides.length;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.style.transform = `translateX(${(i - index) * 100}%)`;
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
  }

  // Auto-advance every 5 seconds
  setInterval(nextSlide, 5000);
  showSlide(0);
}

// ==================== TYPING EFFECT ====================
function typeWriter(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
  setupScrollReveal();
  animateCounters();
  setActiveNavLink();
  setupCourseFilter();
  setupFAQ();
  setupTestimonialCarousel();

  // Add reveal classes to sections
  document.querySelectorAll('section').forEach(section => {
    const children = section.querySelectorAll('.glass-card, h2, h3, p');
    children.forEach((child, index) => {
      child.classList.add('reveal');
      child.style.transitionDelay = `${index * 0.1}s`;
    });
  });

  // Re-observe after adding classes
  setupScrollReveal();
});

// ==================== PAGE LOAD ANIMATION ====================
window.addEventListener('load', () => {
  document.body.classList.add('page-enter');
});
