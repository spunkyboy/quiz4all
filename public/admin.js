// Elements
  const adminForm = document.getElementById('authForm');
  const toggleFormBtn = document.getElementById('toggleFormBtn');
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  const message = document.getElementById('message');

  // Show/hide password toggle
  document.getElementById('password-show').addEventListener('change', function(){
    const passwordInput = document.getElementById('password');
    passwordInput.type = this.checked ? 'text' : 'password';
  });

  let isSignIn = true;

  // Toggle between Sign In / Sign Up
  toggleFormBtn.addEventListener('click', () => {
    isSignIn = !isSignIn;
    formTitle.textContent = isSignIn ? 'Admin Sign In' : 'Admin Sign Up';
    submitBtn.textContent = isSignIn ? 'Sign In' : 'Sign Up';
    toggleFormBtn.textContent = isSignIn ? 'Create an admin account' : 'Back to sign in';
    message.textContent = '';
    adminForm.reset(); // Clear password and email inputs
  });


  // Handle form submit
adminForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Use relative URLs (works locally + in production)
  const endpoint = isSignIn
    ? '/api/auth/admin/signin'
    : '/api/auth/admin/signup';

  try {
    message.style.color = '#e6a522';
    message.textContent = 'Processing...';

    const res = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Authentication failed');
    }

    //  Success
    message.style.color = '#30E877';
    message.textContent = data.message || 'Success';

    document.getElementById('authForm').reset();

    //  Redirect immediately after successful sign-in
    if (isSignIn) {
      window.location.href = '/adminAccount';
    }

  } catch (error) {
    message.style.color = 'red';
    message.textContent = error.message || 'Server error';
  }
});

  
 // For mobile scroll for all portrait content to show  and landscape all content to show-->
  function setViewportHeight() {
    const veiwHeight = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${veiwHeight}px`);
  }
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);

