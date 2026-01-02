const form = document.getElementById('forgotPasswordForm');
const messageOutput = document.getElementById('message');
const loader = document.getElementById('loader');
const countdownEl = document.getElementById('countdown');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  messageOutput.innerText = '';
  loader.style.display = 'block';
  loader.style.fontFamily = 'Noto Sans, serif';   // set font
  loader.style.fontSize = '18px';                  // font size
  loader.style.fontWeight = 'bold';                // bold text
  loader.style.textAlign = 'center';               // center text horizontally
  loader.style.color = '#e0ffff';                  // text color
  loader.style.margin = '16px 0';  
 
 
  let seconds = 5;
  countdownEl.innerText = seconds;
  
  // Start countdown interval
  const timerCount = setInterval(() => {
    seconds--;
    countdownEl.innerText = seconds;
    if (seconds <= 0) {
      clearInterval(timerCount);
    }
  }, 1000);

  const formData = new FormData(form);
  const email = formData.get('email');

  try {
    const resPromised = fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    // Wait for **both fetch AND countdown** to finish/ destructure and res take the fist or grab the first value
    const [resp] = await Promise.all([resPromised, new Promise(r => setTimeout(r, 5000))]);

    const text = await resp.text();
    messageOutput.innerText = text;
  } catch (err) {
    messageOutput.innerText = 'Error sending email';
    console.error(err);
  } finally {
    loader.style.display = 'none';
    clearInterval(timerCount);
  }
});
