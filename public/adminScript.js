// Elements
const loadQuestionsBtn = document.getElementById('loadQuestionsBtn');
const questionsContainer = document.getElementById('questionsContainer');
const form = document.getElementById('quizForm');
const resultMsg = document.getElementById('resultMsg');
const questAdd = document.getElementById('questAdd');
const loadResultsBtn = document.getElementById('loadResultsBtn');
const resultsContainer = document.getElementById('resultsContainer');
const logoutBtnAdmin = document.getElementById('logoutBtnAdmin');

//  Inactivity Auto Logout 
let logoutTimerAdmin;
const INACTIVITY_LIMIT = 3 * 60 * 1000; // 3 minutes
let isAutoAdminLogout = false;

function resetTimer() {
    clearTimeout(logoutTimerAdmin);
    logoutTimerAdmin = setTimeout(() => {
        isAutoAdminLogout = true;
        logoutAdmin();
    }, INACTIVITY_LIMIT);
}
// Logout function Admin
function logoutAdmin() {
    if (isAutoAdminLogout) {
        alert("You have been logged out due to inactivity.");
    }
    fetch('/api/auth/admin/logout', {
        method: 'POST',
        credentials: 'include',
    }).finally(() => {
        window.location.href = '/admin/signin';
    });
}

// Event listeners for logout and activity
if (logoutBtnAdmin) logoutBtnAdmin.addEventListener('click', logoutAdmin);

// Reset timer
window.onload = resetTimer;
document.onmousemove = resetTimer;
document.onkeydown = resetTimer;
document.onclick = resetTimer;
document.onscroll = resetTimer;

//  Load Questions 
async function loadQuestions() {
    // Show spinner
    questionsContainer.innerHTML = `
        <div id='loading-spinner'>
            <div class='spinner-roll'></div>
            <p style="margin: 2rem 0rem;">Loading Questions...</p>
        </div>
    `;
    resultMsg.textContent = '';

    try {
        const res = await fetch('/api/questions', {
            credentials: 'include',
        });

        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const { success, data: questions } = await res.json();
        if (!success) throw new Error('Failed to fetch questions');

        // Display questions
        questionsContainer.innerHTML = '<h2 style="text-align:center; margin:2rem 0;">Current Questions</h2>';

        if (!questions.length) {
            questionsContainer.innerHTML += '<p>No questions yet.</p>';
            return;
        }

        questions.forEach(q => {
            const div = document.createElement('div');
            div.style.border = '1px solid #ccc';
            div.style.padding = '0.5rem';
            div.style.margin = '0.5rem 0';
            div.innerHTML = `
                <strong>Q:</strong> ${q.question}<br/>
                <strong>Options:</strong> ${q.options.join(', ')}<br/>
                <strong>Answer:</strong> ${q.answer}<br/>
                <button data-id="${q._id}">Delete</button>
            `;

// Delete button
 const deleteButton = div.querySelector('button');
            deleteButton.addEventListener('click', async () => {
                
                const confirmResult = await Swal.fire({
                    title: 'Are you sure?',
                    text: 'This will permanently delete the question.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete it!'
                });

                if (confirmResult.isConfirmed) {
                    try {
                        const deleteRes = await fetch(`/api/questions/${q._id}`, {
                            method: 'DELETE',
                            credentials: 'include'
                        });
                        if (!deleteRes.ok) throw new Error('Failed to delete');

                        await Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'The question has been removed.',
                            timer: 1500,
                            showConfirmButton: false
                        });

                        loadQuestions();        // Refresh questions
                        refreshAdminStats();    // Refresh quiz count
                    } catch (err) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error deleting',
                            text: err.message || 'Something went wrong.'
                        });
                    }
                }
            });

            questionsContainer.appendChild(div);
        });

    } catch (error) {
        questionsContainer.innerHTML = '';
        resultMsg.style.color = 'red';
        resultMsg.textContent = 'Error loading questions: ' + error.message;
        console.error(error);
    }
}

loadQuestionsBtn.addEventListener('click', loadQuestions);

//  Add New Question 
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const question = document.getElementById('question').value.trim();
    const optionsInput = document.getElementById('options').value.trim();
    const answer = document.getElementById('answer').value.trim();
    const options = optionsInput.split(',').map(opt => opt.trim());

    try {
        const res = await fetch('/api/questions', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, options, answer }),
        });

        const data = await res.json();
        if (res.ok) {
            questAdd.style.color = '#30E877';
            questAdd.textContent = data.message;
            form.reset();
            loadQuestions();
            refreshAdminStats();
        } else {
            questAdd.style.color = '#ee2323';
            questAdd.textContent = data.message || 'Failed to add question';
        }
    } catch (error) {
        questAdd.style.color = '#ee2323';
        questAdd.textContent = 'Error: ' + error.message;
    }
});

//  Load User Results 
loadResultsBtn.addEventListener('click', async () => {
    resultsContainer.innerHTML = `
        <div id='loading-spinner'>
            <h2 class='spinner-roll'></h2>
            <p style="margin: 2rem 0rem;">Loading Results...</p>
        </div>
    `;
        try {
            const res = await fetch('/api/results', {
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const { data: results } = await res.json();

            resultsContainer.innerHTML = '<h2 style="margin:2rem 0;">User Results</h2>';

            if (!Array.isArray(results) || results.length === 0) {
                resultsContainer.innerHTML += '<p>No results yet.</p>';
                return;
            }

            results.forEach(result => {
                const status = result.isPassed ? '✅ Pass' : '❌ Fail';
                const div = document.createElement('div');
                div.style.border = '1px solid #ccc';
                div.style.padding = '0.5rem';
                div.style.margin = '0.5rem 0';

                const dateResult = new Date(result.date).toLocaleString();
                div.innerHTML = `
                    <div class='allResultInfomation'>
                        <strong>User:</strong> ${result.username}<br/>
                        <strong>Score:</strong> ${result.score} / ${result.total}<br/>
                        <strong>Status:</strong> ${status}<br/>
                        <strong>Time:</strong> ${result.timeSpent || 'N/A'}<br/>
                        <strong>Date:</strong> ${dateResult}
                    </div>
                `;
                resultsContainer.appendChild(div);
            });

        } catch (err) {
            resultsContainer.innerHTML = '<p style="color:red;">Error loading results</p>';
            console.error(err);
        }
});


//  Refresh Quiz Count
async function refreshAdminStats() {
    try {
      const res = await fetch('/api/questions/count', {
        method: 'GET',
        credentials: 'include'
      });
  
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
  
      const { countUpDown, limit } = await res.json();
  
      document.getElementById('quizCount').innerText =
        `${countUpDown} / ${limit} quizzes`;
  
      document.getElementById('limitWarning').style.display =
        countUpDown >= limit ? 'block' : 'none';
  
    } catch (err) {
      console.error('Error fetching quiz count:', err.message);
    }
  }
  
