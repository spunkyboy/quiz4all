// Element
const modal = document.getElementById('messageModal');
const closeModalBtn = document.getElementById('closeModal');
const resultMsg = document.getElementById('resultMsg');
const questAdd = document.getElementById('questAdd');

function showModal(message1 = '', message2 = '') {
  resultMsg.textContent = message1;
  questAdd.textContent = message2;
  modal.classList.add('show');

  // Optional auto-hide after 3 seconds
  setTimeout(() => modal.classList.remove('show'), 3000);
}

// Close button
closeModalBtn.addEventListener('click', () => {
  modal.classList.remove('show');
});
