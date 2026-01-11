
let quizData = [];
let currentQuestionIndex = 0;
let userAnswers = [];

function showSignIn() {
    document.getElementById('signin-heading').classList.add('active');
    document.getElementById('signup-heading').classList.remove('active');
    document.getElementById('quiz-page').classList.remove('active');
    document.getElementById('result-page').classList.remove('active');
}

  const signInBtn = document.getElementById('signIn-btn');
  if (signInBtn) {
    signInBtn.addEventListener('click',showSignIn);
  }

function showSignUp() {
    document.getElementById('signup-heading').classList.add('active');
    document.getElementById('signin-heading').classList.remove('active');
}

  const signUpBtn = document.getElementById('show-Signup');
  if (signUpBtn) {
    signUpBtn.addEventListener('click', showSignUp);
  }

let startTime; // Variable to store the start time of the quiz

function showQuizPage() {
    document.getElementById('quiz-page').classList.add('active');
    document.getElementById('signin-heading').classList.remove('active');
    document.getElementById('signup-heading').classList.remove('active');
    document.getElementById('result-page').classList.remove('active');
    fetchQuestion();
      //Record the start time when the quiz page is shown
      startTime = new Date().getTime();
}

// Fetch from Backend (Once It's Connected)
const quizErrorModal = document.getElementById('quiz-error-modal');
const quizErrorMessage = document.getElementById('quiz-error-message');
const closeQuizErrorBtn = document.getElementById('close-quiz-error-btn');

closeQuizErrorBtn.addEventListener('click', () => {
  quizErrorModal.classList.add('hidden'); // hide modal
});

// Fetch quiz data
async function fetchQuizDataAndStart() {
  try {
    // throw new Error('Simulated network error');
    const res = await fetch('/api/quiz', {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      let message = '';
      if (res.status === 401 || res.status === 403) {
        message = 'Unauthorized. Please log in again.';
      } else {
        message = `Error fetching quiz: ${res.statusText}`;
      }

      quizErrorMessage.textContent = message;
      quizErrorModal.classList.remove('hidden'); // show modal
      return;
    }

    const data = await res.json();
    quizData = data.questions || data; 
    shuffleQuestions();
    showQuizPage(); // load the quiz

  } catch (err) {
    quizErrorMessage.textContent = 'Failed to load quiz. Make sure you are logged in.';
    quizErrorModal.classList.remove('hidden'); // show modal
    console.error(err);
  }
}
// Fetch question
function fetchQuestion() {
  const progress = document.getElementById('quiz-progress');
  progress.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;

  const questionContainer = document.getElementById('question-container');
  const questionData = quizData[currentQuestionIndex];

  // Clear previous content safely
  questionContainer.textContent = '';

  // No questions case
  if (!questionData) {
    const p = document.createElement('p');
    p.textContent = 'No questions available.';
    p.style.textAlign = 'center';
    p.style.color = 'red';
    p.style.fontWeight = 'bold';
    p.style.fontSize = '1.2rem';
    questionContainer.appendChild(p);
    return;
  }

  // BUILD QUIZ UI 
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'quiz-class';

  const legend = document.createElement('legend');
  legend.className = 'quiz-question';
  legend.textContent = questionData.question;
  fieldset.appendChild(legend);

  const optionsWrapper = document.createElement('div');
  optionsWrapper.className = 'quiz-radio-text';

  questionData.options.forEach((option, idx) => {
    const optionWrapper = document.createElement('div');
    optionWrapper.className = 'option-wrapper';

    const input = document.createElement('input');
    input.className = 'all-input'
    input.type = 'radio';
    input.name = 'answer';
    input.id = `option-${idx}`;
    input.value = option;
    input.setAttribute('aria-label', option);

    const label = document.createElement('label');
    label.className = 'option-label';
    label.htmlFor = input.id;
    label.textContent = option;

    optionWrapper.appendChild(input);
    optionWrapper.appendChild(label);
    optionsWrapper.appendChild(optionWrapper);
  });

  fieldset.appendChild(optionsWrapper);
  questionContainer.appendChild(fieldset);

  //  Button logic
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const radios = document.querySelectorAll('input[name="answer"]');

  nextBtn.disabled = true;
  submitBtn.disabled = true;

  if (currentQuestionIndex === quizData.length - 1) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'inline-block';
  } else {
    nextBtn.style.display = 'inline-block';
    submitBtn.style.display = 'none';
  }

  // Restore saved answer
  const savedAnswer = userAnswers[currentQuestionIndex];
  if (savedAnswer) {
    const radio = document.querySelector(`input[value="${savedAnswer}"]`);
    if (radio) {
      radio.checked = true;
      enableNavButtons();
    }
  }

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      userAnswers[currentQuestionIndex] = radio.value;
      enableNavButtons();
    });
  });

  function enableNavButtons() {
    if (currentQuestionIndex === quizData.length - 1) {
      submitBtn.disabled = false;
    } else {
      nextBtn.disabled = false;
    }
  }
}

