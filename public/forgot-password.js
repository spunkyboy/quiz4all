const form = document.getElementById('forgotPasswordForm');
const messageOutput = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  messageOutput.innerText = 'Sending request...';

  const email = new FormData(form).get('email');

  try {
    const resp = await fetch('https://quiz4all-ygm1.onrender.com/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const textResponse = await resp.text();
    if (!resp.ok) {
      throw new Error(textResponse || 'Request failed');
    }
    messageOutput.innerText = textResponse;
  } catch (err) {
    messageOutput.innerText = 'Error sending email';
    console.error(err);
  }
});
