const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const cron = require('node-cron');
const emailjs = require('emailjs-com');

const app = express();
app.use(express.json());
app.use(express.static('.'));

const USER_FILE = './user.json';
const SECRET_KEY = 'YOUR_SECRET_KEY'; // change to a strong secret

// --- EmailJS configuration ---
const SERVICE_ID = 'service_5hj0odj';       // replace with your EmailJS service ID
const TEMPLATE_ID = 'template_wy4233a';     // replace with your EmailJS template ID
const USER_ID = 'tTUQN847BmqEqGeuV';          // replace with your EmailJS public key
const TO_NAME = 'Branvee bets';                // recipient name
const TO_EMAIL = 'commandofamere@gmail.com';  // recipient email

// --- Helper functions ---
function loadUser() {
  if (!fs.existsSync(USER_FILE)) {
    fs.writeFileSync(USER_FILE, JSON.stringify({ dailyPasswordHash: "", lastGenerated: "", plainPassword: "" }));
  }
  return JSON.parse(fs.readFileSync(USER_FILE));
}

function saveUser(user) {
  fs.writeFileSync(USER_FILE, JSON.stringify(user, null, 2));
}

function generateRandomPassword(length = 16) {
  return crypto.randomBytes(Math.ceil(length*3/4))
    .toString('base64')
    .replace(/\+/g,'A')
    .replace(/\//g,'B')
    .slice(0,length);
}

// --- Generate daily password ---
async function generateDailyPassword() {
  const pwd = generateRandomPassword();
  const hash = await bcrypt.hash(pwd, 10);
  const user = loadUser();
  user.dailyPasswordHash = hash;
  user.lastGenerated = new Date().toISOString();
  user.plainPassword = pwd; // store plaintext for email & reference
  saveUser(user);
  console.log("Today's password is:", pwd);

  // Send email
  await sendPasswordEmail(pwd);
}

// --- Send password email ---
async function sendPasswordEmail(password) {
  try {
    const templateParams = {
      to_name: TO_NAME,
      password: password
    };
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
    console.log('Daily password email sent!');
  } catch (err) {
    console.error('Email sending error:', err);
  }
}

// --- Run once on server start ---
(async () => {
  const user = loadUser();
  if (!user.dailyPasswordHash) await generateDailyPassword();
})();

// --- Schedule daily password generation at 00:00 ---
cron.schedule('0 0 * * *', async () => {
  console.log('Generating new daily password...');
  await generateDailyPassword();
});

// --- Routes ---
app.get('/', (req, res) => res.sendFile(__dirname + '/login.html'));

app.post('/user/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });

    const user = loadUser();
    const match = await bcrypt.compare(password, user.dailyPasswordHash);
    if (!match) return res.status(401).json({ error: 'Invalid password' });

    res.json({ ok: true });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/matches', (req, res) => res.sendFile(__dirname + '/matches.html'));

// --- Secure page to view today's password ---
app.get('/today-password', (req, res) => {
  const user = loadUser();
  const key = req.query.key;
  if (key !== SECRET_KEY) return res.status(403).send('Forbidden');

  res.send(`
    <html>
      <head>
        <title>Today's Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; text-align:center; margin-top:50px;">
        <h1>Yamaalfixed1x2</h1>
        <p><strong>Today's Password:</strong></p>
        <h2 style="color:blue;">${user.plainPassword}</h2>
      </body>
    </html>
  `);
});

// --- Start server ---
app.listen(3000, () => console.log('Server running on http://localhost:3000'));