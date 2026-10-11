/* Configure this when JHERICON's business email and phone are finalized. */
const SITE_CONFIG = {
  businessEmail: '', // Example: info@yourdomain.com
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

function prepareEmail(form, subject, content, feedback) {
  if (!form.reportValidity()) return;
  if (!SITE_CONFIG.businessEmail) {
    feedback.textContent = 'The JHERICON business email has not been configured yet. Please check back when contact details are published.';
    feedback.classList.add('error');
    return;
  }
  const mailto = `mailto:${SITE_CONFIG.businessEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
  feedback.classList.remove('error');
  feedback.textContent = 'Your email application should open with a draft. Review and send the message there; no information was submitted through this website.';
  window.location.href = mailto;
}

document.querySelector('#interest-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const f = event.currentTarget;
  const data = new FormData(f);
  const name = `${data.get('firstName')} ${data.get('lastName')}`;
  const content = `Training interest inquiry\n\nName: ${name}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || 'Not provided'}\nLearning preference: ${data.get('delivery')}\nArea of interest: ${data.get('program')}\nLearning goals: ${data.get('message') || 'Not provided'}\n\nI understand this is an inquiry, not enrollment in a confirmed class.`;
  prepareEmail(f, `JHERICON training interest - ${data.get('program')}`, content, document.querySelector('#interest-feedback'));
});

document.querySelector('#contact-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const f = event.currentTarget;
  const data = new FormData(f);
  const content = `General inquiry\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nType: ${data.get('type')}\n\nMessage:\n${data.get('message')}`;
  prepareEmail(f, `JHERICON inquiry - ${data.get('type')}`, content, document.querySelector('#contact-feedback'));
});
