/* Public contact details. The forms prepare an email draft; they do not submit automatically. */
const SITE_CONFIG = {
  businessEmail: 'pjreed5@jhericon.com',
  businessPhone: '(571) 220-1280'  // JHERICON LLC business phone
};

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}));
document.querySelector('#year').textContent = String(new Date().getFullYear());

if (SITE_CONFIG.businessEmail) {
  const emailNode = document.querySelector('#email-display');
  const emailLink = document.createElement('a');
  emailLink.href = `mailto:${SITE_CONFIG.businessEmail}`;
  emailLink.textContent = SITE_CONFIG.businessEmail;
  if (emailNode) emailNode.replaceWith(emailLink);
}
if (SITE_CONFIG.businessPhone) {
  const phoneNode = document.querySelector('#phone-display');
  const phoneLink = document.createElement('a');
  phoneLink.href = `tel:${SITE_CONFIG.businessPhone.replace(/[^+\d]/g, '')}`;
  phoneLink.textContent = SITE_CONFIG.businessPhone;
  if (phoneNode) phoneNode.replaceWith(phoneLink);
}

document.querySelectorAll('[data-program]').forEach(link => link.addEventListener('click', () => {
  const select = document.querySelector('#program-select');
  if (select) select.value = link.dataset.program;
}));

async function submitInquiry(event, kind, feedbackId) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const feedback = document.getElementById(feedbackId);
  const button = form.querySelector('button[type="submit"]');
  const originalText = button.textContent;
  feedback.classList.remove('error', 'success');
  feedback.textContent = 'Sending your inquiry...';
  button.disabled = true;
  button.textContent = 'Sending...';
  const values = Object.fromEntries(new FormData(form).entries());
  values.kind = kind;
  values.consent = kind === 'training' ? Boolean(form.querySelector('[name="consent"]')?.checked) : undefined;
  try {
    const response = await fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Your message could not be sent.');
    feedback.classList.add('success');
    feedback.textContent = 'Thank you! Your inquiry was sent to JHERICON. We will follow up using the contact information you provided.';
    form.reset();
  } catch (err) {
    feedback.classList.add('error');
    feedback.textContent = `${err.message} You can also email pjreed5@jhericon.com directly.`;
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

document.querySelector('#contact-form')?.addEventListener('submit', event => submitInquiry(event, 'contact', 'contact-feedback'));
document.querySelector('#interest-form')?.addEventListener('submit', event => submitInquiry(event, 'training', 'interest-feedback'));
