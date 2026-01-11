const form = document.getElementById('forgotPasswordForm');
const messageOutput = document.getElementById('message');
const loader = document.getElementById('loader');
const countdownEl = document.getElementById('countdown');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  messageOutput.innerText = '';
  loader.style.display = 'block';
  loader.style.fontFamily = 'Noto Sans, serif';
  loader.style.fontSize = '18px';
  loader.style.fontWeight = 'bold';
  loader.style.textAlign = 'center';
  loader.style.color = '#e0ffff';
  loader.style.margin = '16px 0';

  let seconds = 5;
  countdownEl.innerText = `${seconds}`;

  // Countdown interval
  const timerCount = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      countdownEl.innerText = `${seconds}`;
    } else {
      countdownEl.innerText = '0';
      clearInterval(timerCount); // stop interval at 0
    }
  }, 1000);

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

    const text = await resp.text();
    messageOutput.innerText = text;
  } catch (err) {
    messageOutput.innerText = 'Error sending email';
    console.error(err);
  } finally {
    loader.style.display = 'none';
    countdownEl.innerText = ''; // reset countdown
    clearInterval(timerCount);   // make sure interval is cleared
  }
});