// Request user name
async function requestUsername() {
  return new Promise(resolve => {
    const modal = document.getElementById('username-modal');
    const input = document.getElementById('username-input');
    const saveBtn = document.getElementById('save-result-btn');
    const cancelBtn = document.getElementById('cancel-result-btn');

    if (!modal || !input || !saveBtn || !cancelBtn) return resolve(null);

    modal.classList.remove('hidden');
    input.value = '';
    input.focus();

    const cleanup = () => {
      modal.classList.add('hidden');
      saveBtn.onclick = null;
      cancelBtn.onclick = null;
    };

    saveBtn.onclick = () => {
      const value = input.value.trim();
      cleanup();
      resolve(value || null);
    };

    cancelBtn.onclick = () => {
      cleanup();
      resolve(null);
    };
  });
}

// Show results 
async function showResultPage() {
  const endTime = Date.now();
  const timeSpentMs = endTime - startTime;
  const hours = Math.floor(timeSpentMs / (1000 * 60 * 60));
  const minutes = Math.floor((timeSpentMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeSpentMs % (1000 * 60)) / 1000);
  const formattedTime = `${hours}:${minutes}:${seconds}s`;

  const answersPayload = quizData.map((q, idx) => ({
    id: q._id,
    answer: userAnswers[idx] ?? null
  }));

  let resultData;
  try {
    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answersPayload, timeTaken: formattedTime })
    });
    if (!res.ok) throw new Error('Quiz submission failed');
    resultData = await res.json();
  } catch (err) {
    console.error(err);
    return alert('Quiz submission failed');
  }

  const { score, total, isPassed } = resultData;
  const resultElement = document.getElementById('result');
  const retryBtn = document.getElementById('retry-btn');

  let resultMessage = isPassed
    ? `🎉 Congratulations! You passed with ${score} / ${total}`
    : `❌ You failed: ${score} / ${total}`;
  resultMessage += ` | Time: ${formattedTime}`;

  // --- DOMPurify + fallback for browsers without Trusted Types ---
  let trustedHTML;
  if (window.trustedTypes) {
    // Create a policy safely
    const policy = window.trustedTypes.createPolicy('dompurify-policy', {
      createHTML: (s) => s
    });
    trustedHTML = DOMPurify.sanitize(resultMessage, {
      RETURN_TRUSTED_TYPE: true,
      TRUSTED_TYPES_POLICY: policy
    });
  } else {
    trustedHTML = DOMPurify.sanitize(resultMessage);
  }

  resultElement.textContent = trustedHTML;

  // Styling
  resultElement.style.color = isPassed ? '#28a745' : '#ff6347';
  resultElement.style.fontSize = '1.5rem';
  resultElement.style.lineHeight = '2';

  retryBtn.disabled = isPassed;
  retryBtn.style.display = isPassed ? 'none' : 'inline-block';

  document.getElementById('quiz-page')?.classList.remove('active');
  document.getElementById('result-page')?.classList.add('active');

  if (!isPassed) return;

  const username = await requestUsername();
  if (!username) return;

  try {
    await fetch('/api/quiz/results', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, score, total, timeSpent: formattedTime, isPassed })
    });
  } catch (err) {
    console.error('Failed to save username', err);
  }
}

document.getElementById('submit-btn').addEventListener('click', showResultPage);

// Function to shuffle the questions array
function shuffleQuestions() {
    for (let i = quizData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [quizData[i], quizData[j]] = [quizData[j], quizData[i]]; // Swap
    }
}

const errorModal = document.getElementById('signin-error-modal');
const errorMessage = document.getElementById('error-message');
const closeErrorBtn = document.getElementById('close-error-btn');

closeErrorBtn.addEventListener('click', () => {
  errorModal.classList.add('hidden'); // hide modal on close
});

document.getElementById('signin-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const email = document.getElementById('signin-username').value.trim();
  const password = document.getElementById('signin-password').value.trim();

  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      const loadingEntry = document.createElement('div');
      loadingEntry.id = 'loading-spinner';

      const spinner = document.createElement('div');
      spinner.className = 'spinner-roll';

      const text = document.createElement('p');
      text.textContent = 'Loading your quiz...';

      loadingEntry.appendChild(spinner);
      loadingEntry.appendChild(text);
      document.body.appendChild(loadingEntry);

      try {
        await Promise.all([
          fetchQuizDataAndStart(),
          loadUser()
        ]);
      } finally {
        loadingEntry.remove();
      }
    } else {
      errorMessage.textContent = data.message || 'Login failed';
      errorModal.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Error:', err);
    errorMessage.textContent = 'Network or server error: ' + err.message;
    errorModal.classList.remove('hidden');
  }
});

// Users email
async function loadUser() {
  try {
    const res = await fetch('/api/quiz/users', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },

      credentials: 'include' // sends cookies
    });

    const user = await res.json();
    if (!res.ok) {
      // User is not logged in or token invalid
      document.getElementById("greet-message").innerText = "You are not logged in.";
      return;
    }
    document.getElementById("greet-message").innerText =
      `Welcome back, ${user.email.split("@")[0]}!`;

  } catch (err) {
    console.error('Error loading user:', err);
    document.getElementById("greet-message").innerText =
      "Something went wrong.";
  }
}

