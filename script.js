document.getElementById('navToggle').addEventListener('click', () => {
  document.getElementById('mainNav').classList.toggle('open');
});

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mainNav').classList.remove('open');
  });
});

const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    contactStatus.textContent = 'Sending message...';
    contactStatus.className = 'contact-status';

    const formData = new FormData(contactForm);
    const body = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      message: formData.get('message').trim(),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message.');
      }

      contactStatus.textContent = 'Message sent — thank you! We will respond shortly.';
      contactStatus.classList.add('success');
      contactForm.reset();
    } catch (error) {
      contactStatus.textContent = error.message || 'Unable to connect to the server.';
      contactStatus.classList.add('error');
    }
  });
}
