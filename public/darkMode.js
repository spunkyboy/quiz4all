document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
  
    if (!darkModeToggle) {
      console.error('Dark mode button not found');
      return;
    }
  
    if (localStorage.getItem('darkMode') === 'enabled') {
      document.body.classList.add('dark-mode');
      darkModeToggle.textContent = '☀️ Light Mode';
    }
  
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
  
      const enabled = document.body.classList.contains('dark-mode');
  
      localStorage.setItem('darkMode', enabled ? 'enabled' : 'disabled');
      darkModeToggle.textContent = enabled ? '☀️ Light Mode' : '🌙 Dark Mode';
  
      console.log('Dark mode enabled:', enabled);
    });
  });