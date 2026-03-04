
// Toggle show/hide password for sign-In
document.getElementById('show-password').addEventListener('change', function() {
const passwordField = document.getElementById('password');
const confirmPasswordField = document.getElementById('confirmPassword');

if (this.checked) {
  passwordField.type = 'text';
  confirmPasswordField.type = 'text';
} else {
  passwordField.type = 'password';
  confirmPasswordField.type = 'password';
}
});
