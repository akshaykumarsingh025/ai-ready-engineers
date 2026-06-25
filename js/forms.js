// ==================== FORM VALIDATION & SUBMISSION ====================

const isNetlify = window.location.hostname.includes('netlify') || window.location.hostname.includes('ailearninghut');

// ---- Modal Popup ----
function showToast(message, type = 'success', onOk = null) {
  const old = document.querySelector('.toast-overlay');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.className = 'toast-overlay';
  overlay.innerHTML = `
    <div class="toast-modal toast-${type}">
      <div class="toast-icon">${type === 'success' ? '✅' : '❌'}</div>
      <p class="toast-msg">${message}</p>
      <button class="toast-ok-btn">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  overlay.querySelector('.toast-ok-btn').addEventListener('click', () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
    if (onOk) onOk();
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 300);
      if (onOk) onOk();
    }
  });
}

// ---- Validators ----
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const c = phone.replace(/[\s\-\(\)\.]/g, '');
  return /^(\+91|91|0)?[6-9]\d{9}$/.test(c);
}

function isValidName(name) {
  return /^[a-zA-Z\s]{2,50}$/.test(name.trim());
}

function showFieldError(field, message) {
  field.classList.add('border-red-500');
  field.classList.remove('border-slate-200');
  let err = field.parentElement.querySelector('.field-error');
  if (!err) {
    err = document.createElement('span');
    err.className = 'field-error text-red-500 text-xs mt-1 block';
    field.parentElement.appendChild(err);
  }
  err.textContent = message;
}

function clearFieldError(field) {
  field.classList.remove('border-red-500');
  field.classList.add('border-slate-200');
  const err = field.parentElement.querySelector('.field-error');
  if (err) err.remove();
}

function validateField(field) {
  const value = field.value.trim();
  const type = field.getAttribute('type') || field.tagName.toLowerCase();
  const name = field.getAttribute('name');

  if (name === 'name') {
    if (!value) { showFieldError(field, 'Name is required'); return false; }
    if (!isValidName(value)) { showFieldError(field, 'Name must be 2-50 letters only'); return false; }
  }
  if (type === 'email') {
    if (!value) { showFieldError(field, 'Email is required'); return false; }
    if (!isValidEmail(value)) { showFieldError(field, 'Enter a valid email'); return false; }
  }
  if (type === 'tel') {
    if (!value) { showFieldError(field, 'Phone number is required'); return false; }
    if (!isValidPhone(value)) { showFieldError(field, 'Enter a valid 10-digit Indian phone number'); return false; }
  }
  if (field.tagName === 'SELECT') {
    if (!value) { showFieldError(field, 'Please select an option'); return false; }
  }
  if (field.tagName === 'TEXTAREA') {
    if (!value) { showFieldError(field, 'Message is required'); return false; }
    if (value.length < 10) { showFieldError(field, 'Message must be at least 10 characters'); return false; }
  }
  if (field.hasAttribute('required') && !value) {
    showFieldError(field, 'This field is required'); return false;
  }

  clearFieldError(field);
  return true;
}

function setupRealTimeValidation() {
  document.querySelectorAll('form').forEach(form => {
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('border-red-500')) validateField(input);
      });
    });
  });
}

// ---- Submit via hidden iframe (Netlify Forms compatible) ----
function submitViaIframe(form) {
  return new Promise((resolve) => {
    let iframe = document.getElementById('hidden-form-frame');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'hidden-form-frame';
      iframe.name = 'hidden-form-frame';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    form.setAttribute('target', 'hidden-form-frame');

    iframe.onload = () => {
      resolve(true);
    };

    form.submit();
  });
}

// ---- Google Sheets helper ----
async function sendToGoogleSheets(data) {
  try {
    await fetch('/.netlify/functions/submit-to-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.log('Sheets sync skipped:', e.message);
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

    let allValid = true;
    enrollForm.querySelectorAll('input:not([type="hidden"]):not([type="radio"]), select, textarea').forEach(field => {
      if (!validateField(field)) allValid = false;
    });

    const experienceSelected = enrollForm.querySelector('input[name="experience"]:checked');
    if (!experienceSelected) {
      allValid = false;
      showToast('Please select your experience level', 'error');
    }

    if (!allValid) {
      showToast('Please fix the errors above', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitText.textContent = 'Submitting...';
    submitSpinner.classList.remove('hidden');

    try {
      const formData = new FormData(enrollForm);

      if (isNetlify) {
        // Submit to Netlify Forms via hidden iframe
        await submitViaIframe(enrollForm);

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
        console.log('Local dev - Enrollment:', Object.fromEntries(formData));
        await new Promise(r => setTimeout(r, 600));
      }

      enrollForm.style.display = 'none';
      formSuccess.classList.remove('hidden');

      showToast('Enrollment submitted successfully!', 'success', () => {
        enrollForm.reset();
        enrollForm.style.display = '';
        formSuccess.classList.add('hidden');
        submitBtn.disabled = false;
        submitText.textContent = 'Submit Enrollment';
        submitSpinner.classList.add('hidden');
        enrollForm.removeAttribute('target');
        document.getElementById('enroll').scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    } catch (err) {
      console.error(err);
      showToast('Something went wrong. Please try again.', 'error');
      submitBtn.disabled = false;
      submitText.textContent = 'Submit Enrollment';
      submitSpinner.classList.add('hidden');
      enrollForm.removeAttribute('target');
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
      showFieldError(emailInput, 'Enter a valid email');
      return;
    }
    clearFieldError(emailInput);

    try {
      if (isNetlify) {
        await submitViaIframe(newsletterForm);
      } else {
        console.log('Local dev - Newsletter:', emailInput.value);
        await new Promise(r => setTimeout(r, 400));
      }
      showToast('Subscribed successfully!', 'success', () => {
        newsletterForm.reset();
        newsletterForm.removeAttribute('target');
      });
    } catch (e) {
      showToast('Subscription failed.', 'error');
      newsletterForm.removeAttribute('target');
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

    let allValid = true;
    contactForm.querySelectorAll('input, select, textarea').forEach(field => {
      if (!validateField(field)) allValid = false;
    });

    if (!allValid) {
      showToast('Please fix the errors above', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';

    try {
      const formData = new FormData(contactForm);

      if (isNetlify) {
        await submitViaIframe(contactForm);
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
        console.log('Local dev - Contact:', Object.fromEntries(formData));
        await new Promise(r => setTimeout(r, 600));
      }

      contactForm.reset();
      showToast('Message sent successfully!', 'success', () => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.removeAttribute('target');
      });
    } catch (err) {
      showToast('Failed to send. Please try again.', 'error', () => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.removeAttribute('target');
      });
    }
  });
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', setupRealTimeValidation);
