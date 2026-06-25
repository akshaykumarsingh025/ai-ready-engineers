// ==================== FORM VALIDATION & SUBMISSION ====================

// Detect if running on Netlify
const isNetlify = window.location.hostname.includes('netlify') || window.location.hostname.includes('ailearninghut');

// Toast notification helper
function showToast(message, type = 'success') {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone format (Indian numbers)
function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^(\+91|91|0)?[6-9]\d{9}$/.test(cleaned);
}

// Real-time validation
function setupRealTimeValidation() {
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('border-red-500')) {
          validateField(input);
        }
      });
    });
  });
}

// Validate single field
function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';

  // Required check
  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = 'This field is required';
  }

  // Email validation
  if (isValid && field.type === 'email' && value && !isValidEmail(value)) {
    isValid = false;
    errorMessage = 'Please enter a valid email address';
  }

  // Phone validation
  if (isValid && field.type === 'tel' && value && !isValidPhone(value)) {
    isValid = false;
    errorMessage = 'Please enter a valid phone number';
  }

  // Show/hide error
  const errorEl = field.parentElement.querySelector('.field-error');
  if (!isValid) {
    field.classList.add('border-red-500');
    field.classList.remove('border-slate-200');
    if (!errorEl) {
      const error = document.createElement('span');
      error.className = 'field-error text-red-500 text-xs mt-1 block';
      error.textContent = errorMessage;
      field.parentElement.appendChild(error);
    } else {
      errorEl.textContent = errorMessage;
    }
  } else {
    field.classList.remove('border-red-500');
    field.classList.add('border-slate-200');
    if (errorEl) errorEl.remove();
  }

  return isValid;
}

// Submit form to Netlify Forms
async function submitToNetlify(form) {
  const formData = new FormData(form);
  const response = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formData).toString()
  });
  return response.ok;
}

// Send data to Google Sheets (Netlify Function)
async function sendToGoogleSheets(data) {
  try {
    await fetch('/.netlify/functions/submit-to-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.log('Google Sheets sync skipped:', e.message);
  }
}

// ==================== ENROLLMENT FORM ====================
const enrollForm = document.getElementById('enroll-form');

if (enrollForm) {
  enrollForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');
    const formSuccess = document.getElementById('form-success');

    // Validate all fields
    const requiredFields = enrollForm.querySelectorAll('[required]');
    let allValid = true;

    requiredFields.forEach(field => {
      if (field.type === 'radio') {
        const radioGroup = enrollForm.querySelectorAll(`[name="${field.name}"]`);
        const isSelected = Array.from(radioGroup).some(r => r.checked);
        if (!isSelected) allValid = false;
      } else {
        if (!validateField(field)) allValid = false;
      }
    });

    // Check radio buttons specifically
    const experienceSelected = enrollForm.querySelector('input[name="experience"]:checked');
    if (!experienceSelected) {
      allValid = false;
      showToast('Please select your experience level', 'error');
      return;
    }

    if (!allValid) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Submitting...';
    submitSpinner.classList.remove('hidden');

    try {
      const formData = new FormData(enrollForm);

      if (isNetlify) {
        // Production: submit to Netlify Forms
        const success = await submitToNetlify(enrollForm);
        if (!success) throw new Error('Netlify submission failed');

        // Also send to Google Sheets
        await sendToGoogleSheets({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          course: formData.get('course'),
          experience: formData.get('experience'),
          message: formData.get('message'),
          timestamp: new Date().toISOString()
        });
      } else {
        // Local development: simulate success
        console.log('📦 Local dev - Form data:', Object.fromEntries(formData));
        await new Promise(r => setTimeout(r, 800)); // Simulate network delay
      }

      // Show success
      enrollForm.style.display = 'none';
      formSuccess.classList.remove('hidden');
      showToast('Enrollment submitted successfully!', 'success');

    } catch (error) {
      console.error('Error:', error);
      showToast('Something went wrong. Please try again.', 'error');
      submitBtn.disabled = false;
      submitText.textContent = 'Submit Enrollment';
      submitSpinner.classList.add('hidden');
    }
  });
}

// ==================== NEWSLETTER FORM ====================
const newsletterForm = document.getElementById('newsletter-form');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = newsletterForm.querySelector('input[type="email"]');
    if (!isValidEmail(emailInput.value)) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    try {
      if (isNetlify) {
        const formData = new FormData(newsletterForm);
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        });
        if (!response.ok) throw new Error('Failed');
      } else {
        console.log('📦 Local dev - Newsletter:', emailInput.value);
        await new Promise(r => setTimeout(r, 500));
      }

      showToast('Subscribed successfully!', 'success');
      emailInput.value = '';
    } catch (error) {
      showToast('Subscription failed. Please try again.', 'error');
    }
  });
}

// ==================== CONTACT FORM ====================
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Validate
    const requiredFields = contactForm.querySelectorAll('[required]');
    let allValid = true;
    requiredFields.forEach(field => {
      if (!validateField(field)) allValid = false;
    });

    if (!allValid) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending... <span class="animate-spin inline-block">⏳</span>';

    try {
      const formData = new FormData(contactForm);

      if (isNetlify) {
        // Production: submit to Netlify Forms
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        });
        if (!response.ok) throw new Error('Failed');

        // Also send to Google Sheets
        await sendToGoogleSheets({
          formType: 'contact',
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          subject: formData.get('subject'),
          message: formData.get('message'),
          timestamp: new Date().toISOString()
        });
      } else {
        // Local development: simulate success
        console.log('📦 Local dev - Contact form:', Object.fromEntries(formData));
        await new Promise(r => setTimeout(r, 800));
      }

      contactForm.reset();
      showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
    } catch (error) {
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
  setupRealTimeValidation();
});
