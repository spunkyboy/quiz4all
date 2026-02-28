const form = document.getElementById('forgotPasswordForm');
const messageOutput = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  messageOutput.innerText = 'Sending request...';

  const email = new FormData(form).get('email');

  try {
    // Wait for both fetch and countdown to finish
    const [resp] = await Promise.all([
      fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }),
      new Promise((r) => setTimeout(r, 5000))
    ]);

    const textResponse = await resp.text();
    if (!resp.ok) {
      throw new Error( textResponse || 'Request failed');
    }
    messageOutput.innerText = textResponse;
  } catch (err) {
    messageOutput.innerText = 'Error sending email';
    console.error(err);
  } 
});
