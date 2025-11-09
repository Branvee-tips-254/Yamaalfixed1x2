document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.querySelector('.login-container button');
  const passwordInput = document.querySelector('input[type="password"]');

  loginButton.addEventListener('click', async () => {
    const password = passwordInput.value.trim();
    if (!password) {
      alert('Please enter the password.');
      return;
    }

    try {
      const response = await fetch('/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      if (data.ok) {
        alert('Login successful!');
        window.location.href = '/matches'; // Redirect to matches page
      } else {
        alert(data.error || 'Invalid password.');
      }
    } catch (err) {
      console.error(err);
      alert('Server error. Try again later.');
    }
  });
});