// Run on page load
window.addEventListener('DOMContentLoaded', loadUser);

//signup for Users
document.getElementById('signup-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value;
  const signupPrompt = document.getElementById('signupPromptMsg');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!email || !emailRegex.test(email)) {
    signupPrompt.style.color = '#e7903c';
    signupPrompt.textContent = 'Please enter a valid email address.';
    return;
  }

  if (!password || !strongPasswordRegex.test(password)) {
    signupPrompt.style.color = '#e7903c';
    signupPrompt.textContent =
      'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.';
    return;
  }

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log('Signup response:', data);

    if (response.ok) {
      signupPrompt.style.color = 'green';
      signupPrompt.textContent =
        'Signup successful! Please check your email to verify your account.';
      this.reset();
    } else {
      signupPrompt.style.color = '#e7903c';
      signupPrompt.textContent = data.message || 'Failed to sign up';
    }
  } catch (err) {
    signupPrompt.style.color = '#e7903c';
    signupPrompt.textContent = 'Network error';
    console.error(err);
  }
});


// Toggle show/hide password for sign-up
document.getElementById('password-if').addEventListener('change', function() {
    const passwordField = document.getElementById('signup-password');
    if (this.checked) {
        passwordField.type = 'text';  // Show the password
    } else {
        passwordField.type = 'password';  // Hide the password
    }
});

// Toggle show/hide password for sign-In
document.getElementById('signIn-password-if').addEventListener('change', function() {
    const passwordFieldIn = document.getElementById('signin-password');
    if (this.checked) {
        passwordFieldIn.type = 'text';  // Show the password
    } else {
        passwordFieldIn.type = 'password';  // Hide the password
    }
});

//prev and next btns
document.getElementById('next-btn').addEventListener('click', function() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (selectedOption) {
        userAnswers[currentQuestionIndex] = selectedOption.value;
    }
    currentQuestionIndex++;
    if (currentQuestionIndex >= quizData.length) {
        currentQuestionIndex = quizData.length - 1;
        document.getElementById('next-btn').disabled = true; // Disable Next on last question
    }
    fetchQuestion();
    document.getElementById('prev-btn').disabled = false;
});

document.getElementById('prev-btn').addEventListener('click', function () {
    currentQuestionIndex--;
    if (currentQuestionIndex <= 0) {
        currentQuestionIndex = 0;
        this.disabled = true; // Disable Previous on first question
    }

    fetchQuestion(); // Re-load the updated question

    // Always enable Next if not on last
    if (currentQuestionIndex < quizData.length - 1) {
        document.getElementById('next-btn').disabled = false;
    }
});

// User logout
let logoutTimerUser;
const INACTIVITY_LIMIT = 3 * 60 * 1000; // 3 minutes

/* eslint-disable-next-line no-unused-vars */
let isAutoLogout = false;

function resetTimer() {
  clearTimeout(logoutTimerUser);
  logoutTimerUser = setTimeout(() => {
     isAutoLogout = true;
     logoutUser();
  }, INACTIVITY_LIMIT);
}

function logoutUser() {
  fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include' // important for sending cookies
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    return response.json();
  })
  .then(data => {
    console.log(data.message); // "Logout successful"
    // Optional: redirect to login or home page
    window.location.href = '/';
  })
  .catch(error => {
    console.error('Error during logout:', error);
  });
  // Logout logic reset for next session
  isAutoLogout = false;
}
// Buttons for users logout
  const logoutBtn = document.getElementById('user-logout');
  const userLogoutBtn = document.getElementById('user-logout-result');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }
  if (userLogoutBtn) {
    userLogoutBtn.addEventListener('click', logoutUser);
  }


// Track user activity
window.onload = resetTimer;
document.onmousemove = resetTimer;
document.onkeydown = resetTimer;
document.onclick = resetTimer;
document.onscroll = resetTimer;

document.getElementById('retry-btn').addEventListener('click', function() {
  // Reset quiz state
  currentQuestionIndex = 0;
  userAnswers = [];
  shuffleQuestions();
  fetchQuestion();

  // Show quiz page
  const quizPage = document.getElementById('quiz-page');
  quizPage.classList.add('active');

  // Hide result page and its children
  const resultPage = document.getElementById('result-page');
  if (resultPage) resultPage.style.display = 'none';

  // Hide any result-specific buttons explicitly
  const retryBtn = document.getElementById('retry-btn');
  if (retryBtn) retryBtn.style.display = 'none';
  const logoutBtn = document.getElementById('user-logout-result');
  if (logoutBtn) logoutBtn.style.display = 'none';

  // Optional: reset result page header
  const resultHeader = resultPage.querySelector('h2');
  if (resultHeader) resultHeader.style.display = 'none';
});


//for mobile scroll for all portrait content to show and landscape all content to show
  function setViewportHeight() {
    const veiwHeight = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${veiwHeight}px`);
  }
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);


window.onload = function() {
    showSignIn();
    document.getElementById('signin-username').focus();
};


