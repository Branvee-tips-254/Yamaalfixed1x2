const emailjs = require('emailjs-com');
const fs = require('fs');

const USER_FILE = './user.json';

// Load current password
function loadUser() {
  if (!fs.existsSync(USER_FILE)) return null;
  return JSON.parse(fs.readFileSync(USER_FILE));
}

// Send email function
function sendDailyPasswordEmail() {
  const user = loadUser();
  if (!user || !user.dailyPasswordHash) return;

  // Get the plaintext password (for testing, normally you'd store it temporarily)
  const password = user.plainTextPassword; // see note below

  // Replace these with your EmailJS info
  const serviceID = 'service_5hj0odj';
  const templateID = 'template_wy4233a';
  const userID = 'tTUQN847BmqEqGeuV';

  const templateParams = {
    password: password
  };

  emailjs.send(serviceID, templateID, templateParams, userID)
    .then(() => console.log('Daily password email sent!'))
    .catch(err => console.error('Email sending error:', err));
}

module.exports = { sendDailyPasswordEmail };